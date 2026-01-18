import { db } from "@/lib/db"
import { scanBouncesForUser } from "@/lib/bounce-scanner"

async function fetchBounces() {
    console.log("Starting Bounce Fetcher (Centralized Logic)...")

    // 1. Get all users with Gmail connected
    const accounts = await db.account.findMany({
        where: { provider: { in: ["google", "google-gmail"] } },
        include: { user: true }
    })

    console.log(`Found ${accounts.length} connected accounts.`)

    for (const account of accounts) {
        console.log(`\nScanning bounces for: ${account.user.email} (${account.user.name})`)

        try {
            const result = await scanBouncesForUser(account.userId)
            console.log(`> Processed: ${result.processed}`)
            if (result.errors.length > 0) {
                console.error(`> Errors:`, result.errors)
            }
        } catch (e) {
            console.error(`CRITICAL FAILURE for user ${account.userId}:`, e)
        }
    }
    console.log("\nBounce check complete.")
}

fetchBounces()

