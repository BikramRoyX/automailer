
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        include: {
            accounts: true
        }
    })

    console.log("Found users:", users.length)
    for (const user of users) {
        console.log(`User: ${user.email} (ID: ${user.id})`)
        console.log(`  Set Up Complete: ${user.isSetupComplete}`)
        if (user.accounts.length === 0) {
            console.log("  No accounts linked.")
        } else {
            user.accounts.forEach(acc => {
                console.log(`  Account Provider: ${acc.provider}`)
                console.log(`  Account Type: ${acc.type}`)
                console.log(`  Access Token Present: ${!!acc.access_token}`)
                console.log(`  Refresh Token Present: ${!!acc.refresh_token}`)
            })
        }
        console.log("-------------------")
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
