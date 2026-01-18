"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function completeOnboarding(data: {
    name: string
    phoneNumber: string
    dailyLimit: number
    template: {
        subject: string
        body: string
    }
}) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        throw new Error("Unauthorized")
    }

    try {
        await db.$transaction([
            db.user.update({
                where: { email: session.user.email },
                data: {
                    name: data.name,
                    phoneNumber: data.phoneNumber,
                    dailyLimit: data.dailyLimit,
                    isSetupComplete: true
                }
            }),
            db.template.create({
                data: {
                    userId: session.user.id,
                    name: "Default Template",
                    subject: data.template.subject,
                    body: data.template.body,
                    role: "HR", // Default role
                    senderName: data.name,
                    senderEmail: session.user.email
                }
            })
        ])

        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Failed to complete onboarding:", error)
        throw new Error("Failed to save profile")
    }
}
