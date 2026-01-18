
import { NextResponse } from 'next/server'
import { db } from "@/lib/db"
import { scanBouncesForUser } from "@/lib/bounce-scanner"

// This route can be called by a cron job (e.g. Vercel Cron) or manually
export async function GET(req: Request) {
    // Basic security: Check for a secret key if deployed, or just allow for now in dev
    // const authHeader = req.headers.get('authorization')
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new NextResponse('Unauthorized', { status: 401 })
    // }

    try {
        // 1. Get all users who have a Gmail account linked
        const usersWithGmail = await db.user.findMany({
            where: {
                accounts: {
                    some: { provider: 'google-gmail' }
                }
            },
            select: { id: true, email: true }
        })

        const results = []

        // 2. Scan for each user
        for (const user of usersWithGmail) {
            console.log(`Scanning bounces for user: ${user.email} (${user.id})`)
            const result = await scanBouncesForUser(user.id)
            results.push({ userId: user.id, ...result })
        }

        return NextResponse.json({
            success: true,
            scannedUsers: usersWithGmail.length,
            details: results
        })

    } catch (error: any) {
        console.error("Cron Job Failed:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
