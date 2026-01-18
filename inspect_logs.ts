
import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
    const logs = await prisma.log.findMany({
        where: {
            type: 'email_sent'
        },
        select: {
            appliedRole: true,
            timestamp: true
        },
        orderBy: {
            timestamp: 'desc'
        },
        take: 50
    })

    let output = "Recent Logs:\n"
    logs.forEach(l => {
        output += `Role: '${l.appliedRole}' | Date: ${l.timestamp.toISOString()}\n`
    })

    fs.writeFileSync('logs.txt', output)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
