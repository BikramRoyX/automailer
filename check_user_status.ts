
import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        select: {
            email: true,
            resumeStatus: true,
            communityStatus: true,
            templateStatus: true
        }
    })
    const output = users.map(u =>
        `User: ${u.email}\nResume: ${u.resumeStatus}\nCommunity: ${u.communityStatus}\nTemplate: ${u.templateStatus}\n`
    ).join('---\n')

    fs.writeFileSync('status.txt', output)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
