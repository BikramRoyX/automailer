import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const userId = session.user.id;

    // --- CONTEXT ---
    // User Context: BCA Final Year Student, Software Trainee / Intern
    // Signature: Bikram Roy | 8969640393

    // --- GENERATORS ---
    const roles = [
        "Software Trainee", "Software Intern", "React Developer Intern", "Node.js Trainee",
        "Full Stack Intern", "Web Developer Fresher", "Frontend Intern", "Backend Trainee",
        "Junior Developer", "Graduate Engineer Trainee (GET)"
    ];

    const traits = [
        "Quick Learner", "Problem Solver", "Passionate Coder", "UI Enthusiast",
        "Backend Focused", "Database Skilled", "API Specialist"
    ];

    const skills = [
        "React & Next.js", "Node.js & Express", "JavaScript & TypeScript",
        "Python & Django", "SQL & Prisma", "Tailwind CSS", "MongoDB", "Redux"
    ];

    const openings = [
        "I am writing to express my interest in the [Role] position.",
        "I recently came across the [Role] opportunity at [Company] and felt compelled to apply.",
        "I am a BCA Final Year student eager to kickstart my career as a [Role] at [Company].",
        "I have been following [Company]'s work and would love to contribute as a [Role].",
        "I am looking for an opportunity to apply my skills as a [Role] in your esteemed organization."
    ];

    const middles = [
        "I have built several academic projects using [Skill] and [Skill]. I am confident in my ability to write clean, maintainable code.",
        "My coursework in BCA has given me a strong foundation, but my self-driven projects in [Skill] demonstrate my practical readiness.",
        "I am particularly passionate about [Trait] and have hands-on experience with [Skill]. I love solving logic puzzles.",
        "During my studies, I focused heavily on [Skill] and have developed a deep understanding of web architecture.",
        "I recently completed a project utilizing [Skill] which improved my understanding of real-world development cycles."
    ];

    const closings = [
        "I am eager to bring my energy and fresh perspective to your team.",
        "I am available for an interview at your earliest convenience.",
        "I would welcome the chance to discuss how I can contribute to [Company].",
        "Thank you for considering my application. I look forward to hearing from you.",
        "I am ready to start immediately and eager to learn from your team."
    ];

    const subjects = [
        "Application for [Role] - BCA Final Year",
        "Hiring Inquiry: [Role] (Immediate Joiner)",
        "Resume: [Role] - Bikram Roy",
        "Candidate for [Role] - [Skill] Developer",
        "Application: [Role] - Fresher / Intern",
        "[Role] Application - Passionate about [Skill]",
        "Inquiry for [Role] Position - BCA Graduate"
    ];

    const templatesToCreate: any[] = [];

    // Generate 100+ Templates
    for (let i = 0; i < 110; i++) {
        // Randomize
        const randomRole = roles[Math.floor(Math.random() * roles.length)];
        const randomSkill1 = skills[Math.floor(Math.random() * skills.length)];
        const randomSkill2 = skills[Math.floor(Math.random() * skills.length)];
        const randomTrait = traits[Math.floor(Math.random() * traits.length)];

        const sub = subjects[Math.floor(Math.random() * subjects.length)]
            .replace("[Role]", randomRole)
            .replace("[Skill]", randomSkill1);

        const open = openings[Math.floor(Math.random() * openings.length)]
            .replace("[Role]", randomRole);

        const mid = middles[Math.floor(Math.random() * middles.length)]
            .replace("[Skill]", randomSkill1)
            .replace("[Skill]", randomSkill2) // Replace 2nd occurrence if any
            .replace("[Trait]", randomTrait);

        const close = closings[Math.floor(Math.random() * closings.length)];

        // Strict Structure Requested by User
        const bodyWithNewLines =
            `Dear [Name],

${open}

${mid}

${close}

Please find my resume attached for your review.

Regards,
Bikram Roy
8969640393`;

        templatesToCreate.push({
            userId,
            name: `Auto-Gen ${i + 1}: ${randomRole}`,
            role: "Software Engineer", // Generic category for db
            subject: sub,
            body: bodyWithNewLines
        });
    }

    try {
        // Clear old auto-gen templates? Maybe keep them. User said "100+".
        // Let's just createMany
        await db.template.createMany({
            data: templatesToCreate
        });

        return NextResponse.json({
            success: true,
            message: `Created ${templatesToCreate.length} distinctive templates.`
        });

    } catch (e) {
        console.error(e);
        return new NextResponse("Failed to seed templates", { status: 500 });
    }
}
