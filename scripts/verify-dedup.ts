const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function testQueryLogic() {
    const userId = "test-user-dedup"
    const targetEmail = "sent@example.com"
    const freshEmail = "fresh@example.com"

    console.log("--- Starting Deduplication Logic Test ---")

    try {
        // Cleaning up previous test data
        await db.contact.deleteMany({ where: { userId } })
        await db.sentEmail.deleteMany({ where: { userId } })
        await db.globalHrList.deleteMany({ where: { email: { in: [targetEmail, freshEmail] } } })

        // 1. Setup User
        await db.user.upsert({
            where: { email: "dedup@test.com" },
            update: { id: userId },
            create: { id: userId, email: "dedup@test.com", name: "Dedup Test" }
        })

        // 2. Add 'targetEmail' to SentEmail (Simulate we already sent to this person)
        await db.sentEmail.create({
            data: {
                userId,
                recipient: targetEmail,
                gmailMessageId: `msg-${Date.now()}`,
                status: 'SENT'
            }
        })

        // 3. Add both to GlobalHrList
        await db.globalHrList.create({ data: { email: targetEmail, domain: 'ex.com', status: 'safe', source: 'test' } })
        await db.globalHrList.create({ data: { email: freshEmail, domain: 'ex.com', status: 'safe', source: 'test' } })

        // 4. Run Exclusion Logic (Replicating app/actions/contacts.ts logic)

        // Fetch exclusion list
        const existingContacts = await db.contact.findMany({ where: { userId }, select: { email: true } })
        const previouslySent = await db.sentEmail.findMany({ where: { userId }, select: { recipient: true } })

        const excludedEmails = new Set([
            ...existingContacts.map(c => c.email.toLowerCase()),
            ...previouslySent.map(s => s.recipient.toLowerCase())
        ])

        console.log(`Excluded Count: ${excludedEmails.size} (Should be 1: sent@example.com)`)

        // Query Global List
        const globalContacts = await db.globalHrList.findMany({
            where: {
                status: "safe",
                email: {
                    notIn: Array.from(excludedEmails)
                }
            },
            take: 50
        })

        const fetchedEmails = globalContacts.map(c => c.email)
        console.log("Fetched Emails:", fetchedEmails)

        const hasTarget = fetchedEmails.includes(targetEmail)
        const hasFresh = fetchedEmails.includes(freshEmail)

        if (!hasTarget && hasFresh) {
            console.log("✅ SUCCESS: Previously sent email was EXCLUDED. Fresh email was INCLUDED.")
        } else {
            console.error("❌ FAILURE: Logic incorrect.")
            if (hasTarget) console.error(" - FAILED: Target (sent) email was returned.")
            if (!hasFresh) console.error(" - FAILED: Fresh email was NOT returned.")
            process.exit(1)
        }

    } catch (e) {
        console.error("Test Exception:", e)
        process.exit(1)
    } finally {
        await db.$disconnect()
    }
}

testQueryLogic()
