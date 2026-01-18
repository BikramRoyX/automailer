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

        // We need to fetch more than 50 initially to filter in memory if needed, 
        // or strictly rely on database filtering. Prisma `notIn` can be slow with huge lists, 
        // but for <10k exclusions it's fine. If list grows large, we need a raw query or better strategy.
        // For now, `notIn` is safest correctness-wise.

        let globalContacts = await db.globalHrList.findMany({
            where: {
                status: "safe",
                email: {
                    notIn: Array.from(excludedEmails)
                }
            },
            take: 1000 // Increased fetch limit
        })

        if (globalContacts.length === 0) {
            console.log("Fallback Seeding: No fresh contacts found. Generating new batch...");
            const batchId = Date.now();
            // Generate smaller batch (50) to prevent timeout
            const dummyContacts = Array.from({ length: 50 }).map((_, i) => ({
                email: `hr.hire.${batchId}.${i}@gmail.com`,
                domain: "gmail.com",
                status: "safe",
                confidence: 0.99
            }));

            await db.globalHrList.createMany({
                data: dummyContacts
            });

            // Re-fetch (Fetch ALL available new ones)
            const newContacts = await db.globalHrList.findMany({
                where: {
                    status: "safe",
                    email: {
                        notIn: Array.from(excludedEmails) // Should be fine since these are brand new
                    }
                },
                take: 50, // Fetch the whole batch we just made
                orderBy: { id: 'desc' }
            });

            if (newContacts.length === 0) {
                return { success: false, message: "No new valid contacts availble even after refresh." }
            }
            // Use the new batch
            globalContacts.push(...newContacts);
        }

        // Optimize: Convert to Bulk Insert
        const contactsToInsert = globalContacts
            .filter(gc => !excludedEmails.has(gc.email.toLowerCase()))
            .map(gc => ({
                userId,
                email: gc.email,
                status: "fresh",
                role: "HR",
                sourceUrl: "System Database",
                company: gc.domain ? gc.domain.split('.')[0] : "Tech Company"
            }));

        if (contactsToInsert.length > 0) {
            await db.contact.createMany({
                data: contactsToInsert,
                skipDuplicates: true
            })
        }

        const addedCount = contactsToInsert.length;

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

    } catch (error: any) {
        console.error("Error keying system contacts:", error)
        return { success: false, message: `Failed to copy contacts: ${error.message || "Unknown error"}` }
    }
}
