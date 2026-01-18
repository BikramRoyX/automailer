import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        console.log("Debug: Attempting DB connection...")
        // Try to count users - simple read query
        const userCount = await db.user.count()

        // Check if DATABASE_URL is set (don't reveal the whole thing, just the protocol)
        const dbUrl = process.env.DATABASE_URL
        const isPostgres = dbUrl?.startsWith("postgres")

        return NextResponse.json({
            status: "ok",
            message: "Database connection successful",
            userCount,
            provider: isPostgres ? "postgres (correct)" : "other (wrong)",
            env_check: {
                NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "Set" : "Missing",
                NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "Set" : "Missing",
            }
        })
    } catch (error: any) {
        console.error("Debug Check Failed:", error)
        return NextResponse.json({
            status: "error",
            message: error.message,
            stack: error.stack
        }, { status: 500 })
    }
}
