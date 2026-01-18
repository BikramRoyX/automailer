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

        const profile = await db.profile.findUnique({
            where: { userId: session.user.id }
        })

        return NextResponse.json(profile || {})
    } catch (error) {
        console.error("Profile GET Error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { fullName, mobile, experienceLevel, preferredField, bio, linkedinUrl, portfolioUrl } = body

        // Basic validation could go here

        const profile = await db.profile.upsert({
            where: { userId: session.user.id },
            update: {
                fullName,
                mobile,
                experienceLevel,
                preferredField,
                bio,
                linkedinUrl,
                portfolioUrl
            },
            create: {
                userId: session.user.id,
                fullName: fullName || session.user.name || "",
                mobile: mobile || "",
                experienceLevel: experienceLevel || "Entry-Level",
                preferredField: preferredField || "Other",
                bio: bio || "",
                linkedinUrl: linkedinUrl || "",
                portfolioUrl: portfolioUrl || ""
            }
        })

        return NextResponse.json(profile)
    } catch (error) {
        console.error("Profile POST Error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
