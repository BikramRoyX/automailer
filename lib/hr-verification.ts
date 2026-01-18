
import { db } from "@/lib/db"
import dns from "dns"
import { promisify } from "util"

const resolveMx = promisify(dns.resolveMx)

export interface VerificationResult {
    isValid: boolean
    status: "safe" | "risky" | "invalid"
    reason?: string
}

export async function verifyHrEmail(email: string): Promise<VerificationResult> {

    // 1. Syntax Check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return { isValid: false, status: "invalid", reason: "Invalid format" }
    }

    const domain = email.split('@')[1]

    // 2. Blacklist Check (Global DB)
    // Note: We assume globalHrList is populated. If not found, we proceed to check.
    try {
        const knownEmail = await db.globalHrList.findUnique({
            where: { email }
        })

        if (knownEmail) {
            if (knownEmail.status === "bounced" || knownEmail.status === "invalid") {
                return { isValid: false, status: "invalid", reason: "Known bounce" }
            }
            if (knownEmail.status === "safe") {
                return { isValid: true, status: "safe" }
            }
        }
    } catch (error) {
        console.warn("DB Blacklist check failed, proceeding to manual check", error)
    }

    // 3. Risky Domains (Free Providers)
    const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com']
    if (freeProviders.includes(domain)) {
        // We allow it but mark as risky/personal unless it's a specific verified recruitment email
        // For mass cold mailing, generic gmail is risky.
        // But for this platform, users might manually add them. We'll mark 'risky'.
        return { isValid: true, status: "risky", reason: "Free provider" }
    }

    // 4. MX Record Check (Server-side only)
    try {
        const mxRecords = await resolveMx(domain)
        if (!mxRecords || mxRecords.length === 0) {
            return { isValid: false, status: "invalid", reason: "No MX records found" }
        }
    } catch (error) {
        return { isValid: false, status: "invalid", reason: "Domain DNS failed" }
    }

    // If passed all checks
    return { isValid: true, status: "safe" }
}
