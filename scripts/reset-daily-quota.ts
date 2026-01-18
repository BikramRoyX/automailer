
import { db } from "@/lib/db"

async function resetDailyQuota() {
    try {
        console.log("Starting GLOBAL daily quota reset...")

        // 1. Get ALL users
        const users = await db.user.findMany()
        console.log(`Found ${users.length} users.`)

        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const yesterday = new Date(startOfDay)
        yesterday.setDate(yesterday.getDate() - 1)

        for (const user of users) {
            console.log(`\nProcessing User: ${user.email} (ID: ${user.id})`)
            console.log(` - Current Limit: ${user.dailyLimit}`)

            // Count usage
            const usage = await db.log.count({
                where: {
                    userId: user.id,
                    type: "email_sent",
                    timestamp: { gte: startOfDay }
                }
            })
            console.log(` - Used Today: ${usage}`)

            // RESET LOGS
            if (usage > 0) {
                const updateResult = await db.log.updateMany({
                    where: {
                        userId: user.id,
                        type: "email_sent",
                        timestamp: { gte: startOfDay }
                    },
                    data: { timestamp: yesterday }
                })
                console.log(` - MOVED ${updateResult.count} logs to yesterday.`)
            } else {
                console.log(` - No usage to reset.`)
            }

            // INCREASE LIMIT IF LOW
            if (user.dailyLimit < 50) {
                await db.user.update({
                    where: { id: user.id },
                    data: { dailyLimit: 50 }
                })
                console.log(` - UPGRADED limit to 50.`)
            }

            // CLEAR ANY "LIMIT REACHED" ALERTS/LOGS?
            // Sometimes logs themselves might block logic? unlikely but let's check.
            const limitLogs = await db.log.findMany({
                where: { userId: user.id, type: "limit_reached", timestamp: { gte: startOfDay } }
            })
            if (limitLogs.length > 0) {
                console.log(` - Found ${limitLogs.length} 'limit_reached' logs. Deleting them to clear noise.`)
                await db.log.deleteMany({
                    where: {
                        userId: user.id,
                        type: "limit_reached",
                        timestamp: { gte: startOfDay }
                    }
                })
            }
        }

        console.log("\nGLOBAL RESET COMPLETE.")

    } catch (error) {
        console.error("Error resetting quota:", error)
    }
}

resetDailyQuota()
