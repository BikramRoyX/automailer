
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Verifying SentEmail Table Access...')
    try {
        const count = await prisma.sentEmail.count()
        console.log(`✅ Success! Current SentEmail count: ${count}`)

        // Test findFirst
        const test = await prisma.sentEmail.findFirst()
        console.log(`✅ FindFirst returned: ${test ? 'Record found' : 'No records (expected if clean)'}`)

    } catch (e) {
        console.error('❌ Failed to access SentEmail table:', e)
        process.exit(1)
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
