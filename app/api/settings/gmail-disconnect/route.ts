
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Only delete the specific Gmail connection, NOT the user account or login
        await db.account.deleteMany({
            where: {
                userId: session.user.id,
                provider: "google-gmail"
            }
        });

        return NextResponse.json({ success: true, message: "Disconnected Gmail successfully" });
    } catch (error) {
        console.error("Disconnect Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
