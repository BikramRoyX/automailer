
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Checking Google Account Status...\n')

    const account = await prisma.account.findFirst({
        where: { provider: 'google-gmail' }
    })

    if (!account) {
        console.log('❌ No Google Account linked!')
    } else {
        console.log('✅ Google Account Found')
        console.log(`- Connection ID: ${account.id}`)
        console.log(`- Expires At: ${new Date((account.expires_at || 0) * 1000).toLocaleString()}`)
        const now = Date.now() / 1000
        const expiresIn = (account.expires_at || 0) - now
        console.log(`- Expires In: ${Math.floor(expiresIn / 60)} minutes`)

        if (expiresIn < 0) {
            console.log('⚠️ TOKEN EXPIRED - Refresh should happen automatically on send.')
            if (!account.refresh_token) {
                console.error('❌ CRITICAL: No refresh_token available! Re-connection required.')
            } else {
                console.log('✅ Refresh Token is present.')
            }
        } else {
            console.log('✅ Token is valid.')
        }
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
