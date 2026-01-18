import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import nodemailer from "nodemailer";
import { readFile } from "fs/promises";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const { name, templates, subject } = await req.json();
        // Validate inputs

        // 1. Get SMTP Config
        const config = await db.smtpConfig.findUnique({ where: { userId: session.user.id } });
        if (!config || !config.verified) {
            return NextResponse.json({ message: "SMTP not configured or verified." }, { status: 400 });
        }

        // 2. Get Resume
        const user = await db.user.findUnique({ where: { id: session.user.id } });
        const resumePath = user?.resumePath;
        const resumeName = user?.resumeName || "resume.pdf";

        if (!resumePath) {
            return NextResponse.json({ message: "Resume not uploaded." }, { status: 400 });
        }

        // 3. Create Campaign Record
        const campaign = await db.campaign.create({
            data: {
                userId: session.user.id,
                name: name,
                status: "running",
                stats: JSON.stringify({ sent: 0, failed: 0 })
            }
        });

        // 4. Fetch Contacts (Batch size limited to 10 for demo/safeguard, or ALL? Spec says "Daily send limit hard cap")
        // implementation: Fetch all fresh, loop, stop if limit reached.
        // For V1, let's process 5 emails in this request to avoid timeout, and tell client to "continue"?
        // Or just process a small batch. 
        // I'll try to process up to 10.
        const BATCH_SIZE = 10;

        // Check Daily Limit logic
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sentToday = await db.log.count({
            where: {
                userId: session.user.id,
                type: "email_sent",
                timestamp: { gte: today }
            }
        });

        const DAILY_LIMIT = 20;
        if (sentToday >= DAILY_LIMIT) {
            return NextResponse.json({ message: "Daily limit reached.", limit: DAILY_LIMIT }, { status: 403 });
        }

        const contacts = await db.contact.findMany({
            where: { userId: session.user.id, status: "fresh" },
            take: BATCH_SIZE
        });

        if (contacts.length === 0) {
            return NextResponse.json({ message: "No fresh contacts to email.", campaignId: campaign.id }, { status: 200 });
        }

        // 5. Setup Transporter
        const rawPass = decrypt(config.pass);
        const transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.port === 465,
            auth: { user: config.user, pass: rawPass },
            tls: { rejectUnauthorized: false }
        });

        // Read resume file once
        let resumeBuffer;
        try {
            resumeBuffer = await readFile(resumePath);
        } catch (e) {
            return NextResponse.json({ message: "Resume file missing on server." }, { status: 500 });
        }

        // 6. Send Loop
        let sentCount = 0;
        let failedCount = 0;

        for (const contact of contacts) {
            // Double check limit inside loop
            if (sentToday + sentCount >= DAILY_LIMIT) break;

            try {
                const roleKey = Object.keys(templates).find(k => k.toLowerCase() === (contact.role || "general").toLowerCase())
                    || "General";
                let body = templates[roleKey] || templates["General"] || "";

                const name = contact.name || contact.email.split("@")[0];
                const company = contact.company || "your company";
                const senderName = config.user.split("@")[0]; // Use SMTP user as sender name

                // Parse Subject
                let subject = "Job Inquiry"; // Default fallback
                const subjectMatch = body.match(/^Subject:\s*(.+)(\r?\n|$)/);
                if (subjectMatch) {
                    subject = subjectMatch[1].trim();
                    body = body.replace(subjectMatch[0], "").trim();
                }

                body = body.replace(/\[Name\]/g, name)
                    .replace(/\[Company\]/g, company)
                    .replace(/\[Your Name\]/g, senderName)
                    .replace(/\[Your Email\]/g, config.user)
                    .replace(/\[Your Phone\]/g, ""); // Remove if not filled, or keep? Better to remove if it looks like a placeholder bracket? 
                // Actually, if the user edited the textarea in Step 1, the [Your Phone] string might already be gone/replaced by them.
                // But if they left it, we should probably strip it or replace with something.
                // Let's replace with empty string to avoid sending "[Your Phone]" literal text if they forgot.

                subject = subject.replace(/\[Name\]/g, name)
                    .replace(/\[Company\]/g, company);

                await transporter.sendMail({
                    from: config.user,
                    to: contact.email,
                    subject: subject,
                    text: body,
                    attachments: [{
                        filename: resumeName,
                        content: resumeBuffer
                    }]
                });

                await db.contact.update({
                    where: { id: contact.id },
                    data: { status: "sent" }
                });

                await db.log.create({
                    data: {
                        userId: session.user.id,
                        type: "email_sent",
                        message: `Sent to ${contact.email} (${contact.role})`
                    }
                });

                sentCount++;

                // Simple delay to be nice
                await new Promise(r => setTimeout(r, 1000));

            } catch (err: any) {
                console.error("Failed to send to", contact.email, err);
                failedCount++;
                await db.contact.update({
                    where: { id: contact.id },
                    data: {
                        status: "failed",
                        bounceDescription: err.message || "Unknown error"
                    }
                });
                await db.log.create({
                    data: {
                        userId: session.user.id,
                        type: "email_failed",
                        message: `Failed to send to ${contact.email}: ${err.message}`
                    }
                });
            }
        }

        // Update Campaign Stats
        await db.campaign.update({
            where: { id: campaign.id },
            data: {
                status: "completed", // For this batch
                stats: JSON.stringify({ sent: sentCount, failed: failedCount })
            }
        });

        return NextResponse.json({
            message: "Batch complete",
            sent: sentCount,
            failed: failedCount,
            campaignId: campaign.id
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Sending failed" }, { status: 500 });
    }
}
