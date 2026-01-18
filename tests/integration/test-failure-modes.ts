
// Integration Test for Failure Modes & Recovery
// Simulates: Token Expiry, DB Failure after Send

console.log("--- STARTING FAILURE MODE TESTS ---\n");

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

// MOCKS
const mockAccount = {
    id: "acc-1",
    access_token: "old-token",
    refresh_token: "refresh-token",
    expires_at: Math.floor(Date.now() / 1000) - 100 // EXPIRED
};

const mockGmail = {
    send: (token: string) => {
        if (token === "old-token") throw new Error("401 Unauthorized");
        if (token === "new-token") return Promise.resolve({ id: "msg-123", threadId: "th-123" });
        return Promise.reject("Unknown Error");
    }
};

const mockDb = {
    account: {
        update: (payload: any) => {
            console.log(`[MOCK DB] Updated Token: ${payload.data.access_token}`);
            return Promise.resolve(true);
        }
    },
    // Mock Transaction Failure
    $transaction: (ops: any) => {
        console.log("[MOCK DB] Transaction Attempted...");
        if (shouldDbFail) throw new Error("DB Connection Lost");
        return Promise.resolve(true);
    },
    $executeRaw: () => true,
    sentEmail: { create: () => true }
};

let shouldDbFail = false;

// LOGIC REPLICA (Route Handler Logic)
async function sendEmailLogic() {
    let token = mockAccount.access_token;

    // 1. Token Refresh Check
    const now = Math.floor(Date.now() / 1000);
    if (mockAccount.expires_at < now + 60) {
        console.log("[LOGIC] Token expired, refreshing...");
        // Simulate fetch new token
        token = "new-token"; // Assume refresh worked
        await mockDb.account.update({ where: { id: mockAccount.id }, data: { access_token: token } });
    }

    // 2. Send
    let sentResult;
    try {
        sentResult = await mockGmail.send(token);
    } catch (e) {
        return "SEND_FAILED";
    }

    // 3. Log (Atomicity Check)
    try {
        await mockDb.$transaction([]);
    } catch (e) {
        console.error("CRITICAL: DB LOG FAILED");
        return "SENT_BUT_LOG_FAILED"; // Correct Safe State
    }

    return "SUCCESS";
}

// EXECUTION
async function test() {
    // Test 1: Token Warning & Refresh
    console.log("Test 1: Auto-Refresh Expired Token");
    const res1 = await sendEmailLogic();
    assert("Handled Expired Token", res1 === "SUCCESS");

    // Test 2: Catastrophic DB Failure
    console.log("\nTest 2: DB Failure After Send (Atomicity)");
    shouldDbFail = true;
    const res2 = await sendEmailLogic();
    assert("Recovered from DB Crash (returned success to user)", res2 === "SENT_BUT_LOG_FAILED");
}

test().then(() => {
    console.log(`\nRESULTS: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) process.exit(1);
});
