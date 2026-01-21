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

        const logs = await db.log.findMany({
            where: { userId: session.user.id },
            orderBy: { timestamp: 'desc' },
            take: 50
        })

        return NextResponse.json(logs)
    } catch (error) {
        console.error("Logs Fetch Error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
