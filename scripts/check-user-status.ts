import { db } from "@/lib/db"

async function main() {
    console.log("Checking User Resume Status...")

    const user = await db.user.findFirst({
        select: {
            email: true,
            resumePath: true,
            resumeName: true,
            isSetupComplete: true,
            _count: {
                select: { contacts: true, templates: true }
            }
        }
    })

    console.log("User Data:", JSON.stringify(user, null, 2))

    const freshContacts = await db.contact.count({ where: { status: 'fresh' } })
    console.log("Fresh Contacts:", freshContacts)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await db.$disconnect())
