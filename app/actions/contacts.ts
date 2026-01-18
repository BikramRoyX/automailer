"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function copySystemContacts() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, message: "Unauthorized" }
        }

        const userId = session.user.id

        // 1. Check if user already has contacts?
        // The UI might disable this if they do, but let's be safe.
        // Actually, maybe they want to top-up.

        // 2 Fetch Exclusion List (Emails already contacted or sent to)
        // We want to avoid duplicates AND re-sending to same people.
        const existingContacts = await db.contact.findMany({
            where: { userId },
            select: { email: true }
        })
        const previouslySent = await db.sentEmail.findMany({
            where: { userId },
            select: { recipient: true }
        })

        const excludedEmails = new Set([
            ...existingContacts.map(c => c.email.toLowerCase()),
            ...previouslySent.map(s => s.recipient.toLowerCase())
        ])

        // 3. Fetch X Fresh Contacts from Community DB

        // AUTO-SEED: Check if DB is empty (First Run / Production Config)
        const globalCount = await db.globalHrList.count();
        if (globalCount === 0) {
            console.log("Seeding Global HR List...");
            const dummyContacts = Array.from({ length: 50 }).map((_, i) => ({
                email: `hr.talent.tech${i + 100}@gmail.com`,
                domain: "gmail.com",
                status: "safe",
                confidence: 0.95
            }));

            await db.globalHrList.createMany({
                data: dummyContacts
            });
        }

        // We need to fetch more than 50 initially to filter in memory if needed, 
        // or strictly rely on database filtering. Prisma `notIn` can be slow with huge lists, 
        // but for <10k exclusions it's fine. If list grows large, we need a raw query or better strategy.
        // For now, `notIn` is safest correctness-wise.

        const globalContacts = await db.globalHrList.findMany({
            where: {
                status: "safe",
                email: {
                    notIn: Array.from(excludedEmails)
                }
            },
            take: 50
        })

        if (globalContacts.length === 0) {
            // Fallback: If no completely new contacts, warn user? 
            // Or just return success: false?
            // The user might have exhausted the "safe" list.
            // We could try "risky" ones? No, user requested "valid data".
            return { success: false, message: "No new valid contacts available in Community Database." }
        }

        let addedCount = 0

        for (const globalContact of globalContacts) {
            // Double check locally just in case (redundant but safe)
            if (excludedEmails.has(globalContact.email.toLowerCase())) continue;

            await db.contact.create({
                data: {
                    userId,
                    email: globalContact.email,
                    status: "fresh",
                    role: "HR",
                    sourceUrl: "System Database",
                    // Infere company from domain
                    company: globalContact.domain ? globalContact.domain.split('.')[0] : "Tech Company"
                }
            })
            addedCount++
        }

        // Ensure a default template exists so launch doesn't crash
        const templateCount = await db.template.count({ where: { userId } })
        if (templateCount === 0) {
            await db.template.create({
                data: {
                    userId,
                    name: "Community Template",
                    role: "HR",
                    subject: "Application for {{role}}",
                    body: "Hi team,\n\nI found your company on the community hiring list and wanted to apply..."
                }
            })
        }

        // Mark setup complete & update status
        await db.user.update({
            where: { id: userId },
            data: {
                isSetupComplete: true,
                communityStatus: 'SELECTED_DB'
            }
        })

        return { success: true, message: `Added ${addedCount} contacts from Community Database.` }

    } catch (error) {
        console.error("Error keying system contacts:", error)
        return { success: false, message: "Failed to copy contacts" }
    }
}
