import { db } from "@/lib/db"

async function main() {
    console.log("Diagnosing All Users...")

    const users = await db.user.findMany({
        include: {
            _count: {
                select: { contacts: true, templates: true }
            }
        }
    })

    for (const u of users) {
        console.log("------------------------------------------------")
        console.log(`User: ${u.email}`)
        console.log(`ID: ${u.id}`)
        console.log(`Resume Path: ${u.resumePath || "NULL"}`)
        console.log(`Resume Name: ${u.resumeName || "NULL"}`)
        console.log(`Is Setup Complete: ${u.isSetupComplete}`)
        console.log(`Total Contacts: ${u._count.contacts}`)

        const freshCount = await db.contact.count({
            where: { userId: u.id, status: "fresh" }
        })
        console.log(`Fresh Contacts (Ready): ${freshCount}`)

        const sentCount = await db.contact.count({
            where: { userId: u.id, status: "sent" }
        })
        console.log(`Sent: ${sentCount}`)
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await db.$disconnect())
