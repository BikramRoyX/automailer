import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { validateWorkflowUpdate } from "@/lib/workflow-validation"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const user = await db.user.findUnique({
            where: { email: session.user.email },
            select: {
                templateStatus: true,
                resumeStatus: true,
                communityStatus: true,
                lastWorkUpdate: true,
                resumePath: true,
                // Check setup complete for Connect step status
                isSetupComplete: true
            }
        })

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

        // Self-Healing Status Check
        if (user.resumePath && user.resumeStatus === 'NOT_UPLOADED') {
            await db.user.update({
                where: { email: session.user.email },
                data: { resumeStatus: 'UPLOADED' }
            })
            user.resumeStatus = 'UPLOADED'
        }
        // FIX: Reverse check - If status says UPLOADED but path is gone, reset it.
        else if (!user.resumePath && user.resumeStatus === 'UPLOADED') {
            await db.user.update({
                where: { email: session.user.email },
                data: { resumeStatus: 'NOT_UPLOADED' }
            })
            user.resumeStatus = 'NOT_UPLOADED'
        }

        return NextResponse.json(user)
    } catch (e) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const body = await req.json()
        const { templateStatus, resumeStatus, communityStatus } = body

        // Fetch current state for validation
        const user = await db.user.findUnique({
            where: { email: session.user.email },
            select: {
                resumeStatus: true,
                communityStatus: true,
                resumePath: true,
                templateStatus: true
            }
        })

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

        // --- STRICT VALIDATION RULES ---
        const validation = validateWorkflowUpdate(user, { templateStatus, resumeStatus, communityStatus })

        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 400 })
        }

        const dataToUpdate: any = {
            lastWorkUpdate: new Date()
        }

        if (templateStatus) dataToUpdate.templateStatus = templateStatus
        if (resumeStatus) dataToUpdate.resumeStatus = resumeStatus
        if (communityStatus) dataToUpdate.communityStatus = communityStatus



        const updatedUser = await db.user.update({
            where: { email: session.user.email },
            data: dataToUpdate,
            select: {
                templateStatus: true,
                resumeStatus: true,
                communityStatus: true
            }
        })

        return NextResponse.json(updatedUser)
    } catch (e: any) {
        console.error("Workflow Update Error:", e)
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
    }
}
