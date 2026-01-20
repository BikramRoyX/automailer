
import { db } from "@/lib/db"

async function main() {
    console.log("Cleaning up Test Data (example.com) from Global HR List...")
    console.log("------------------------------------------------")

    const result = await db.globalHrList.deleteMany({
        where: {
            OR: [
                { email: { contains: '@example.com' } },
                { domain: 'example.com' }
            ]
        }
    })

    console.log(`Deleted ${result.count} test entries.`)
    console.log("------------------------------------------------")

    const remaining = await db.globalHrList.count()
    console.log(`Remaining valid contacts: ${remaining}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await db.$disconnect())
