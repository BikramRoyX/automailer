import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting Diverse Template Seeding...");

    const user = await prisma.user.findFirst();
    if (!user) {
        console.error("No user found in database. Please register first.");
        return;
    }

    const userId = user.id;
    console.log(`Seeding for user: ${user.name || user.email} (${userId})`);

    // --- BROAD GENERATORS (All Specifications) ---
    const roles = [
        // Tech
        "Software Trainee", "React Developer", "Data Analyst", "Web Developer", "Frontend Engineer",
        // Business & Sales
        "Business Development Associate", "Sales Executive", "Marketing Intern", "Digital Marketing Executive",
        // Operations & HR
        "HR Intern", "Operations Executive", "Management Trainee", "Recruiter", "Admin Executive",
        // Creative
        "Content Writer", "Graphic Designer", "UI/UX Designer", "Social Media Manager",
        // General / Common
        "Executive Trainee", "Office Assistant", "Project Coordinator", "Research Analyst"
    ];

    const traits = [
        "Fast Learner", "Hardworking", "Detail-Oriented", "Creative",
        "Data-Driven", "Results-Oriented", "Proactive", "Team Player",
        "Communicative", "Organized"
    ];

    // Generic Skills applicable to many fields + some specific ones
    const skills = [
        "Communication", "Management", "Problem Solving", "Analysis",
        "Coordination", "Research", "Planning", "Execution",
        "Java", "Python", "Excel", "PowerPoint", "CRM Tools", "Social Media"
    ];

    const openings = [
        "I am writing to express my interest in the [Role] position.",
        "I recently came across the [Role] opportunity at [Company] and felt compelled to apply.",
        "I am looking for an opportunity to kickstart my career as a [Role] at [Company].",
        "I have been following [Company]'s work and would love to contribute as a [Role].",
        "I am eager to apply my skills as a [Role] in your esteemed organization."
    ];

    const middles = [
        "I have a strong background in [Skill] and [Skill]. I am confident in my ability to deliver results.",
        "My academic background has given me a strong foundation, but my hands-on experience with [Skill] demonstrates my practical readiness.",
        "I am particularly passionate about being [Trait] and have experience with [Skill]. I love solving complex problems.",
        "I have focused heavily on [Skill] and have developed a deep understanding of [Skill].",
        "I recently completed a project utilizing [Skill] which improved my understanding of real-world workflows."
    ];

    const closings = [
        "I am eager to bring my energy and fresh perspective to your team.",
        "I am available for an interview at your earliest convenience.",
        "I would welcome the chance to discuss how I can contribute to [Company].",
        "Thank you for considering my application. I look forward to hearing from you.",
        "I am ready to start immediately and eager to learn from your team."
    ];

    const subjects = [
        "Application for [Role]",
        "Hiring Inquiry: [Role] (Immediate Joiner)",
        "Resume: [Role] - Bikram Roy",
        "Candidate for [Role] - [Skill] Specialist",
        "Application: [Role] - Fresher / Intern",
        "[Role] Application - Passionate & [Trait]",
        "Inquiry for [Role] Position"
    ];

    const templatesToCreate: any[] = [];

    // Generate 120 Diverse Templates
    for (let i = 0; i < 120; i++) {
        const randomRole = roles[Math.floor(Math.random() * roles.length)];
        const randomSkill1 = skills[Math.floor(Math.random() * skills.length)];
        const randomSkill2 = skills[Math.floor(Math.random() * skills.length)];
        const randomTrait = traits[Math.floor(Math.random() * traits.length)];

        let sub = subjects[Math.floor(Math.random() * subjects.length)]
            .replace("[Role]", randomRole)
            .replace("[Skill]", randomSkill1)
            .replace("[Trait]", randomTrait);

        // Cleanup brackets if any logic missed
        sub = sub.replace("[Role]", "Candidate");

        const open = openings[Math.floor(Math.random() * openings.length)]
            .replace("[Role]", randomRole);

        const mid = middles[Math.floor(Math.random() * middles.length)]
            .replace("[Skill]", randomSkill1)
            .replace("[Skill]", randomSkill2)
            .replace("[Trait]", randomTrait);

        const close = closings[Math.floor(Math.random() * closings.length)];

        // Strict Structure Requested by User
        // Note: [Name] gets replaced by the actual contact name in send/route.ts
        // [My Name] etc. are static signature here
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
            name: `Div-Gen ${i + 1}: ${randomRole}`,
            role: "General", // Using General so they are easily filterable if needed
            subject: sub,
            body: bodyWithNewLines
        });
    }

    const created = await prisma.template.createMany({
        data: templatesToCreate,
    });

    console.log(`✅ Successfully created ${created.count} diverse templates.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
