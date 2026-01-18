
import { db } from "@/lib/db"

async function debugAnalytics() {
    console.log("Starting Analytics Debug...")

    try {
        // 1. Check User existance (just a sanity check)
        const user = await db.user.findFirst()
        if (!user) {
            console.error("No user found!")
            return
        }
        console.log("User found:", user.email)

        // 2. Check GlobalBounce table (Migration check)
        console.log("Checking GlobalBounce table...")
        // @ts-ignore
        const bounces = await db.globalBounce.count()
        console.log("GlobalBounce Count:", bounces)

        // 3. Check Contact Status Query (The one we just added)
        console.log("Checking Contact Bounced Query...")
        const bouncedContacts = await db.contact.count({
            where: {
                userId: user.id,
                status: "bounced"
            }
        })
        console.log("Bounced Contacts (Status):", bouncedContacts)

        // 4. Check Log Query (Role Breakdown)
        console.log("Checking Log Role Breakdown...")
        const logsByRole = await db.$queryRaw`
            SELECT COALESCE(appliedRole, 'General Application') as appliedRole, COUNT(*) as count 
            FROM Log 
            WHERE userId = ${user.id} 
            AND type = 'email_sent' 
            GROUP BY COALESCE(appliedRole, 'General Application')
            ORDER BY count DESC 
            LIMIT 5
        `
        console.log("Logs By Role:", logsByRole)

        console.log("✅ Diagnostics Passed!")

    } catch (e: any) {
        console.error("❌ ERROR DETECTED:")
        console.error(e)
    } finally {
        await db.$disconnect()
    }
}

debugAnalytics()
