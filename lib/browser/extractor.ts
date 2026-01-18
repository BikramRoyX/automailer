
import { Page } from 'playwright';

export interface ExtractedContact {
    email: string;
    role?: string;
    description?: string;
}

export class Extractor {

    static async scanPage(page: Page): Promise<ExtractedContact[]> {
        console.log(`👀 Scanning page content...`);

        // 1. Get raw text
        const content = await page.content();
        const bodyText = await page.innerText('body');

        // 2. Simple regex for emails
        const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/g;
        const potentialEmails = Array.from(new Set(bodyText.match(emailRegex) || []));

        const contacts: ExtractedContact[] = [];

        // 3. Keyword Heuristics
        const hrKeywords = ['recruiter', 'talent', 'hiring', 'careers', 'people', 'hr'];

        for (const email of potentialEmails) {
            // Filter junk
            if (email.includes('sentry') || email.includes('noreply') || email.includes('domain.com')) continue;

            const lowerEmail = email.toLowerCase();
            let score = 0;
            let role = 'Unknown';

            // Heuristic A: Email contains HR terms
            if (hrKeywords.some(k => lowerEmail.includes(k))) {
                score += 5;
                role = 'HR / Recruitment';
            }

            // Heuristic B: Context Analysis (Is the email near the word "hiring"?)
            // A simple proximity check around the email in bodyText
            const index = bodyText.indexOf(email);
            const context = bodyText.substring(Math.max(0, index - 50), Math.min(bodyText.length, index + 50)).toLowerCase();

            if (hrKeywords.some(k => context.includes(k))) {
                score += 3;
                role = 'HR Context';
            }

            if (score > 0) {
                contacts.push({ email, role, description: `Extracted from context: "${context.trim()}..."` });
            }
        }

        return contacts;
    }
}
