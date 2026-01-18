
import { db } from "../lib/db"

async function reset() {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    console.log("Resetting email count for today:", startOfDay.toISOString())

    try {
        const { count } = await db.log.deleteMany({
            where: {
                type: "email_sent",
                timestamp: {
                    gte: startOfDay
                }
            }
        })
        console.log(`Reset complete. Deleted ${count} email logs from today.`)
    } catch (error) {
        console.error("Error resetting email count:", error)
    }
}

reset()
