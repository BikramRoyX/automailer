import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendEmail, refreshAccessToken } from "@/lib/gmail"
import { promises as fs } from "fs"
import path from "path"
import { resolveMx } from "dns/promises"
import crypto from "crypto"

export async function POST(req: Request) {
    let session: any;
    let contactId: string = "";
    let contact: any;

    try {
        session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        contactId = body.contactId
        const { subject, body: emailBody, targetRole } = body

        // 1. Fetch Contact to verify ownership
        contact = await db.contact.findUnique({
            where: { id: contactId, userId: session.user.id }
        })

        if (!contact) return new NextResponse("Contact not found", { status: 404 })

        // --- -1. DAILY LIMIT CHECK ---
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const countToday = await db.log.count({
            where: {
                userId: session.user.id,
                type: 'email_sent',
                timestamp: { gte: startOfDay }
            }
        });

        // Use dailyLimit from user or default 50
        // fetch user limit if not present in session (it usually isn't)
        // We already fetch 'user' later at line 97, but we need strictly checking limit FIRST to save resources.
        // Let's rely on a quick fetch or move the user fetch up.
        // Moving user fetch up is safer.

        // Actually, let's just do a quick fetch for limit strictly.
        const userLimitConfig = await db.user.findUnique({
            where: { id: session.user.id },
            select: { dailyLimit: true }
        })
        const limit = userLimitConfig?.dailyLimit || 50;

        if (countToday >= limit) {
            return new NextResponse(JSON.stringify({ error: `Daily limit of ${limit} reached. Resets at midnight.` }), { status: 422 })
        }

        // --- 0. DUPLICATE & RECENT SEND CHECK ---
        // A. Check specific Contact record status
        if (contact.status === 'sent') {
            return new NextResponse(JSON.stringify({ error: `Skipping: Already Sent` }), { status: 422 })
        }

        // B. Check GLOBAL SentEmail history for this user (Prevent re-sending to same email ever)
        // using findFirst to check existence
        const previousSend = await db.sentEmail.findFirst({
            where: {
                userId: session.user.id,
                recipient: contact.email,
                status: { in: ['SENT', 'DELIVERED'] } // Ignore BOUNCED? No, if bounced we catch it in global bounce check.
                // Actually, if it bounced, we might want to retry? The user said "jis mail id ko mail bhej chuka hai usko dobara mail naji bhejna hai"
                // This implies successful sends. Bounces are handled by the GlobalBounce check.
                // So here we check if we successfully sent it before.
            }
        })

        if (previousSend) {
            // Mark this new contact instance as 'sent' too so we don't query again next time
            await db.contact.update({
                where: { id: contactId },
                data: { status: 'sent', lastContactedAt: previousSend.sentAt } // Sync with original send time
            })
            return new NextResponse(JSON.stringify({ error: `Skipping: Already contacted on ${previousSend.sentAt.toLocaleDateString()}` }), { status: 422 })
        }

        if ((contact as any).lastContactedAt) {
            const last = new Date((contact as any).lastContactedAt).getTime()
            if (Date.now() - last < 30 * 24 * 60 * 60 * 1000) {
                return new NextResponse(JSON.stringify({ error: `Skipping: Contacted recently` }), { status: 422 })
            }
        }

        // --- 0.5 GLOBAL BOUNCE CHECK ---
        // Check if this email is in our global blacklist
        try {
            const bounce = await db.globalBounce.findUnique({
                where: { email: contact.email }
            });

            if (bounce && bounce.isActive) {
                await db.contact.update({
                    where: { id: contactId },
                    data: { status: 'bounced', bounceDescription: "Found in Global Bounce Blacklist" }
                })
                return new NextResponse(JSON.stringify({ error: `Skipping: Known Global Bounce` }), { status: 422 })
            }
        } catch (e) {
            console.error("Global Bounce Check Failed:", e)
        }

        // --- PRE-SEND VALIDATION: DNS & Typo Check ---
        const emailDomain = contact.email.split('@')[1] || ""

        // 1. Basic Format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(contact.email)) {
            await db.contact.update({
                where: { id: contactId },
                data: { status: "bounced", bounceDescription: "Invalid Email Format" }
            })
            return new NextResponse(JSON.stringify({ error: `Skipping: Invalid Format (@${emailDomain})` }), { status: 422 })
        }

        // 2. Typo Detection
        const typos = ['gmil.com', 'yaho.com', 'hotmial.com', 'gmai.com', 'outlok.com']
        if (typos.includes(emailDomain.toLowerCase())) {
            await db.contact.update({
                where: { id: contactId },
                data: { status: "bounced", bounceDescription: "Typo in Domain" }
            })
            return new NextResponse(JSON.stringify({ error: `Skipping: Typo Detected (@${emailDomain})` }), { status: 422 })
        }

        // Skip DNS Check for speed - rely on Gmail API
        // The previous DNS check was too aggressive and slow.

        // 2. Fetch Google Account AND User (separately for safety)
        // STRICT: We need the 'google-gmail' account for sending scopes.
        // We fetch all accounts and select the best one.
        const accounts = await db.account.findMany({
            where: {
                userId: session.user.id,
                provider: { in: ["google", "google-gmail"] }
            }
        })

        // Filter: Prefer google-gmail
        const account = accounts.find(a => a.provider === "google-gmail") || accounts.find(a => a.provider === "google");

        if (!account || !account.access_token) {
            return new NextResponse("Google account not connected", { status: 400 })
        }



        const user = await db.user.findUnique({
            where: { id: session.user.id },
            include: { profile: true } // Fetch profile for title fallback
        })

        if (!user) return new NextResponse("User field missing", { status: 404 })

        // --- DYNAMIC TEMPLATE ROTATION (SMART MATCHING) ---
        // "jo target role , experience level ho uski hissab se template show and mail usi template mai bhje"
        let finalSubject = subject;
        let finalBody = emailBody;

        try {
            const allTemplates = await db.template.findMany({
                where: { userId: session.user.id }
            });

            if (allTemplates.length > 0) {
                let pool = allTemplates;
                const normalize = (s: string) => s ? s.toLowerCase() : "";
                const target = normalize(targetRole || "");
                const userExp = normalize(user.profile?.experienceLevel || "");

                // 1. Keyword Matching (Role & Experience)
                // We split targetRole into words (e.g. "React Intern") -> ["react", "intern"]
                const keywords = target.split(/\s+/).filter(w => w.length > 2);

                // Add explicit experience keywords from user profile if targetRole is vague
                if (userExp.includes("intern") || userExp.includes("trainee")) keywords.push("intern", "trainee", "fresher");
                if (userExp.includes("senior") || userExp.includes("lead")) keywords.push("senior", "lead", "manager");

                if (keywords.length > 0) {
                    // Filter: Template MUST contain at least one major keyword if possible
                    // We also penalize mismatches (e.g. if target is "Intern", avoid "Senior")

                    const matches = allTemplates.filter(t => {
                        const content = normalize(t.name) + " " + normalize(t.subject);

                        // Strict Negatives
                        if (target.includes("intern") && content.includes("senior")) return false;
                        if (target.includes("senior") && content.includes("intern")) return false;
                        if (target.includes("trainee") && content.includes("lead")) return false;

                        // Positives: Does it match any keyword?
                        return keywords.some(k => content.includes(k));
                    });

                    if (matches.length > 0) {
                        // console.log(`Smart Match: Found ${matches.length} templates for '${targetRole}'`);
                        pool = matches;
                    }
                }

                // Pick a random template from the filtered pool
                const randomTemplate = pool[Math.floor(Math.random() * pool.length)];
                finalSubject = randomTemplate.subject || finalSubject;
                finalBody = randomTemplate.body || finalBody;
                // console.log(`Rotating: Selected '${randomTemplate.title}'`);
            }
        } catch (e) {
            console.error("Template rotation failed, using default", e);
        }

        if (!user) return new NextResponse("User field missing", { status: 404 })

        // --- RESUME VERIFICATION ---
        const resumePath = user.resumePath

        // Read the file (Optimized for Serverless)
        let resumeBuffer: Buffer;

        if (user.resumeData) {
            console.log("DEBUG: Using resume from DB");
            resumeBuffer = user.resumeData;
        } else if (resumePath && resumePath !== "stored_in_db") {
            try {
                // FIX: Resolve the path relative to "public" if it looks like a web path
                let finalPath = resumePath;
                if (resumePath.startsWith("/uploads") || resumePath.startsWith("uploads")) {
                    const cleanPath = resumePath.startsWith("/") ? resumePath.slice(1) : resumePath;
                    finalPath = path.join(process.cwd(), "public", cleanPath);
                }

                console.log("DEBUG: Reading resume from disk:", finalPath);
                resumeBuffer = await fs.readFile(finalPath);
            } catch (err) {
                console.error("Disk Read Error:", err);
                // Fallback legacy path
                const fallbackPath = path.join(process.cwd(), "uploads", session.user.id, "resume.pdf");
                try {
                    resumeBuffer = await fs.readFile(fallbackPath);
                } catch (fallbackErr) {
                    throw new Error(`Could not read resume. Verified path: '${resumePath}'`);
                }
            }
        } else {
            throw new Error("Resume content missing. Please re-upload your resume.");
        }

        let accessToken = account.access_token

        // 3. Simple Token Refresh Logic
        const now = Math.floor(Date.now() / 1000)
        if (account.expires_at && account.expires_at < now + 60) {
            // console.log("Token expired, refreshing...")
            if (account.refresh_token) {
                const newCreds = await refreshAccessToken(account.refresh_token)
                accessToken = newCreds.access_token || accessToken
                // Async update to not block
                db.account.update({
                    where: { id: account.id },
                    data: {
                        access_token: newCreds.access_token,
                        expires_at: newCreds.expiry_date ? Math.floor(newCreds.expiry_date / 1000) : undefined
                    }
                }).catch(console.error)
            }
        }

        // --- FETCH ACTUAL GMAIL ADDRESS (Optimistic) ---
        let senderEmail = session.user.email
        // We assume session email is correct to save time, unless we have no choice.
        // If we want absolute safety:
        /*
        try {
            const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            if (profileRes.ok) {
                const profile = await profileRes.json()
                if (profile.email) senderEmail = profile.email
            }
        } catch (e) { } 
        */

        // --- SMART VARIABLE REPLACEMENT ---
        let userTitle = "Software Developer"

        // Priority 1: Specific Role for this Contact (e.g. from scraping)
        if (contact.detectedRole) {
            userTitle = contact.detectedRole
        }
        // Priority 2: Role defined in the Template (e.g. "Python Dev")
        else if (targetRole && targetRole !== "General" && targetRole !== "HR") {
            userTitle = targetRole
        }
        // Priority 2: User's Global Preference (Profile)
        else if (user.profile?.preferredField) {
            const field = user.profile.preferredField
            userTitle = (field.includes("Developer") || field.includes("Engineer") || field.includes("Analyst")) ? field : `${field} Developer`
        }

        // 3. Strict Email Validation
        const strictEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!strictEmailRegex.test(contact.email)) {
            console.log(`❌ Invalid Email Format: ${contact.email}`)
            // Log as error but return 422 so frontend skips it
            await db.log.create({
                data: {
                    userId: user.id,
                    type: "error",
                    message: `Skipped Invalid Email: ${contact.email}`
                }
            })
            // Mark contact as Invalid so we don't try again
            await db.contact.update({
                where: { id: contactId },
                data: { status: "bounced", verificationStatus: "invalid", bounceDescription: "Invalid Format" }
            })
            return NextResponse.json({ error: "Invalid Email Format", skipped: true }, { status: 422 })
        }

        const replaceVars = (text: string) => {
            let content = text || "";

            // 2. Variable Replacement with Safeguards
            // Safe Replacements: If variable missing, provide generic fallback so email doesn't look broken.
            // e.g. "Dear ," -> "Dear there,"

            let safeName = contact.name || "there"
            // If name is just whitespace, fallback
            if (!safeName.trim()) safeName = "there"

            let safeCompany = contact.company || "your company"
            if (!safeCompany.trim()) safeCompany = "your company"

            // Standard Replacements
            content = content
                .replace(/{{name}}/g, safeName)
                .replace(/\[Name\]/g, safeName) // Legacy bracket support
                .replace(/{{company}}/g, safeCompany)
                .replace(/\[Company\]/g, safeCompany)
                .replace(/{{role}}/g, contact.role || "Hiring Manager")
                .replace(/\[My Role\]/gi, userTitle)
                .replace(/\[Role\]/gi, userTitle)
                .replace(/{{target_role}}/gi, userTitle);

            // Sender Details (Signature Enforcement)
            const senderName = session.user.name || "Candidate";
            const senderPhone = user.profile?.mobile || user.phoneNumber || "";

            content = content
                .replace(/{{sender_name}}/g, senderName)
                .replace(/{{sender_phone}}/g, senderPhone)
                .replace(/\[My Phone\]/g, senderPhone);

            return content;
        }

        // 4. Send Email
        const sentResult = await sendEmail(
            accessToken,
            contact.email,
            replaceVars(finalSubject),
            replaceVars(finalBody),
            [
                {
                    filename: "Resume.pdf",
                    content: resumeBuffer,
                    contentType: "application/pdf"
                }
            ],
            session.user.name || "Candidate",
            senderEmail || ""
        )

        // 5. Update Status (Sent + Timestamp)
        // Using updateRaw or cast to avoid TS errors on new fields
        await db.contact.update({
            where: { id: contactId },
            data: {
                status: "sent",
                // @ts-ignore: lastContactedAt might not be in generated types yet
                lastContactedAt: new Date()
            }
        })

        // 6. Log & Track (Wrapped in Try/Catch for Safety)
        try {
            const logId = crypto.randomUUID()
            const logTimestamp = new Date()

            await db.$transaction([
                // 6a. Main Log
                db.$executeRaw`
                    INSERT INTO Log (id, userId, type, message, appliedRole, timestamp)
                    VALUES (${logId}, ${session.user.id}, 'email_sent', ${`Sent to ${contact.email}`}, ${userTitle}, ${logTimestamp})
                `,
                // 6b. Bounce Tracking Record
                db.sentEmail.create({
                    data: {
                        userId: session.user.id,
                        recipient: contact.email,
                        subject: replaceVars(finalSubject),
                        gmailMessageId: sentResult.id!, // Critical for matching bounces
                        threadId: sentResult.threadId,
                        status: "SENT",
                        sentAt: logTimestamp
                    }
                })
            ])
        } catch (logErr) {
            // CRITICAL: Email sent but DB failed. Log to stderr.
            console.error("CRITICAL: EMAIL SENT BUT DB LOG FAILED", {
                email: contact.email,
                messageId: sentResult.id,
                error: logErr
            })
            // We do NOT throw here, so the user still gets a "success" response since the email effectively went out.
        }

        return NextResponse.json({ success: true, messageId: sentResult.id })

    } catch (error: any) {
        console.error("Send Error:", error)

        const errMsg = error.message || "Unknown Error"
        const isHardBounce = errMsg.includes("550") || errMsg.includes("User unknown") || errMsg.includes("Recipient address rejected")

        // Mark as bounced so it's removed from "Valid" list
        if (session?.user?.id && contactId) {
            await db.contact.update({
                where: { id: contactId },
                data: {
                    status: "bounced",
                    bounceDescription: errMsg
                }
            })

            // Add to Global Bounce if Hard Bounce
            if (isHardBounce) {
                try {
                    await db.globalBounce.create({
                        data: {
                            email: contact!.email,
                            reason: errMsg,
                            isActive: true
                        }
                    })
                } catch (e) {
                    // Unique constraint violation (already exists) - ignore
                }
            }
        }

        if (isHardBounce) {
            return new NextResponse(JSON.stringify({ error: `Skipping: Address Rejected (Hard Bounce)` }), { status: 422 })
        }

        return NextResponse.json({ error: errMsg }, { status: 500 })
    }
}
