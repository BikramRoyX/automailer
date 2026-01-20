
import { db } from "@/lib/db"
import * as fs from 'fs';

async function main() {
    console.log("Fetching Global HR List (Community Database)...")
    console.log("------------------------------------------------")

    const hrList = await db.globalHrList.findMany({
        take: 100, // Limit to 100 to avoid flooding terminal
        orderBy: { createdAt: 'desc' }
    })

    if (hrList.length === 0) {
        console.log("No HR contacts found in the Global Community Database.")
        return
    }

    let output = `Found ${hrList.length} entries:\n`;
    hrList.forEach((hr, index) => {
        output += `[${index + 1}] ${hr.email} | ${hr.status} | Source: ${hr.source} | ${hr.domain}\n`;
    })

    fs.writeFileSync('hr-list.txt', output);
    console.log("Successfully wrote HR list to hr-list.txt");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await db.$disconnect())
