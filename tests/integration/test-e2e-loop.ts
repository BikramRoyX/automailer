
// End-to-End (E2E) Integration Loop
// Simulates the full lifecycle:
// 1. User Setup (Mocked)
// 2. Contact Import (CSV)
// 3. Campaign Execution (Sending)
// 4. Feedback Loop (Bounce)
// 5. Analytics Check

console.log("--- STARTING E2E LOOP TESTS ---\n");

let passed = 0;
let failed = 0;

function assert(description: string, condition: boolean) {
    if (condition) {
        console.log(`[PASS] ${description}`);
        passed++;
    } else {
        console.error(`[FAIL] ${description}`);
        failed++;
    }
}

// SHARED STATE (Simulating DB)
const dbState: any = {
    user: { id: "u1", email: "e2e@test.com", dailyLimit: 50 },
    contacts: [],
    logs: []
};

// 1. IMPORT STEP
async function importContacts(csvRows: string[]) {
    console.log("[STEP 1] Importing Contacts...");
    // Simulate parsing and DB insertion
    const newContacts = csvRows.map((email, idx) => ({
        id: `c-${idx}`,
        userId: dbState.user.id,
        email: email.toLowerCase().trim(), // Apply Normalization Logic
        status: "fresh"
    }));
    dbState.contacts.push(...newContacts);
    return newContacts.length;
}

// 2. SEND STEP
async function runCampaign() {
    console.log("[STEP 2] Running Campaign...");
    const fresh = dbState.contacts.filter((c: any) => c.status === "fresh");

    for (const contact of fresh) {
        // Simulate Send Limit Check
        const sentToday = dbState.logs.filter((l: any) => l.type === "email_sent").length;
        if (sentToday >= dbState.user.dailyLimit) break;

        // Simulate Send
        contact.status = "sent";
        contact.messageId = `msg-${contact.id}`; // Assign ID for bounce matching

        // Log
        dbState.logs.push({
            type: "email_sent",
            userId: dbState.user.id,
            contactId: contact.id,
            timestamp: new Date()
        });
    }
    return dbState.contacts.filter((c: any) => c.status === "sent").length;
}

// 3. BOUNCE STEP
async function processBounce(bounceBody: string) {
    console.log("[STEP 3] Processing Webhook/Bounce...");
    // Simulate Scanner Logic
    const msgIdMatch = bounceBody.match(/Original-Message-ID:\s*<([^>]+)>/i);
    if (!msgIdMatch) return 0;
    const originalId = msgIdMatch[1];

    // Find in DB
    const contact = dbState.contacts.find((c: any) => c.messageId === originalId);
    if (contact) {
        contact.status = "bounced";
        return 1;
    }
    return 0;
}

// 4. ANALYTICS STEP
async function checkStats() {
    console.log("[STEP 4] Checking Analytics...");
    const sent = dbState.contacts.filter((c: any) => c.status === "sent").length; // Should be 1 (since 1 bounced) ? 
    // Wait, typical analytics might show "Sent: 2, Bounced: 1". 
    // Or if status is exclusive enum, "Sent: 1, Bounced: 1".
    // In our schema, status is exclusive enum.
    const bounced = dbState.contacts.filter((c: any) => c.status === "bounced").length;
    return { sent, bounced };
}

// EXECUTE FLOW
async function runE2E() {
    // 1. Import
    const count = await importContacts([" Valid@User.com ", "bouncer@fail.com"]);
    assert("Imported 2 contacts (Normalized)", count === 2 && dbState.contacts[0].email === "valid@user.com");

    // 2. Send
    const sentCount = await runCampaign();
    assert("Sent to 2 contacts", sentCount === 2);

    // 3. Bounce
    // Simplify: The second contact (bouncer@fail.com) BOUNCES.
    // Its ID is `msg-c-1`.
    const bouncePayload = `
        Subject: Delivery Status Notification (Failure)
        ...
        Original-Message-ID: <msg-c-1>
    `;
    const processed = await processBounce(bouncePayload);
    assert("Processed 1 bounce", processed === 1);

    // 4. Stats
    const stats = await checkStats();
    // Valid@User.com is SENT. Bouncer@Fail.com is BOUNCED.
    assert("Analytics: 1 Sent, 1 Bounced", stats.sent === 1 && stats.bounced === 1);
}

runE2E().then(() => {
    console.log(`\nRESULTS: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) process.exit(1);
});
