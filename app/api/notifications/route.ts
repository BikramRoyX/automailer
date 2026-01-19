
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // 1. Fetch User Notifications
        const userNotifications = await db.notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 10
        })

        // 2. Fetch Active Broadcasts (System wide)
        // Show broadcasts from last 24 hours only, or active ones
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        const broadcasts = await db.broadcast.findMany({
            where: {
                createdAt: { gte: yesterday }
            },
            orderBy: { createdAt: 'desc' }
        })

        // 3. Merge & Sort
        const allNotifications = [
            ...userNotifications.map((n: any) => ({ ...n, source: 'personal' })),
            ...broadcasts.map((b: any) => ({
                id: `broadcast-${b.id}`,
                title: b.title,
                message: b.message,
                type: b.type === 'community' ? 'success' : 'info',
                isRead: false, // Broadcasts are transient for now
                createdAt: b.createdAt,
                source: 'broadcast'
            }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        return NextResponse.json(allNotifications)

    } catch (error) {
        console.error("Notifications Fetch Error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
