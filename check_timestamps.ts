
import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
    const logs = await prisma.log.findMany({
        where: { type: 'email_sent' },
        orderBy: { timestamp: 'desc' },
        take: 5
    })

    let output = ""
    output += `Current System Time: ${new Date().toString()}\n`
    output += `Current ISO (UTC): ${new Date().toISOString()}\n\n`

    output += "Recent Logs:\n"
    logs.forEach(l => {
        output += `ID: ${l.id} | Date (UTC): ${l.timestamp.toISOString()} | Date (Local): ${l.timestamp.toLocaleString()}\n`
    })

    fs.writeFileSync('timestamps.txt', output)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
