"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function resetUserData() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return { success: false }

    const user = await db.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) return { success: false }

    try {
        // 1. Reset User Resume & Setup Status
        await db.user.update({
            where: { id: user.id },
            data: {
                resumePath: null,
                resumeName: null,
                isSetupComplete: false
            }
        })

        // 2. Delete Templates
        await db.template.deleteMany({
            where: { userId: user.id }
        })

        // 3. Delete Fresh Contacts (Resetting the queue)
        await db.contact.deleteMany({
            where: {
                userId: user.id,
                status: 'fresh'
            }
        })

        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Reset failed:", error)
        return { success: false, error }
    }
}
