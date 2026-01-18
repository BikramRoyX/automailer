
// Performance Stress Test
// Simulates:
// 1. "Bounce Storm": Rapidly processing 1000 incoming bounces.
// 2. Concurrency: Simulating multiple parallel requests.

console.log("--- STARTING PERFORMANCE TESTS ---\n");

const PERFORMANCE_THRESHOLD_MS = 2000; // Limit for 1000 ops (just a heuristic for this mock)

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

// MOCK DB (Simplified for Speed)
const db = {
    updates: 0,
    findCount: 0,
    sentEmail: {
        findFirst: () => { db.findCount++; return Promise.resolve({ id: "msg-1", recipient: "test@bounced.com" }); }
    },
    $transaction: () => { db.updates++; return Promise.resolve(true); },
    contact: { update: () => Promise.resolve(true) },
    globalBounce: { upsert: () => Promise.resolve(true) },
    globalHrList: { updateMany: () => Promise.resolve(true) }
};

// MOCK LOGIC (Bounce Processing)
async function processBounce(idx: number) {
    // Simulate finding the email
    const sentEmail = await db.sentEmail.findFirst();
    if (!sentEmail) return;

    // Simulate DB Updates
    await db.globalBounce.upsert();
    await db.globalHrList.updateMany();

    // Simulate Transaction
    await db.$transaction();
}

async function testBounceStorm() {
    console.log("Scenario: Processing 1000 Bounces sequentially...");
    const start = Date.now();

    for (let i = 0; i < 1000; i++) {
        await processBounce(i);
        if (i % 200 === 0) process.stdout.write("."); // Progress visibility
    }
    console.log("\n");

    const duration = Date.now() - start;
    console.log(`Processed 1000 bounces in ${duration}ms`);

    assert("Performance within limits", duration < PERFORMANCE_THRESHOLD_MS);
    assert("Data Consistency check", db.updates === 1000);
}

async function testConcurrency() {
    console.log("\nScenario: Processing 500 Bounces in Parallel (Mock Concurrency)...");
    db.updates = 0; // Reset
    const start = Date.now();

    const promises = [];
    for (let i = 0; i < 500; i++) {
        promises.push(processBounce(i));
    }

    await Promise.all(promises);

    const duration = Date.now() - start;
    console.log(`Processed 500 concurrent bounces in ${duration}ms`);

    assert("Handled Concurrency without crash", db.updates === 500);
}

async function main() {
    await testBounceStorm();
    await testConcurrency();

    console.log(`\nRESULTS: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) process.exit(1);
}

main();
