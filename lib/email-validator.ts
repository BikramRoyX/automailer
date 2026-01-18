import { resolveMx } from "dns/promises"

export interface EmailAnalysisResult {
    email: string
    syntax: { valid: boolean; details: string }
    domain: { valid: boolean; mxRecords: boolean; details: string }
    pattern: { type: string; details: string }
    risk: { disposable: boolean; roleBased: boolean; details: string }
    verdict: "Likely Valid" | "Possibly Valid" | "Likely Invalid"
    recommendation: string
}

// Common Disposable Domains (Blocklist)
const DISPOSABLE_DOMAINS = [
    "temp-mail.org", "10minutemail.com", "guerrillamail.com", "mailinator.com",
    "yopmail.com", "throwawaymail.com", "tempmail.net", "sharklasers.com"
]

// Common Corporate Domains (Allowlist for pattern analysis)
const FREE_PROVIDERS = [
    "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "aol.com", "icloud.com", "protonmail.com"
]

export class EmailValidator {

    static async analyze(email: string): Promise<EmailAnalysisResult> {
        const result: EmailAnalysisResult = {
            email,
            syntax: { valid: false, details: "" },
            domain: { valid: false, mxRecords: false, details: "" },
            pattern: { type: "Unknown", details: "" },
            risk: { disposable: false, roleBased: false, details: "" },
            verdict: "Likely Invalid",
            recommendation: "Do not send."
        }

        // 1. Syntax Check (RFC 5322 compatible regex)
        // A simplified but practical regex for modern email validation
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

        if (!email.includes("@")) {
            result.syntax.details = "Missing @ symbol"
            return result
        }

        if (emailRegex.test(email)) {
            result.syntax.valid = true
            result.syntax.details = "Format looks correct"
        } else {
            result.syntax.details = "Invalid characters or format"
            return result
        }

        const [localPart, domain] = email.split("@")
        const lowerDomain = domain.toLowerCase()

        // 2. Risk Analysis
        if (DISPOSABLE_DOMAINS.includes(lowerDomain)) {
            result.risk.disposable = true
            result.risk.details += "Disposable Domain Detected. "
        }

        const roleBasedPrefixes = ["admin", "info", "support", "sales", "contact", "help", "hr", "jobs", "careers"]
        if (roleBasedPrefixes.includes(localPart.toLowerCase())) {
            result.risk.roleBased = true
            result.risk.details += "Role-based address (generic). "
        }

        // 3. Pattern Analysis
        if (FREE_PROVIDERS.includes(lowerDomain)) {
            result.pattern.type = "Free Provider"
            result.pattern.details = "Standard personal email pattern"
        } else {
            // Corporate Pattern Guesses
            if (localPart.includes(".")) {
                result.pattern.type = "Corporate (firstname.lastname)"
                result.pattern.details = "Standard corporate pattern detected"
            } else if (localPart.length > 8) {
                result.pattern.type = "Corporate (Long/Unique)"
                result.pattern.details = "Likely first+last name combination"
            } else {
                result.pattern.type = "Corporate (Firstname Only?)"
                result.pattern.details = "Short local part, possibly just firstname"
            }
        }

        // 4. Domain & MX Check
        try {
            const mxRecords = await resolveMx(domain)
            if (mxRecords && mxRecords.length > 0) {
                result.domain.valid = true
                result.domain.mxRecords = true
                result.domain.details = `Active Mail Server (${mxRecords[0].exchange})`
            } else {
                result.domain.details = "No MX Records found"
            }
        } catch (error: any) {
            if (error.code === 'ENOTFOUND') {
                result.domain.details = "Domain does not exist"
            } else {
                result.domain.details = "DNS Lookup Failed"
            }
        }

        // 5. Final Verdict Logic
        if (!result.syntax.valid) {
            result.verdict = "Likely Invalid"
            result.recommendation = "Discard. Syntax error."
        } else if (!result.domain.valid) {
            result.verdict = "Likely Invalid"
            result.recommendation = "Discard. Domain unreachable."
        } else if (result.risk.disposable) {
            result.verdict = "Likely Invalid"
            result.recommendation = "Discard. Disposable address."
        } else {
            // It has syntax + domain
            if (result.risk.roleBased) {
                result.verdict = "Possibly Valid"
                result.recommendation = "Low Priority. Generic inbox, low response rate."
            } else {
                result.verdict = "Likely Valid"
                result.recommendation = "Safe to Send."
            }
        }

        return result
    }
}
