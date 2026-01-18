import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Test basic connection
        const userCount = await db.user.count();

        // 2. Test writing (optional, but finding is enough usually)

        return NextResponse.json({
            status: "success",
            message: "Database Connected!",
            userCount,
            env: {
                hasDbUrl: !!process.env.DATABASE_URL,
                nodeEnv: process.env.NODE_ENV
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            message: error.message,
            stack: error.stack,
            env: {
                hasDbUrl: !!process.env.DATABASE_URL
            }
        }, { status: 500 });
    }
}
