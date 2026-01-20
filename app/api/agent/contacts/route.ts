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

        // Safety cap (Increased to 1000 for bulk sending)
        if (take > 1000) take = 1000
        if (take < 1) take = 1

        // Randomize the batch to avoid stuck queues or repetitive ordering
        const contacts = await db.$queryRaw<any[]>`
            SELECT id, email, company, role, name 
            FROM "Contact" 
            WHERE "userId" = ${session.user.id} 
            AND status = 'fresh'
            ORDER BY RANDOM()
            LIMIT ${take}
        `;

        return NextResponse.json({ contacts })
    } catch (error) {
        console.error("Error fetching contacts:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
