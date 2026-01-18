import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const limitParam = searchParams.get("limit")
        // Default to 20 if not specified, otherwise parseint
        let take = limitParam ? parseInt(limitParam) : 20

        // Safety cap (e.g. max 50 at a time)
        if (take > 50) take = 50
        if (take < 1) take = 1

        const contacts = await db.contact.findMany({
            where: {
                userId: session.user.id,
                status: "fresh"
            },
            take: take,
            select: {
                id: true,
                email: true,
                company: true,
                role: true,
                name: true
            }
        })

        return NextResponse.json({ contacts })
    } catch (error) {
        console.error("Error fetching contacts:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
