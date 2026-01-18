
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🧪 Testing Global HR Sync Logic...\n')

    const dummyEmails = [
        'new-hr-1@example.com',
        'new-hr-2@example.com',
        'existing-hr@example.com' // We will ensure this exists first
    ]

    // 1. Setup: Ensure one exists
    await prisma.globalHrList.upsert({
        where: { email: 'existing-hr@example.com' },
        update: {},
        create: {
            email: 'existing-hr@example.com',
            domain: 'example.com',
            status: 'safe'
        }
    })

    console.log('✅ Setup complete.')

    // --- LOGIC TO TEST ---
    const globalHrEntries = dummyEmails.map(email => ({
        email: email,
        domain: email.split('@')[1] || 'unknown',
        status: 'safe',
        source: 'test_script'
    }));

    const uniqueHrEntries = Array.from(new Map(globalHrEntries.map(item => [item.email, item])).values());

    console.log(`- Proceeding with ${uniqueHrEntries.length} entries.`)

    try {
        // A. Find which emails already exist
        const existingGlobal = await prisma.globalHrList.findMany({
            where: {
                email: { in: uniqueHrEntries.map(e => e.email) }
            },
            select: { email: true }
        });

        const existingSet = new Set(existingGlobal.map(e => e.email));
        console.log(`- Found ${existingSet.size} existing emails in DB.`)

        // B. Filter out existing
        const newHrEntries = uniqueHrEntries.filter(e => !existingSet.has(e.email));
        console.log(`- Identified ${newHrEntries.length} NEW emails to insert.`)

        // C. Insert only new
        if (newHrEntries.length > 0) {
            const res = await prisma.globalHrList.createMany({
                data: newHrEntries
            });
            console.log(`✅ Successfully inserted ${res.count} new records.`)
        } else {
            console.log('ℹ️ No new records to insert.')
        }

    } catch (e) {
        console.error('❌ Logic Failed:', e)
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test data...')
    await prisma.globalHrList.deleteMany({
        where: { email: { in: ['new-hr-1@example.com', 'new-hr-2@example.com'] } }
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
