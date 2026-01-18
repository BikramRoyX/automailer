
import { BrowserManager } from '@/lib/browser/client';
import { AgentPolicy } from '@/lib/agent/policy';
import { Extractor } from '@/lib/browser/extractor';
import { db } from '@/lib/db';

export class AgentCoordinator {

    // Main entry point
    static async runHarvest(userId: string, startUrls: string[]) {
        console.log(`🚀 Starting Harvest Agent for User ${userId}`);
        const browser = BrowserManager.getInstance();

        try {
            const { page } = await browser.newPage();

            for (const url of startUrls) {
                // 1. Safety Check
                const allowed = await AgentPolicy.checkRobots(url);
                if (!allowed) continue;

                // 2. Navigation
                console.log(`\n🌐 Navigating to: ${url}`);
                try {
                    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                } catch (e) {
                    console.error(`Failed to load ${url}: `, e);
                    continue;
                }

                // 3. Extraction
                const contacts = await Extractor.scanPage(page);
                console.log(`✅ Found ${contacts.length} potential contacts.`);

                // 4. Processing & Saving
                for (const contact of contacts) {
                    // Check Duplicate
                    const exists = await db.contact.findUnique({
                        where: { userId_email: { userId, email: contact.email } }
                    });

                    if (exists) {
                        console.log(`   ⏭️ Skipped (Duplicate): ${contact.email}`);
                        continue;
                    }

                    // Save
                    await db.contact.create({
                        data: {
                            userId,
                            email: contact.email,
                            role: contact.role,
                            detectedRole: contact.role,
                            sourceUrl: url,
                            status: 'fresh'
                        }
                    });
                    console.log(`   💾 Saved: ${contact.email}`);
                }

                // 5. Safety Delay (Randomized)
                await AgentPolicy.enforceDelay();
            }

        } catch (e) {
            console.error("CRITICAL AGENT ERROR", e);
        } finally {
            await browser.close();
        }
    }
}
