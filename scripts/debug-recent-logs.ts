
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Checking recent logs and email status...\n')

    // 1. Last 5 Logs (Errors first)
    const logs = await prisma.log.findMany({
        orderBy: { timestamp: 'desc' },
        take: 5
    })

    console.log('--- Recent System Logs ---')
    if (logs.length === 0) console.log('No logs found.')
    logs.forEach(l => {
        console.log(`[${l.timestamp.toISOString()}] ${l.type.toUpperCase()}: ${l.message}`)
    })
    console.log('\n')

    // 2. Last 5 Sent Emails
    const sent = await prisma.sentEmail.findMany({
        orderBy: { sentAt: 'desc' },
        take: 5
    })

    console.log('--- Recent Sent Emails ---')
    if (sent.length === 0) console.log('No sent emails recorded.')
    sent.forEach(s => {
        console.log(`[${s.sentAt.toISOString()}] To: ${s.recipient} | Status: ${s.status} | ID: ${s.gmailMessageId} | Reason: ${s.bounceReason || 'N/A'}`)
    })
    console.log('\n')

    // 3. Last 5 Contacts status
    const contacts = await prisma.contact.findMany({
        orderBy: { lastContactedAt: 'desc' },
        take: 5,
        select: { email: true, status: true, bounceDescription: true, lastContactedAt: true }
    })

    console.log('--- Recently Contacted ---')
    if (contacts.length === 0) console.log('No recent contacts found.')
    contacts.forEach(c => {
        console.log(`[${c.lastContactedAt?.toISOString() ?? 'Never'}] ${c.email} | Status: ${c.status} | Bounce Desc: ${c.bounceDescription || 'N/A'}`)
    })

}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
