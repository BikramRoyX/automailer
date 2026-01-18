"use server"

import { verifyHrEmail } from "@/lib/hr-verification"

export async function checkEmail(email: string) {
    try {
        const result = await verifyHrEmail(email)
        return result
    } catch (error) {
        console.error("Verification failed:", error)
        return { isValid: false, status: "error", reason: "Verification service error" }
    }
}
