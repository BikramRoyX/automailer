import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const { templates } = await req.json();

        // Fetch up to 3 fresh contacts
        const contacts = await db.contact.findMany({
            where: { userId: session.user.id, status: "fresh" },
            take: 3
        });

        if (contacts.length === 0) {
            return NextResponse.json({ message: "No fresh contacts found. Upload a list first." }, { status: 400 });
        }

        const previews = contacts.map((contact: any) => {
            const roleKey = Object.keys(templates).find(k => k.toLowerCase() === (contact.role || "general").toLowerCase())
                || "General" // Default fallback

            let body = templates[roleKey] || templates["General"] || "";

            // Variable replacement
            const name = contact.name || contact.email.split("@")[0];
            const company = contact.company || "your company";
            const senderName = session.user.email?.split("@")[0] || "AutoMailer User";
            const senderEmail = session.user.email || "";

            // Parse Subject if present (first line)
            let subject = "Job Inquiry";
            const subjectMatch = body.match(/^Subject:\s*(.+)(\r?\n|$)/);
            if (subjectMatch) {
                subject = subjectMatch[1].trim();
                body = body.replace(subjectMatch[0], "").trim();
            }

            body = body.replace(/\[Name\]/g, name)
                .replace(/\[Your Name\]/g, senderName)
                .replace(/\[Your Email\]/g, senderEmail)
                .replace(/\[Your Phone\]/g, "[Your Phone]") // Leave as placeholder for user to see they need to edit it, or if I implement settings later
                .replace(/\[Company\]/g, company);

            // Subject variable replacement
            subject = subject.replace(/\[Name\]/g, name)
                .replace(/\[Company\]/g, company);

            return {
                to: contact.email,
                role: contact.role,
                subject: subject,
                body: body
            };
        });

        return NextResponse.json({ previews });
    } catch (error) {
        return NextResponse.json({ message: "Preview generation failed" }, { status: 500 });
    }
}
