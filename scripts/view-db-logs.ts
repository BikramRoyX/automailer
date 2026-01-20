
import { db } from "@/lib/db"

async function main() {
    console.log("Fetching Recent Application Logs...")
    console.log("------------------------------------------------")

    const logs = await db.log.findMany({
        take: 20,
        orderBy: { timestamp: 'desc' },
        include: { user: { select: { email: true } } }
    })

    if (logs.length === 0) {
        console.log("No logs found in the database.")
        return
    }

    logs.forEach((log, index) => {
        console.log(`[${index + 1}] ${log.timestamp.toISOString()} | ${log.type} | User: ${log.user.email}`)
        console.log(`    Message: ${log.message}`)
        if (log.appliedRole) console.log(`    Role: ${log.appliedRole}`)
        console.log("------------------------------------------------")
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await db.$disconnect())
