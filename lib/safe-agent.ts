import { db } from "@/lib/db"

// Blocked Domains (Exchange/Outlook/Spammy)
const BLOCKED_DOMAINS = [
    "outlook.com", "hotmail.com", "live.com", "msn.com",
    "yahoo.com", "aol.com", "icloud.com", "me.com", "mac.com"
]

// Risky Domains (Allow once, no follow-up)
const RISKY_DOMAINS = [
    "gmail.com", "googlemail.com" // Public domains are risky for B2B recruiting usually
]

export type VerificationStatus = "valid" | "risky" | "invalid"

interface VerificationResult {
    status: VerificationStatus
    reason?: string
}

export const SafeAgent = {
    /**
     * verifyEmail
     * Ports the logic of "email_verifier.py"
     */
    verifyEmail: (email: string): VerificationResult => {
        const normalized = email.toLowerCase().trim()

        // 1. Syntax Check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(normalized)) {
            return { status: "invalid", reason: "Syntax Error" }
        }

        const domain = normalized.split('@')[1]

        // 2. Blocked Domains Check
        if (BLOCKED_DOMAINS.includes(domain)) {
            return { status: "invalid", reason: "Blocked Domain" }
        }

        // 3. Risky Domains Check
        if (RISKY_DOMAINS.includes(domain)) {
            return { status: "risky", reason: "Public Domain" }
        }

        // 4. Default to Valid for Business Domains
        return { status: "valid" }
    },

    /**
     * checkSafety
     * Enforces daily limits and anti-spam rules
     */
    checkSafety: async (userId: string, limit: number = 20) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const sentCount = await db.log.count({
            where: {
                userId,
                type: "email_sent",
                timestamp: { gte: today }
            }
        })

        if (sentCount >= limit) {
            return { safe: false, reason: `Daily limit of ${limit} reached (${sentCount} sent).` }
        }

        return { safe: true, count: sentCount }
    },

    /**
     * logAction
     * Centralized logging for the agent
     */
    logAction: async (userId: string, type: "info" | "error" | "email_sent" | "email_failed", message: string, metadata?: any) => {
        console.log(`[SafeAgent] [${type.toUpperCase()}] ${message}`)
        await db.log.create({
            data: {
                userId,
                type,
                message,
                metadata: metadata ? JSON.stringify(metadata) : undefined
            }
        })
    }
}
