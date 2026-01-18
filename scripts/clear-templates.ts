
import { db } from "@/lib/db"

async function main() {
    try {
        console.log("Clearing templates for all users...")
        const { count } = await db.template.deleteMany({})
        console.log(`Deleted ${count} templates.`)

        // Also verify counts
        const users = await db.user.findMany({
            include: { _count: { select: { templates: true } } }
        })

        console.log("User Template Counts:")
        users.forEach(u => {
            console.log(`${u.email}: ${u._count.templates}`)
        })

    } catch (error) {
        console.error("Error clearing templates:", error)
    } finally {
        await db.$disconnect()
    }
}

main()
