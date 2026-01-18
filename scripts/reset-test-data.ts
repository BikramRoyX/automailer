
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🗑️  Clearing test data...')

    // 1. Clear Global Bounces
    const bounces = await prisma.globalBounce.deleteMany({})
    console.log(`- Deleted ${bounces.count} GlobalBounce records`)

    // 2. Clear Sent Emails (so we can re-send and re-scan)
    const sent = await prisma.sentEmail.deleteMany({})
    console.log(`- Deleted ${sent.count} SentEmail records`)

    // 3. Reset Global HR List
    // We don't want to delete them, just mark them as safe again? 
    // Or actually, if we want to "test", maybe we should just reset their status.
    // Assuming default was 'active' or similar. 
    // Let's check schema: GlobalHrList.status (String).
    /* 
      model GlobalHrList {
        status    String   // safe, bounced, risky
        ...
      }
    */
    const hrList = await prisma.globalHrList.updateMany({
        where: { status: 'BOUNCED' },
        data: { status: 'safe' } // Assuming 'safe' is the default/good state
    })
    console.log(`- Reset ${hrList.count} GlobalHrList records to 'safe'`)

    // 4. Reset User Contacts
    /*
      model Contact {
         status        String   @default("fresh")
         bounceDescription String?
      }
    */
    const contacts = await prisma.contact.updateMany({
        where: { status: 'bounced' },
        data: {
            status: 'fresh',
            bounceDescription: null
        }
    })
    console.log(`- Reset ${contacts.count} Contact records to 'fresh'`)

    console.log('✅ Data reset complete. You can now start a fresh test.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
