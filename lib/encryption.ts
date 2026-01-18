import { createCipheriv, createDecipheriv, randomBytes } from "crypto"

const ALGORITHM = "aes-256-gcm"
// We need a stable key. In production, this should be in env. 
// For this demo, we can derive it from NEXTAUTH_SECRET or strict env.
// I'll ensure we have an ENCRYPTION_KEY in env, or fallback (for demo only).
// NOTE: Key must be 32 bytes for aes-256.

const SECRET_KEY = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || "fallback-secret-key-32-chars-long!!"
// Ensure it's 32 bytes
const KEY = Buffer.from(SECRET_KEY.padEnd(32, "0").slice(0, 32))

export function encrypt(text: string): string {
    const iv = randomBytes(12)
    const cipher = createCipheriv(ALGORITHM, KEY, iv)
    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")
    const authTag = cipher.getAuthTag().toString("hex")
    return iv.toString("hex") + ":" + authTag + ":" + encrypted
}

export function decrypt(text: string): string {
    const parts = text.split(":")
    if (parts.length !== 3) throw new Error("Invalid encrypted text")

    const iv = Buffer.from(parts[0], "hex")
    const authTag = Buffer.from(parts[1], "hex")
    const encryptedText = Buffer.from(parts[2], "hex")

    const decipher = createDecipheriv(ALGORITHM, KEY, iv)
    decipher.setAuthTag(authTag)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString("utf8")
}
