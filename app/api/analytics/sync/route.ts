
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { checkForReplies, checkForBounces } from "@/lib/gmail"

export const dynamic = 'force-dynamic'

export async function POST() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

        // Get Gmail Account
        const account = await db.account.findFirst({
            where: {
                userId: session.user.id,
                provider: { in: ["google", "google-gmail"] }
            }
        })

        if (!account?.access_token) {
            return NextResponse.json({ error: "Gmail not connected" }, { status: 400 })
        }

        // 1. Sync Bounces (Global)
        const bounces = await checkForBounces(account.access_token)
        let bounceCount = 0

        for (const b of bounces) {
            // Find contact by email
            const contact = await db.contact.findFirst({
                where: { userId: session.user.id, email: b.email }
            })

            if (contact && contact.status !== 'bounced') {
                await db.contact.update({
                    where: { id: contact.id },
                    data: {
                        status: 'bounced',
                        bounceDescription: b.reason
                    }
                })
                bounceCount++
            }
        }

        // 2. Sync Replies
        // Fetch recent thread IDs we sent to
        const sentEmails = await db.sentEmail.findMany({
            where: { userId: session.user.id },
            orderBy: { sentAt: 'desc' },
            take: 50,
            select: { threadId: true, recipient: true }
        })

        const threadIds = sentEmails.map(s => s.threadId).filter(id => id) as string[]
        // Deduplicate
        const uniqueThreadIds = Array.from(new Set(threadIds))

        const replies = await checkForReplies(account.access_token, uniqueThreadIds)
        let replyCount = 0

        for (const r of replies) {
            // Identify contact from threadId or email
            // We have the email from the header
            const contact = await db.contact.findFirst({
                where: { userId: session.user.id, email: r.email }
            })

            if (contact && contact.status !== 'replied') {
                await db.contact.update({
                    where: { id: contact.id },
                    data: { status: 'replied' } // Requires no schema change as string
                })
                replyCount++
            }
        }

        return NextResponse.json({
            success: true,
            synced: {
                bounces: bounceCount,
                replies: replyCount
            }
        })

    } catch (error: any) {
        console.error("Sync Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
