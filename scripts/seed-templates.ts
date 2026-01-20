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
        "Python Developer", "Full Stack Developer", "Backend Developer", "DevOps Engineer", "QA Engineer",
        // Business & Sales
        "Business Development Associate", "Sales Executive", "Marketing Intern", "Digital Marketing Executive",
        "Inside Sales Specialist", "Growth Hacker", "Product Manager", "Account Manager",
        // Operations & HR
        "HR Intern", "Operations Executive", "Management Trainee", "Recruiter", "Admin Executive",
        "Talent Acquisition Specialist", "HR Generalist", "Office Manager",
        // Creative
        "Content Writer", "Graphic Designer", "UI/UX Designer", "Social Media Manager",
        "Video Editor", "Copywriter", "Creative Director",
        // General / Common
        "Executive Trainee", "Office Assistant", "Project Coordinator", "Research Analyst",
        "Virtual Assistant", "Data Entry Operator"
    ];

    const traits = [
        "Fast Learner", "Hardworking", "Detail-Oriented", "Creative",
        "Data-Driven", "Results-Oriented", "Proactive", "Team Player",
        "Communicative", "Organized", "Adaptable", "Innovative", "Analytical", "Self-Motivated"
    ];

    // Generic Skills applicable to many fields + some specific ones
    const skills = [
        "Communication", "Management", "Problem Solving", "Analysis",
        "Coordination", "Research", "Planning", "Execution",
        "Java", "Python", "Excel", "PowerPoint", "CRM Tools", "Social Media",
        "JavaScript", "TypeScript", "SQL", "Git", "Canva", "Photoshop"
    ];

    const openings = [
        "I am writing to express my interest in the [Role] position.",
        "I recently came across the [Role] opportunity at [Company] and felt compelled to apply.",
        "I am looking for an opportunity to kickstart my career as a [Role] at [Company].",
        "I have been following [Company]'s work and would love to contribute as a [Role].",
        "I am eager to apply my skills as a [Role] in your esteemed organization.",
        "I am excited to submit my application for the [Role] position at [Company].",
        "With a strong passion for [Field], I am applying for the [Role] position."
    ];

    const middles = [
        "I have a strong background in [Skill] and [Skill]. I am confident in my ability to deliver results.",
        "My academic background has given me a strong foundation, but my hands-on experience with [Skill] demonstrates my practical readiness.",
        "I am particularly passionate about being [Trait] and have experience with [Skill]. I love solving complex problems.",
        "I have focused heavily on [Skill] and have developed a deep understanding of [Skill].",
        "I recently completed a project utilizing [Skill] which improved my understanding of real-world workflows.",
        "I thrive in fast-paced environments and pride myself on being [Trait] and efficient.",
        "My expertise in [Skill] and [Skill] allows me to contribute effectively from day one."
    ];

    const closings = [
        "I am eager to bring my energy and fresh perspective to your team.",
        "I am available for an interview at your earliest convenience.",
        "I would welcome the chance to discuss how I can contribute to [Company].",
        "Thank you for considering my application. I look forward to hearing from you.",
        "I am ready to start immediately and eager to learn from your team.",
        "I look forward to the possibility of discussing this exciting opportunity with you.",
        "Thank you for your time and consideration."
    ];

    const subjects = [
        "Application for [Role]",
        "Hiring Inquiry: [Role] (Immediate Joiner)",
        "Resume: [Role] - {{sender_name}}",
        "Candidate for [Role] - [Skill] Specialist",
        "Application: [Role] - Fresher / Intern",
        "[Role] Application - Passionate & [Trait]",
        "Inquiry for [Role] Position",
        "Job Application: [Role] - {{sender_name}}",
        "Regarding [Role] Opening - [Skill]"
    ];

    const templatesToCreate: any[] = [];

    // Generate 300 Diverse Templates (increased from 120)
    for (let i = 0; i < 300; i++) {
        const randomRole = roles[Math.floor(Math.random() * roles.length)];
        const randomSkill1 = skills[Math.floor(Math.random() * skills.length)];
        const randomSkill2 = skills[Math.floor(Math.random() * skills.length)];
        const randomTrait = traits[Math.floor(Math.random() * traits.length)];
        // Extract basic field (e.g. "Software" from "Software Trainee") for variability
        const field = randomRole.split(" ")[0] || "General";

        let sub = subjects[Math.floor(Math.random() * subjects.length)]
            .replace("[Role]", randomRole)
            .replace("[Skill]", randomSkill1)
            .replace("[Trait]", randomTrait);

        const open = openings[Math.floor(Math.random() * openings.length)]
            .replace("[Role]", randomRole)
            .replace("[Field]", field);

        const mid = middles[Math.floor(Math.random() * middles.length)]
            .replace("[Skill]", randomSkill1)
            .replace("[Skill]", randomSkill2)
            .replace("[Trait]", randomTrait);

        const close = closings[Math.floor(Math.random() * closings.length)];

        // Strict Structure Requested by User
        // Fix: Use Variables {{sender_name}} and {{sender_phone}} instead of hardcoded
        const bodyWithNewLines =
            `Dear [Name],
 
 ${open}
 
 ${mid}
 
 ${close}
 
 Please find my resume attached for your review.
 
 Regards,
 {{sender_name}}
 {{sender_phone}}`;

        templatesToCreate.push({
            userId,
            name: `Div-Gen ${i + 1}: ${randomRole}`,
            role: "General", // Using General so they are easily filterable if needed
            subject: sub,
            body: bodyWithNewLines
        });
    }

    // Optional: Add some explicit High-Intent templates for key roles
    const specificRoles = ["Python Developer", "Data Analyst", "HR Intern"];
    specificRoles.forEach((role, idx) => {
        templatesToCreate.push({
            userId,
            name: `Special-Gen: ${role}`,
            role: role,
            subject: `Application for ${role} - {{sender_name}}`,
            body: `Dear [Name],\n\nI am writing to apply for the ${role} position.\n\nI have strong skills in Python and Data Analysis. I am confident I can contribute to your team.\n\nRegards,\n{{sender_name}}\n{{sender_phone}}`
        });
    });

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
