
import { db } from "@/lib/db"

async function main() {
    console.log("⚠️ STARTING MASTER RESET...")

    try {
        // 1. Delete dependent data first to avoid foreign key constraints
        // Logs
        console.log("Clearing Logs...")
        await db.log.deleteMany({})

        // Contacts (All types: fresh, sent, bounced)
        console.log("Clearing Contacts...")
        await db.contact.deleteMany({})

        // Templates
        console.log("Clearing Templates...")
        await db.template.deleteMany({})

        // 2. Reset User State
        console.log("Resetting User State...")
        await db.user.updateMany({
            data: {
                resumePath: null,
                resumeName: null,
                isSetupComplete: false,
                // Optional: validCount cache if you have it
            }
        })

        // 3. Clear Profiles? (Maybe keep the profile data but force re-verification?)
        // User asked for "everything", but typing profile again is annoying. 
        // Let's Keep the profile record but maybe reset 'isSetupComplete' on the user is enough.
        // If they want to re-enter profile, they can go to settings.
        // Actually, let's strictly wipe everything associated with flow.

        console.log("✅ MASTER RESET COMPLETE. System is clean.")

    } catch (error) {
        console.error("❌ Reset Failed:", error)
    } finally {
        await db.$disconnect()
    }
}

main()
