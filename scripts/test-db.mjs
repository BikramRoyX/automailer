import 'dotenv/config';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    errorFormat: 'pretty'
});
// Actually, if passing absolute string "file:./dev.db", it resolves relative to cwd?
// Let's rely on Cwd being root.

const p = new PrismaClient({
    errorFormat: 'pretty'
});


// ... imports

async function main() {
    console.log("Testing Prisma Connection...");
    console.log("DB URL:", process.env.DATABASE_URL);
    try {
        await p.$connect();
        console.log("Connected successfully.");
        const count = await p.user.count();
        console.log("User count:", count);
    } catch (e) {
        console.error("Prisma Error:", e);
        fs.writeFileSync('db-error.log', e.toString() + "\n" + (e.stack || ""));
    } finally {
        await p.$disconnect();
    }
}
main();
