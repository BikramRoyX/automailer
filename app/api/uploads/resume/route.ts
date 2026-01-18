import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
        }

        if (file.type !== "application/pdf") {
            return NextResponse.json({ message: "Only PDF files are allowed" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create user directory
        const uploadDir = path.join(process.cwd(), "uploads", session.user.id);
        await mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, "resume.pdf");
        await writeFile(filePath, buffer);

        await db.user.update({
            where: { id: session.user.id },
            data: {
                resumePath: filePath,
                resumeName: file.name
            }
        });

        return NextResponse.json({ message: "Resume uploaded successfully" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Upload failed" }, { status: 500 });
    }
}
