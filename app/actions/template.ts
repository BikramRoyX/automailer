"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function saveTemplate(data: {
    name: string
    subject: string
    body: string
    senderPhone?: string
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return { success: false, message: "Unauthorized" }
    }

    try {
        const user = await db.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) return { success: false, message: "User not found" }

        // Update user phone if provided
        if (data.senderPhone) {
            await db.user.update({
                where: { id: user.id },
                data: { phoneNumber: data.senderPhone }
            })
        }

        // Upsert the template (use a fixed name 'Default Template' for now to ensure agent finds it, 
        // or create a new one. For simplicity in this flow, we'll upsert 'Default Template')

        // Check if a template with this name exists for user
        const existing = await db.template.findFirst({
            where: {
                userId: user.id,
                name: data.name
            }
        })

        if (existing) {
            await db.template.update({
                where: { id: existing.id },
                data: {
                    subject: data.subject,
                    body: data.body,
                    senderPhone: data.senderPhone,
                    senderEmail: user.email,
                    role: "General", // Default role
                }
            })
        } else {
            await db.template.create({
                data: {
                    userId: user.id,
                    name: data.name,
                    subject: data.subject,
                    body: data.body,
                    role: "General",
                    senderPhone: data.senderPhone,
                    senderEmail: user.email
                }
            })
        }

        revalidatePath("/dashboard")
        return { success: true, message: "Template saved successfully!" }

    } catch (error) {
        console.error("Save Template Error:", error)
        return { success: false, message: "Failed to save template" }
    }
}
