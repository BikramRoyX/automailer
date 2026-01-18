
// import { Profile } from "@prisma/client" // Commented out until generation
type Profile = any

interface GenerateOptions {
    profile: Profile
    companyName: string
    role: string
    contactName: string
    industry?: string // "SaaS", "Agency", "Finance", etc.
}

export interface GeneratedTemplate {
    id: string
    name: string
    subject: string
    body: string
    type: "Short" | "Detailed" | "Value-First" | "Follow-Up" | "Creative"
}

// --- DATA BANK ---

const OPENINGS = [
    "Hi {{contactName}},",
    "Hello {{contactName}},",
    "Dear {{contactName}},",
    "Hi {{contactName}}, hoping you're having a great week.",
    "Greetings {{contactName}},",
    "Hi there,",
    "Hello Team,", // Fallback
]

const HOOKS = [
    "I've been following {{companyName}}'s trajectory in the {{industry}} space and I'm impressed by your work.",
    "I noticed {{companyName}} is hiring for a {{role}} and I wanted to reach out directly.",
    "I recently came across {{companyName}} and love what you're building.",
    "Your recent work in {{industry}} caught my eye.",
    "I'm reaching out because I believe I can help {{companyName}} hit its engineering goals.",
    "My name is {{myName}} and I'm a {{role}} aimed at solving {{industry}} problems.",
    "I'll be brief: I'm a {{role}} who loves your product.",
    "Experienced {{role}} here, looking for a team that values shipping fast.",
    "I saw the {{role}} opening and knew I had to apply.",
    "Writing to you because standard applications often get lost in the noise.",
]

const VALUE_PROPS_GENERIC = [
    "I specialize in building scalable systems that drive growth.",
    "I don't just write code; I build products that users love.",
    "My focus is always on delivering value and solving complex problems.",
    "I bring a mix of technical speed and product thinking.",
    "I have a track record of shipping clean, reliable code.",
]

const CLOSINGS = [
    "I've attached my resume. Open to a quick 10-min intro?",
    "Resume attached. Let me know if you'd like to see some samples.",
    "Would love to chat if you're open to it.",
    "Attached my resume for your review.",
    "Are you open to connecting?",
    "Let me know if you have 5 minutes next week.",
    "My portfolio is attached. Hope to hear from you.",
    "Thanks for your time.",
    "Looking forward to potentially working together.",
    "Cheers,",
]

// --- HELPER FUNCTIONS ---

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const shuffleArray = <T>(array: T[]): T[] => {
    // Create a copy to avoid mutating the original if passed by reference (though here we pass new arrays)
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// --- CORE GENERATOR ---

export function generateSmartTemplates({
    profile,
    companyName,
    role,
    contactName,
    industry = "Tech"
}: GenerateOptions): GeneratedTemplate[] {

    // 1. Role Flavor Logic
    const getRoleFlavor = (r: string) => {
        const lower = r.toLowerCase()
        if (lower.includes('design') || lower.includes('ui') || lower.includes('ux')) {
            return {
                verb: "crafting pixel-perfect experiences",
                noun: "designs",
                impact: "user engagement",
                focus: "user-centric design"
            }
        }
        if (lower.includes('marke') || lower.includes('sales')) {
            return {
                verb: "driving revenue and growth",
                noun: "campaigns",
                impact: "ROI and conversion",
                focus: "data-driven growth"
            }
        }
        // Default (Dev/Eng)
        return {
            verb: "shipping clean, scalable code",
            noun: "systems",
            impact: "engineering velocity",
            focus: "system architecture"
        }
    }

    const flavor = getRoleFlavor(role)
    const skills = profile.skills ? profile.skills.split(',').slice(0, 3).join(', ') : (profile.preferredField || "modern tech")
    const myName = profile.fullName || "Candidate"

    // 2. Generate Combinations (The "100+" Concept)
    // We mathematically generate outcomes by picking random parts.
    // To ensure "User A sees 1,5,15" vs "User B sees 3,8,9", we just reshuffle every time.

    const templates: GeneratedTemplate[] = []

    // Helper to replace variables
    const fill = (text: string) => text
        .replace(/{{contactName}}/g, contactName)
        .replace(/{{companyName}}/g, companyName)
        .replace(/{{industry}}/g, industry)
        .replace(/{{role}}/g, role)
        .replace(/{{myName}}/g, myName)
        .replace(/{{skills}}/g, skills)
        .replace(/{{flavor.verb}}/g, flavor.verb)
        .replace(/{{flavor.noun}}/g, flavor.noun)
        .replace(/{{flavor.impact}}/g, flavor.impact)


    // STRATEGY: Create 20 "Raw" Candidates, then pick 5 unique types from them.

    for (let i = 0; i < 20; i++) {
        const opening = getRandom(OPENINGS)
        const hook = getRandom(HOOKS)
        const closing = getRandom(CLOSINGS)

        // Randomly pick a value prop strategy
        let valueProp = ""
        const strategy = Math.random()

        if (strategy < 0.33) {
            // Skill Focused
            valueProp = `I specialize in ${skills} and have a passion for ${flavor.verb}.`
        } else if (strategy < 0.66) {
            // Impact Focused
            valueProp = `I don't just "do the job"; I focus on ${flavor.impact}. My goal is to build ${flavor.noun} that scale.`
        } else {
            // Generic/Team Focused
            valueProp = getRandom(VALUE_PROPS_GENERIC)
        }

        const bodyRaw = `${opening}\n\n${hook}\n\n${valueProp}\n\n${closing}\n\nBest,\n${myName}`
        const body = fill(bodyRaw)
        const subject = fill(getRandom([
            `Application: ${myName} - ${role}`,
            `${role} Application - ${myName}`,
            `Regarding the ${role} position`,
            `Hi from ${myName} (${role})`,
            `Looking to join ${companyName} as ${role}`
        ]))

        // Determine Type based on length/style
        let type: GeneratedTemplate['type'] = "Detailed"
        if (body.length < 250) type = "Short"
        else if (hook.includes("impressed")) type = "Value-First"
        else type = "Creative"

        templates.push({
            id: `gen-${Math.random().toString(36).substr(2, 9)}`,
            name: `${type} Variation ${i + 1}`,
            type,
            subject,
            body
        })
    }

    // 3. Shuffle and Return 5
    // This gives the "Sab ko different show ho" effect.
    // Every call produces a random subset of the immense combinatorial space.
    return shuffleArray(templates).slice(0, 5)
}
