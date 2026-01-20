
import { db } from "@/lib/db"

async function main() {
    console.log("Fetching User Private Contacts (Potential CSV Uploads)...")
    console.log("------------------------------------------------")

    const contacts = await db.contact.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: { userRel: { select: { email: true } } }
    })

    if (contacts.length === 0) {
        console.log("No private user contacts found.")
        return
    }

    contacts.forEach((c, index) => {
        console.log(`[${index + 1}] ${c.email} | Owner: ${c.userRel.email} | Status: ${c.status}`)
        if (c.sourceUrl) console.log(`    SourceURL: ${c.sourceUrl}`)
        if (c.company) console.log(`    Company: ${c.company}`)
        console.log("------------------------------------------------")
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await db.$disconnect())
