"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendEmail } from "@/lib/gmail"
import { SafeAgent } from "@/lib/safe-agent"

export async function runAutoAgent() {
    const session = await getServerSession(authOptions)
    let accessToken = session?.accessToken

    // Fallback: Try fetching valid Google token from DB if missing in session
    if (!accessToken && session?.user?.email) {
        const account = await db.account.findFirst({
            where: {
                user: { email: session.user.email },
                provider: "google-gmail" // STRICT: Updated to google-gmail
            }
        })

        if (account?.access_token) {
            accessToken = account.access_token
        }
    }

    if (!accessToken || !session?.user?.email) {
        throw new Error("No connected Google Account found.")
    }

    // 1. Fetch User & Settings
    const user = await db.user.findUnique({
        where: { email: session.user.email },
        include: { templates: true, contacts: true } // Fetch all contacts to filter in memory or DB
    })

    if (!user) throw new Error("User not found")

    // Strict Limit Check
    const limit = 30 // HARD CAP from Safety Rules
    const { safe, reason } = await SafeAgent.checkSafety(user.id, limit)
    if (!safe) return { success: false, message: reason, sent: 0 }

    // 2. Fetch Resume
    let resumeBuffer: Buffer | null = null

    // Prefer DB storage (Serverless compatible)
    if (user.resumeData) {
        resumeBuffer = user.resumeData
    }
    // Legacy generic FS fallback (Development only)
    else if (user.resumePath && user.resumePath !== "stored_in_db") {
        try {
            const { readFile } = await import("fs/promises") // Dynamic import to avoid build errors on Edge if we move there
            const { join } = await import("path")
            const filePath = join(process.cwd(), "public", user.resumePath)
            resumeBuffer = await readFile(filePath)
        } catch (e) {
            console.error("Resume load failed from disk", e)
        }
    }

    // 3. Find ONE Target (Fresh, Valid)
    // We prioritize checking verification status
    const pendingContacts = user.contacts.filter(c => c.status === 'fresh')

    if (pendingContacts.length === 0) {
        return { success: true, message: "No fresh contacts to email.", sent: 0, completed: true }
    }

    // Process ONE contact ensuring safety
    const contact = pendingContacts[0]

    // VERIFICATION STEP
    const verification = SafeAgent.verifyEmail(contact.email)

    if (verification.status === 'invalid') {
        // Skip Permanently
        await db.contact.update({
            where: { id: contact.id },
            data: { status: 'invalid', bounceDescription: "Verification Failed: " + verification.reason }
        })
        await SafeAgent.logAction(user.id, "info", `Skipped ${contact.email}: ${verification.reason}`)
        return { success: true, message: `Skipped Invalid: ${contact.email}`, sent: 0 }
    }

    // Prepare Template
    let defaultTemplate = user.templates[0]

    // Auto-create default template if none exists
    if (!defaultTemplate) {
        defaultTemplate = await db.template.create({
            data: {
                userId: user.id,
                name: "Default Template",
                role: "HR",
                subject: "Application for {{role}}",
                body: "Hi {{name}},\n\nI recently came across the {{role}} opening at {{company}} and wanted to reach out directly.\n\nWith my background in software development and a passion for building scalable solutions, I believe I can bring immediate value to your team. I have attached my resume for your review.\n\nI would welcome the opportunity to discuss how my skills align with {{company}}'s goals.\n\nBest regards,\n[Your Name]"
            }
        })
    }

    try {
        // Personalize
        let body = defaultTemplate.body
            .replace(/{{name}}/g, contact.name || "there")
            .replace(/{{email}}/g, contact.email)
            .replace(/{{company}}/g, contact.company || "")
            .replace(/{{role}}/g, contact.role || "Hiring Manager")

        let subject = defaultTemplate.subject
            .replace(/{{role}}/g, contact.role || "this role")
            .replace(/{{company}}/g, contact.company || "")

        const attachments = []
        // Attach resume ONLY if not risky (Safety Rule 2: No attachment if domain is Exchange/Risky?? Rule said "if domain is Exchange". Simplified to: Risky = No attachment)
        if (verification.status !== 'risky' && resumeBuffer && user.resumeName) {
            attachments.push({
                filename: user.resumeName,
                contentType: "application/pdf",
                content: resumeBuffer
            })
        }

        // SEND
        try {
            await sendEmail(
                accessToken,
                contact.email,
                subject,
                body,
                attachments,
                user.name || "Candidate",
                user.email
            )
        } catch (error: any) {
            // RETRY LOGIC: Check for Auth Error
            if (error.message.includes("invalid authentication") || error.message.includes("401")) {
                console.log("Token expired. Attempting refresh...")
                // Fetch Refresh Token
                const account = await db.account.findFirst({
                    where: { user: { email: session.user.email }, provider: "google-gmail" }
                })

                if (account?.refresh_token) {
                    try {
                        const { refreshAccessToken } = await import("@/lib/gmail")
                        const newCreds = await refreshAccessToken(account.refresh_token)

                        if (newCreds.access_token) {
                            // Update DB
                            await db.account.update({
                                where: { id: account.id },
                                data: {
                                    access_token: newCreds.access_token,
                                    expires_at: Math.floor(Date.now() / 1000) + (newCreds.expiry_date ? Math.round((newCreds.expiry_date - Date.now()) / 1000) : 3600),
                                }
                            })

                            // Retry Send
                            await sendEmail(
                                newCreds.access_token,
                                contact.email,
                                subject,
                                body,
                                attachments,
                                user.name || "Candidate",
                                user.email
                            )
                            console.log("Retry successful with new token")
                        }
                    } catch (refreshError) {
                        console.error("Refresh failed", refreshError)
                        throw new Error("Authentication failed. Please reconnect Gmail.")
                    }
                } else {
                    throw new Error("Session expired. Please reconnect Gmail.")
                }
            } else {
                throw error
            }
        }

        // Update DB
        await db.contact.update({
            where: { id: contact.id },
            data: { status: 'sent' }
        })

        await SafeAgent.logAction(user.id, "email_sent", `Sent to ${contact.email} (${verification.status})`)

        return { success: true, message: `Sent to ${contact.email}`, sent: 1 }

    } catch (error: any) {
        console.error(`Failed to send to ${contact.email}`, error)

        // Log Failure
        await SafeAgent.logAction(user.id, "error", `Failed sending to ${contact.email}: ${error.message}`)

        await db.contact.update({
            where: { id: contact.id },
            data: {
                status: "failed",
                bounceDescription: error.message
            }
        })
        return { success: false, message: `Failed: ${error.message}`, sent: 0 }
    }
}
