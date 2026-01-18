
import robotsParser from 'robots-parser';

interface DomainPolicy {
    lastRequest: number;
    robots: any;
}

const policies: Record<string, DomainPolicy> = {};

export class AgentPolicy {

    // Random delay between 40s and 120s
    static async enforceDelay(): Promise<void> {
        const delay = Math.floor(Math.random() * (120000 - 40000 + 1) + 40000);
        console.log(`⏳ Agent Safety Delay: ${Math.round(delay / 1000)}s...`);
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    static async checkRobots(urlStr: string): Promise<boolean> {
        try {
            const url = new URL(urlStr);
            const domain = url.origin;
            const robotsUrl = `${domain}/robots.txt`;

            if (!policies[domain]) {
                console.log(`🤖 Fetching robots.txt for ${domain}`);
                const resp = await fetch(robotsUrl);
                if (resp.ok) {
                    const txt = await resp.text();
                    policies[domain] = {
                        lastRequest: 0,
                        robots: robotsParser(robotsUrl, txt)
                    };
                } else {
                    // Fallback: Assume allowed if no robots.txt, but be cautious
                    policies[domain] = { lastRequest: 0, robots: null };
                }
            }

            const policy = policies[domain];
            if (policy.robots) {
                // UserAgent 'AutoMailer' or '*'
                const allowed = policy.robots.isAllowed(urlStr, 'AutoMailer') ?? policy.robots.isAllowed(urlStr, '*');
                if (!allowed) {
                    console.warn(`⛔ robots.txt disallows browsing: ${urlStr}`);
                    return false;
                }
            }

            return true;
        } catch (e) {
            console.error("Policy Check Error", e);
            // Fail safe
            return false;
        }
    }
}
