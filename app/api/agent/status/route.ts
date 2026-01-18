
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db as prisma } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({
                authenticated: false,
                gmail_connected: false,
                template_count: 0,
                contact_count: 0,
                fresh_contact_count: 0,
                emails_sent_today: 0,
                daily_limit: 0
            })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                accounts: true,
                _count: {
                    select: { contacts: true, templates: true }
                },
                profile: true
            }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // 1. Gmail Connected (Strict Mode: Must appear as 'google-gmail' provider)
        const googleAccount = user.accounts.find(acc => acc.provider === "google-gmail")
        const gmail_connected = !!googleAccount

        // 2. Counts
        const template_count = user._count.templates
        const contact_count = user._count.contacts

        // 3. Fresh Contacts (ready to send)
        const fresh_contact_count = await prisma.contact.count({
            where: {
                userId: user.id,
                status: "fresh"
            }
        })

        // 4. Usage Today
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const emails_sent_today = await prisma.log.count({
            where: {
                userId: user.id,
                type: "email_sent",
                timestamp: {
                    gte: startOfDay
                }
            }
        })

        // 5. Applied & Bounced (Lifetime Stats)
        const applied_count = await prisma.contact.count({
            where: { userId: user.id, status: "sent" }
        })

        const bounced_count = await prisma.contact.count({
            where: { userId: user.id, status: "bounced" }
        })

        // 5. Resume Status
        const resume_uploaded = !!user.resumePath && user.resumePath.length > 0

        // 6. Global HR Count
        const global_hr_count = await prisma.globalHrList.count()

        return NextResponse.json({
            authenticated: true,
            gmail_connected,
            gmail_email: session.user.email, // Or fetch from Google profile if needed
            template_count,
            contact_count,
            fresh_contact_count,
            emails_sent_today,
            daily_limit: user.dailyLimit,
            resume_uploaded,
            is_setup_complete: user.isSetupComplete,
            profile: user.profile,
            applied_count,
            bounced_count,
            global_hr_count
        })

    } catch (error) {
        console.error("Agent Status API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
