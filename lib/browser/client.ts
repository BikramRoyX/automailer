
import { chromium, Browser, BrowserContext, Page } from 'playwright';

export class BrowserManager {
    private static instance: BrowserManager;
    private browser: Browser | null = null;

    private constructor() { }

    public static getInstance(): BrowserManager {
        if (!BrowserManager.instance) {
            BrowserManager.instance = new BrowserManager();
        }
        return BrowserManager.instance;
    }

    public async launch(): Promise<Browser> {
        if (!this.browser) {
            console.log("🌐 Launching Browser Agent...");
            this.browser = await chromium.launch({
                headless: true, // Run visible for debugging if needed
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
        return this.browser;
    }

    public async newPage(): Promise<{ page: Page; context: BrowserContext }> {
        const browser = await this.launch();
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 AutoMailer/1.0 (Bot; +http://localhost:3000)',
            viewport: { width: 1280, height: 720 }
        });
        const page = await context.newPage();
        return { page, context };
    }

    public async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            console.log("🛑 Browser Agent Closed.");
        }
    }
}
