import { db } from "@/lib/db"

async function inspectBounces() {
    try {
        // Find the user who actually had bounces recently
        const lastBounce = await db.contact.findFirst({
            where: { status: 'bounced' },
            orderBy: { createdAt: 'desc' }, // Schema has createdAt, not updatedAt
            select: { userId: true }
        })

        if (!lastBounce) return console.log("No bounces found in the entire database.")

        const userId = lastBounce.userId
        const user = await db.user.findUnique({ where: { id: userId } })

        console.log(`ACTIVE USER: ${user?.email} (${userId})`)
        console.log(`RESUME PATH: ${user?.resumePath}`)
        console.log(`RESUME NAME: ${user?.resumeName}`)

        // Get bounces from the last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

        // Safety check for user existence
        const userEmail = user ? user.email : "Unknown User"
        console.log(`Checking bounces for ACTIVE USER: ${userEmail} (${userId}) since ${oneHourAgo.toLocaleTimeString()}...`)

        const recentBounces = await db.contact.findMany({
            where: {
                userId: userId,
                status: 'bounced',
            },
            orderBy: { id: 'desc' },
            take: 20,
            select: {
                email: true,
                bounceDescription: true,
                verificationStatus: true
            }
        })

        console.log(`Found ${recentBounces.length} recent bounces:`)
        console.log(JSON.stringify(recentBounces, null, 2))

        // Also check logs
        const errorLogs = await db.log.findMany({
            where: {
                userId: userId,
                type: { in: ['email_failed', 'error'] }
            },
            orderBy: { timestamp: 'desc' },
            take: 10,
            select: { message: true, timestamp: true }
        })

        console.log("\nRecent System Errors:")
        console.log(errorLogs)

    } catch (error) {
        console.error("Error:", error)
    }
}

inspectBounces()
