import { db } from "@/lib/db"

async function main() {
    console.log("Checking GlobalHrList...")

    const total = await db.globalHrList.count()
    console.log(`Total in GlobalHrList: ${total}`)

    const safe = await db.globalHrList.count({ where: { status: "safe" } })
    console.log(`Status 'safe': ${safe}`)

    const risky = await db.globalHrList.count({ where: { status: "risky" } })
    console.log(`Status 'risky': ${risky}`)

    const samples = await db.globalHrList.findMany({ take: 5 })
    console.log("Samples:", samples)

    // Also check if user has contacts in Contact table that could be migrated
    const totalContacts = await db.contact.count()
    console.log(`Total User Contacts (Private): ${totalContacts}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await db.$disconnect())
