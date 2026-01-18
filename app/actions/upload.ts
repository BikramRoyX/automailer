"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import Papa from "papaparse"

export async function uploadFile(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return { success: false, message: "Unauthorized" }
    }

    const file = formData.get("file") as File
    const type = formData.get("type") as string // "resume" or "csv"

    if (!file) {
        return { success: false, message: "No file provided" }
    }

    try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Update DB based on type
        if (type === 'resume') {
            await db.user.update({
                where: { email: session.user.email },
                data: {
                    resumeData: buffer, // Store file directly in DB
                    resumePath: "stored_in_db", // Placeholder
                    resumeName: file.name,
                    resumeStatus: 'UPLOADED'
                }
            })
            return { success: true, message: "Resume uploaded successfully!", filename: file.name }
        }

        if (type === 'csv') {
            const csvText = buffer.toString('utf-8')
            const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true })

            if (parsed.errors.length > 0) {
                console.warn("CSV Parse Errors:", parsed.errors)
            }

            const rows = parsed.data as any[]
            let count = 0
            let skipped = 0

            // Get User ID
            const user = await db.user.findUnique({ where: { email: session.user.email } })
            if (!user) throw new Error("User not found")

            // Regex for strict email validation
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

            let systemAddedCount = 0; // New tracker for notification

            for (const row of rows) {
                // Map fields flexibly
                let rawEmail = row.Email || row.email || row["Email Address"]
                const name = row.Name || row.name || row["Full Name"] || row["First Name"]
                const company = row.Company || row.company
                const role = row.Role || row.role || "Hiring Manager"

                // Allow user to specify the Target Role (e.g. "React Developer") in the CSV
                // This overrides the profile default for analytics and logs
                const detectedRole = row["Target Role"] || row["Position"] || row["Applied Role"] || row["Job Title"]

                if (rawEmail && typeof rawEmail === 'string') {
                    // 1. Normalize
                    const email = rawEmail.toLowerCase().trim()

                    // 2. Validate Format
                    if (!emailRegex.test(email)) {
                        skipped++
                        continue
                    }

                    // 3. Upsert Content (User's private list) - ALWAYS allow adding to own list
                    await db.contact.upsert({
                        where: {
                            userId_email: {
                                userId: user.id,
                                email: email
                            }
                        },
                        update: {
                            name, company, role, detectedRole, status: 'fresh'
                        },
                        create: {
                            userId: user.id,
                            email,
                            name,
                            company,
                            role,
                            detectedRole,
                            status: 'fresh'
                        }
                    })

                    // 4. Crowdsource to GlobalHrList (Community list)
                    // STRICTER LOGIC: Only add if it doesn't exist and looks like an HR/Recruiter
                    // AND acts as a valid, non-bounced email.
                    const isHrRole = /hr|recruiter|talent|hiring|people|founder|ceo/i.test(role)

                    if (isHrRole) {
                        try {
                            // Extract domain
                            const domain = email.split('@')[1]

                            // Check existence first
                            const existing = await db.globalHrList.findUnique({ where: { email } })

                            // Check Global Bounce Blacklist
                            const isBounced = await db.globalBounce.findUnique({
                                where: { email },
                                select: { isActive: true }
                            })

                            if (!existing && !isBounced?.isActive) {
                                await db.globalHrList.create({
                                    data: {
                                        email: email,
                                        domain: domain,
                                        status: "risky", // Default to risky until verified by bounce-checker
                                        source: "user_upload",
                                        industry: "Unknown"
                                    }
                                })
                                systemAddedCount++; // Increment count
                            }
                        } catch (err) {
                            // Ignore unique constraint errors silently
                        }
                    }

                    count++
                }
            }

            // Ensure a Default Template exists so the Agent doesn't crash
            const templateCount = await db.template.count({ where: { userId: user.id } })
            if (templateCount === 0) {
                await db.template.create({
                    data: {
                        userId: user.id,
                        name: "Default Template",
                        role: "HR", // Default role
                        subject: "Application for {{role}}",
                        body: "Hi {{name}},\n\nI recently came across the {{role}} opening at {{company}} and wanted to reach out directly.\n\nWith my background in software development and a passion for building scalable solutions, I believe I can bring immediate value to your team. I have attached my resume for your review.\n\nI would welcome the opportunity to discuss how my skills align with {{company}}'s goals.\n\nBest regards,\n[Your Name]"
                    }
                })
            }

            // Mark Setup Complete if we have contacts and a resume
            const updateData: any = { communityStatus: 'SELECTED_CSV' } // Uploading contacts counts as selecting a community
            if (user.resumePath) {
                updateData.isSetupComplete = true
            }

            await db.user.update({
                where: { id: user.id },
                data: updateData
            })

            return {
                success: true,
                message: `Contacts uploaded! Processed ${count} entries.`,
                count,
                systemAddedCount // Return this for frontend notification
            }
        }

        return { success: false, message: "Invalid type" }

    } catch (e: any) {
        console.error("Upload error:", e)
        return { success: false, message: e.message || "Upload failed" }
    }
}

export async function uploadResume(formData: FormData) {
    formData.set("type", "resume")
    return uploadFile(formData)
}

export async function uploadHrList(formData: FormData) {
    formData.set("type", "csv")
    return uploadFile(formData)
}
