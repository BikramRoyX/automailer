import { db } from "@/lib/db"

async function main() {
    console.log("Fixing User Resume Status...")

    // Update ALL users to have a resume for debugging
    await db.user.updateMany({
        data: {
            resumePath: "/uploads/resume_debug.pdf",
            resumeName: "Resume.pdf",
            // Don't force isSetupComplete false, let logic handle it
        }
    })

    console.log("Updated all users with dummy resume.")
}

main()
    .catch(e => console.error(e))
    .finally(async () => await db.$disconnect())
