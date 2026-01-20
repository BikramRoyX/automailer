
import { db } from "@/lib/db"

async function main() {
    console.log("Fetching Bounced Emails Report...")
    console.log("------------------------------------------------")

    // 1. Global Bounces (Blacklist)
    const globalBounces = await db.globalBounce.findMany({ select: { email: true, reason: true, createdAt: true } })
    console.log(`Global Bounce Blacklist: ${globalBounces.length} entries`)
    globalBounces.forEach(b => console.log(`  [Global] ${b.email} | Reason: ${b.reason || 'N/A'}`))

    if (globalBounces.length > 0) console.log("-".repeat(20))

    // 2. Local Contact Bounces
    const contactBounces = await db.contact.findMany({
        where: { status: 'bounced' },
        select: { email: true, bounceDescription: true }
    })
    console.log(`User Contact Bounces: ${contactBounces.length} entries`)
    contactBounces.forEach(c => console.log(`  [Contact] ${c.email} | Reason: ${c.bounceDescription || 'N/A'}`))

    if (contactBounces.length > 0) console.log("-".repeat(20))

    // 3. Community List Bounces
    const communityBounces = await db.globalHrList.findMany({
        where: { status: 'bounced' },
        select: { email: true }
    })
    console.log(`Community Database Bounces: ${communityBounces.length} entries`)
    communityBounces.forEach(c => console.log(`  [Community] ${c.email}`))

    console.log("------------------------------------------------")
}

main()
    .catch(e => console.error(e))
    .finally(async () => await db.$disconnect())
