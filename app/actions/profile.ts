"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function saveProfile(data: any) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return { success: false, message: "Unauthorized" }
    }

    try {
        const user = await db.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) return { success: false, message: "User not found" }

        // Upsert Profile
        await db.profile.upsert({
            where: { userId: user.id },
            create: {
                userId: user.id,
                fullName: data.fullName,
                mobile: data.mobile,
                experienceLevel: data.experienceLevel,
                preferredField: data.preferredField,
                skills: data.skills,
                bio: data.bio,
                linkedinUrl: data.linkedinUrl,
                portfolioUrl: data.portfolioUrl
            },
            update: {
                fullName: data.fullName,
                mobile: data.mobile,
                experienceLevel: data.experienceLevel,
                preferredField: data.preferredField,
                skills: data.skills,
                bio: data.bio,
                linkedinUrl: data.linkedinUrl,
                portfolioUrl: data.portfolioUrl
            }
        })

        // Update User Setup Flag
        await db.user.update({
            where: { id: user.id },
            data: { isSetupComplete: true }
        })

        revalidatePath("/dashboard")
        return { success: true, message: "Profile saved successfully." }

    } catch (error: any) {
        console.error("Save Profile Error:", error)
        return { success: false, message: error.message || "Failed to save profile." }
    }
}
