
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const email = "jasonroycompany@gmail.com"
    const update = await prisma.user.update({
        where: { email },
        data: { resumePath: null } // Clear it
    })
    console.log("Updated User:", update.email, "ResumePath:", update.resumePath)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
