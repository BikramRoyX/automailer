import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const db = new PrismaClient()

async function main() {
    console.log("Creating/Reseting Test User...")
    const email = "test@example.com"
    const password = "password123"
    const hashedPassword = await hash(password, 10)

    // Upsert user
    const user = await db.user.upsert({
        where: { email },
        update: {
            passwordHash: hashedPassword,
            // Reset workflow state
            resumeStatus: 'NOT_UPLOADED',
            resumePath: null,
            communityStatus: 'NOT_SELECTED',
            templateStatus: 'NOT_STARTED',
            // Reset setup complete to false to force connect flow
            isSetupComplete: false
        },
        create: {
            email,
            name: "Test User",
            passwordHash: hashedPassword,
            resumeStatus: 'NOT_UPLOADED',
            communityStatus: 'NOT_SELECTED',
            templateStatus: 'NOT_STARTED'
        }
    })

    // Also reset SmtpConfig or Account if exists to ensure 'not connected' state?
    // Actually we check 'gmail_connected' from agent status api usually, which checks tokens.
    // But 'isSetupComplete' might toggle UI.
    // The Agent API checks `token.access_token` or `Account` table.
    // Let's ensure no Account Google link exists for this user to simulate "Not Connected"
    await db.account.deleteMany({
        where: { userId: user.id }
    })

    console.log(`User ${email} created/reset. Password: ${password}`)
    console.log("Workflow state reset to defaults.")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
