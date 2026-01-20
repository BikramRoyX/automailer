
import { db } from "@/lib/db"

async function main() {
    const email = "jasonroycompany@gmail.com" // correcting potential typo from user input 'jasonroy comapny@gmail.com'
    const email2 = "jasonroycomapny@gmail.com" // trying exact input just in case

    console.log(`Searching for users: ${email}, ${email2}`)

    const users = await db.user.findMany({
        where: {
            email: { in: [email, email2] }
        }
    })

    if (users.length === 0) {
        console.log("No user found with that email.")

        // List all users to help debug
        const allUsers = await db.user.findMany({ select: { email: true, id: true } })
        console.log("Available users:", allUsers)
        return
    }

    users.forEach(u => {
        console.log(`Found User: ${u.email} | ID: ${u.id}`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await db.$disconnect())
