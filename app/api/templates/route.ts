
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const user = await db.user.findUnique({ where: { email: session.user.email } })
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

        const template = await db.template.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        })

        if (!template) return NextResponse.json(null) // No template found is valid

        return NextResponse.json(template)
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const body = await req.json()
        const { name, subject, body: content, role, senderPhone, senderEmail } = body

        if (!name || !subject || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Optional: clear old templates if we only want one active template (based on user flow "reset on login")
        // But for now, we just create new one using the DB schema. 
        // Logic says "reset on login", so user can have multiple during session? 
        // The UI seems to select ONE template for the campaign.
        // Let's create it.

        const newTemplate = await db.template.create({
            data: {
                userId: user.id,
                name,
                subject,
                body: content,
                role: role || "General",
                senderPhone,
                senderEmail
            }
        })

        return NextResponse.json(newTemplate)

    } catch (error) {
        console.error("Create Template Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
