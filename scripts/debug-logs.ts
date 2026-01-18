import { db } from "@/lib/db"

async function debugLogs() {
    try {
        const users = await db.user.findMany({ select: { id: true, email: true } })
        console.log(`Found ${users.length} users`)

        for (const user of users) {
            const contactSent = await db.contact.count({ where: { userId: user.id, status: 'sent' } })

            if (contactSent > 0) {
                console.log(`ACTIVE USER: ${user.email}`)
                console.log(`Sent Contacts: ${contactSent}`)

                const contacts = await db.contact.findMany({
                    where: { userId: user.id, status: 'sent' },
                    take: 5,
                    select: { title: true, createdAt: true }
                })
                console.log("Sample Timestamps:", contacts)
            }
        }

    } catch (error) {
        console.error("Error:", error)
    }
}

debugLogs()
