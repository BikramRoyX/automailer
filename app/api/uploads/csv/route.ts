import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Papa from "papaparse";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
        }

        const text = await file.text();
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });

        if (result.errors.length > 0) {
            return NextResponse.json({ message: "CSV Parse Error", details: result.errors }, { status: 400 });
        }

        type CSVRow = Record<string, string | null | undefined>;

        const rows = result.data as CSVRow[];
        if (rows.length === 0) {
            return NextResponse.json({ message: "CSV is empty" }, { status: 400 });
        }

        // Normalize keys to lowercase to find 'email'
        const contactsToCreate: any[] = [];
        const userId = session.user.id;
        let ignoredCount = 0;

        for (const row of rows) {
            // Fuzzy header detection
            const keys = Object.keys(row);

            const findKey = (keywords: string[]) =>
                keys.find(k => keywords.some(w => k.toLowerCase().includes(w)));

            const emailKey = findKey(["email", "mail", "contact"]);
            const nameKey = findKey(["name", "fullname", "candidate"]);
            const companyKey = findKey(["company", "organization", "firm", "business"]);
            const titleKey = findKey(["title", "role", "position", "designation"]);
            const targetRoleKey = findKey(["target role", "target_role", "applied role", "applied_role", "job title"]);

            if (!emailKey || !row[emailKey]) {
                ignoredCount++;
                continue;
            }

            const email = String(row[emailKey] || "").trim().toLowerCase();
            const name = nameKey ? String(row[nameKey] || "").trim() : "";
            const company = companyKey ? String(row[companyKey] || "").trim() : "";
            const title = titleKey ? String(row[titleKey] || "").trim() : "";

            // Allow explicit target role from CSV, or default
            const detectedRole = targetRoleKey ? String(row[targetRoleKey] || "").trim() : "";

            // Detect role based on User's requested mapping:
            // decide_role(company, title) -> "Software Trainee / Intern" etc.

            const text = (company + " " + title).toLowerCase();
            let role = "Software Trainee / Intern"; // Default fallback

            const hasKeyword = (keywords: string[]) => keywords.some(k => text.includes(k));

            if (hasKeyword(["support", "service", "operations"])) {
                role = "Application Support / IT Trainee";
            } else if (hasKeyword(["data", "analytics"])) {
                role = "Data Analyst Intern";
            }

            contactsToCreate.push({
                userId,
                email,
                name,
                company,
                title,
                role,
                detectedRole,
                status: "fresh"
            });
        }


        // Fetch Global Bounced List
        const bouncedRecords = await db.globalHrList.findMany({
            where: { status: "bounced" },
            select: { email: true }
        });
        const bouncedSet = new Set(bouncedRecords.map(r => r.email.toLowerCase()));

        // Create contacts sequentially or in parallel (manual skipDuplicates)
        let addedCount = 0;
        let duplicatesCount = 0;
        let skippedBounceCount = 0;

        // --- GLOBAL HR LIST SYNC ---
        // 1. Prepare data for Global HR List (Unique Emails)
        const globalHrEntries = contactsToCreate
            .map(c => ({
                email: c.email,
                domain: c.email.split('@')[1] || 'unknown',
                status: 'safe', // Default status for new uploads
                source: 'csv_upload'
            }));

        // 2. Remove duplicates within the file itself
        const uniqueHrEntries = Array.from(new Map(globalHrEntries.map(item => [item.email, item])).values());

        // 3. Bulk Insert (Manual Skip Duplicates)
        try {
            // A. Find which emails already exist
            const existingGlobal = await db.globalHrList.findMany({
                where: {
                    email: { in: uniqueHrEntries.map(e => e.email) }
                },
                select: { email: true }
            });

            const existingSet = new Set(existingGlobal.map(e => e.email));

            // B. Filter out existing
            const newHrEntries = uniqueHrEntries.filter(e => !existingSet.has(e.email));

            // C. Insert only new
            if (newHrEntries.length > 0) {
                await db.globalHrList.createMany({
                    data: newHrEntries
                });

                // --- BROADCAST NOTIFICATION TRIGGER ---
                // Notify all users that the community database has grown
                try {
                    await db.broadcast.create({
                        data: {
                            title: "Community Database Updated 🚀",
                            message: `${newHrEntries.length} new verified HR contacts have been added directly to the community list. Sync now to access them!`,
                            type: "community",
                            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
                        }
                    })
                } catch (broadcastErr) {
                    console.error("Failed to create broadcast:", broadcastErr)
                }
            }
        } catch (e) {
            console.error("Global HR List Sync Error:", e);
            // Non-blocking failure
        }
        // ---------------------------

        for (const contact of contactsToCreate) {
            // Check Global Bounce List
            if (bouncedSet.has(contact.email)) {
                skippedBounceCount++;
                continue;
            }

            try {
                // Check if exists
                const existing = await db.contact.findUnique({
                    where: {
                        userId_email: {
                            userId: contact.userId,
                            email: contact.email
                        }
                    }
                });

                if (!existing) {
                    await db.contact.create({ data: contact });
                    addedCount++;
                } else {
                    duplicatesCount++;
                }
            } catch (e) {
                console.error("Error creating contact:", contact.email, e);
                // Continue with next
            }
        }

        return NextResponse.json({
            message: "Processing complete",
            added: addedCount,
            totalInFile: rows.length,
            ignored: ignoredCount,
            duplicates: duplicatesCount,
            skippedBounce: skippedBounceCount
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Upload failed" }, { status: 500 });
    }
}
