
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db as prisma } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Parse query params for date filtering
        const { searchParams } = new URL(request.url)
        const days = parseInt(searchParams.get("days") || "30")

        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        // 1. Core Metrics
        const [
            totalSent,
            totalBounced,
            // Assuming we might track replies in the future, for now placeholder or if we had a type
            totalReplies,
            validContacts
        ] = await Promise.all([
            // Sent Count (in range)
            prisma.log.count({
                where: {
                    userId: user.id,
                    type: "email_sent",
                    timestamp: { gte: startDate }
                }
            }),
            // Bounced (in range) - assuming we log 'email_bounced' or similar status
            // Bounced (Status based source of truth, as fetch script updates this)
            prisma.contact.count({
                where: {
                    userId: user.id,
                    status: "bounced"
                    // We don't filter by date here because a bounce invalidates the contact permanently,
                    // and we want to show total "waste" or bad data found.
                }
            }),
            // Replies (Placeholder: 0 unless we have webhooks)
            0,
            // Valid HR List (Current State)
            prisma.contact.count({
                where: {
                    userId: user.id,
                    status: "fresh"
                }
            })
        ])

        // 2. Role Breakdown (of sent emails OR available contacts - let's show breakdown of SENT to show coverage)
        // Since Logs might not link directly to role easily without join, let's show breakdown of CONTACTS we have contacted or intend to.
        // Better: Breakdown of ALL CONTACTS to show distribution of database.
        // 2. Role Breakdown (Robust Aggregation)
        // Group by in DB first to reduce data transfer
        const rawRoles = await prisma.log.groupBy({
            by: ['appliedRole'],
            where: {
                userId: user.id,
                type: 'email_sent'
            },
            _count: {
                _all: true
            }
        })

        // Post-process in JS to handle case-insensitivity and whitespace
        const roleMap = new Map<string, { count: number, displayName: string }>()

        rawRoles.forEach(r => {
            const rawName = r.appliedRole || "General Application"
            const normalizedKey = rawName.trim().toLowerCase()

            const existing = roleMap.get(normalizedKey)
            if (existing) {
                existing.count += r._count._all
                // Heuristic: Prefer the name with more capital letters as the "display name"
                const currentCaps = rawName.replace(/[^A-Z]/g, "").length
                const existingCaps = existing.displayName.replace(/[^A-Z]/g, "").length
                if (currentCaps > existingCaps) {
                    existing.displayName = rawName.trim()
                }
            } else {
                roleMap.set(normalizedKey, {
                    count: r._count._all,
                    displayName: rawName.trim()
                })
            }
        })

        // Convert back to array and sort
        const aggregatedRoles = Array.from(roleMap.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

        // 3. Date-wise Data (Graph)
        const logs = await prisma.log.findMany({
            where: {
                userId: user.id,
                type: 'email_sent',
                timestamp: { gte: startDate }
            },
            select: { timestamp: true },
            orderBy: { timestamp: 'asc' }
        })

        // Group by date (Local Time)
        // Since this is a local app, aligning with the server's local time (User's time) makes more sense than UTC.
        const dailyStats: Record<string, number> = {}
        logs.forEach(log => {
            // "sv-SE" locale formats as YYYY-MM-DD
            const date = new Date(log.timestamp).toLocaleDateString('sv-SE')
            dailyStats[date] = (dailyStats[date] || 0) + 1
        })

        // Fill in missing dates (using Local Time keys)
        const chartData = []
        for (let i = 0; i < days; i++) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dateStr = date.toLocaleDateString('sv-SE')
            chartData.unshift({
                date: dateStr,
                count: dailyStats[dateStr] || 0
            })
        }

        // 4. Recent Bounces (Global) - Using queryRaw to bypass Prisma Client generation issues
        let recentBounces: any[] = [];
        try {
            // Using raw query to be safe against schema mismatches during dev
            recentBounces = await prisma.$queryRaw`
                SELECT email, reason, lastBouncedAt 
                FROM GlobalBounce 
                ORDER BY lastBouncedAt DESC 
                LIMIT 5
            ` as any[];

            // Normalize dates if needed (Raw queries return strings or Date objects depending on driver)
            recentBounces = recentBounces.map(b => ({
                ...b,
                lastBouncedAt: b.lastBouncedAt ? new Date(b.lastBouncedAt) : new Date()
            }));

        } catch (e) {
            console.error("Failed to fetch recent bounces (Raw):", e)
        }

        // 5. Recent Activity Logs (For Profile Feed)
        const recentLogs = await prisma.log.findMany({
            where: {
                userId: user.id,
                type: "email_sent"
            },
            orderBy: { timestamp: 'desc' },
            take: 5,
            select: {
                id: true,
                message: true,
                timestamp: true,
                appliedRole: true
            }
        })


        // Calculate usage today
        const todayStr = new Date().toLocaleDateString('sv-SE')
        const usedToday = dailyStats[todayStr] || 0

        return NextResponse.json({
            metrics: {
                sent: totalSent,
                bounced: totalBounced,
                replies: totalReplies,
                validContacts: validContacts,
                successRate: totalSent > 0 ? ((totalSent - totalBounced) / totalSent * 100).toFixed(1) : 100
            },
            limits: {
                used: usedToday,
                total: user.dailyLimit
            },
            roles: aggregatedRoles.map((r: any) => ({
                name: r.displayName || "Unknown",
                count: r.count
            })),
            chart: chartData,
            recentBounces: recentBounces,
            recentLogs: recentLogs
        })
    } catch (error: any) {
        console.error("Analytics Error:", error)
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 })
    }
}
