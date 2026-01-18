import { db } from "@/lib/db"
import crypto from 'crypto'

async function backfillLogs() {
    try {
        const users = await db.user.findMany({
            include: { profile: true }
        })

        console.log(`Checking ${users.length} users for missing logs...`)

        for (const user of users) {
            // Determine applied role
            let userTitle = "Software Developer"
            if (user.profile?.preferredField) {
                userTitle = `${user.profile.preferredField} Developer`
            } else if (user.profile?.experienceLevel === "Internship") {
                userTitle = "Software Intern"
            }

            const sentContacts = await db.contact.findMany({
                where: { userId: user.id, status: 'sent' }
            })

            console.log(`User ${user.email}: Found ${sentContacts.length} sent contacts.`)

            let backfilledCount = 0;

            for (const contact of sentContacts) {
                // Check if log exists (approximate match by email in message)
                const exists = await db.log.findFirst({
                    where: {
                        userId: user.id,
                        type: 'email_sent',
                        message: { contains: contact.email }
                    }
                })

                if (!exists) {
                    const logId = crypto.randomUUID()
                    const timestamp = contact.createdAt // Use contact creation time
                    const message = `Sent to ${contact.email} with resume`

                    // Use Raw SQL to bypass potential stale client types
                    await db.$executeRaw`
                    INSERT INTO Log (id, userId, type, message, appliedRole, timestamp)
                    VALUES (${logId}, ${user.id}, 'email_sent', ${message}, ${userTitle}, ${timestamp})
                `
                    backfilledCount++
                }
            }

            if (backfilledCount > 0) {
                console.log(`  -> Backfilled ${backfilledCount} logs as '${userTitle}'.`)
            } else {
                console.log(`  -> No missing logs.`)
            }
        }

    } catch (error) {
        console.error("Error:", error)
    }
}

backfillLogs()
