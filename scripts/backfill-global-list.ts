import { db } from "@/lib/db"

async function main() {
    console.log("Backfilling GlobalHrList from Contacts...")

    const contacts = await db.contact.findMany()
    console.log(`Found ${contacts.length} existing contacts.`)

    let added = 0
    for (const c of contacts) {
        if (c.email && c.email.includes('@')) {
            const domain = c.email.split('@')[1].toLowerCase()

            await db.globalHrList.upsert({
                where: { email: c.email },
                update: { status: "safe" }, // Force safe for demo
                create: {
                    email: c.email,
                    domain: domain,
                    status: "safe", // Force safe so it's pickable
                    source: "backfill"
                }
            })
            added++
        }
    }

    console.log(`Backfilled ${added} contacts to GlobalHrList.`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await db.$disconnect())
