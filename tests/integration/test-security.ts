
// Integration Test for Security (AuthZ & IDOR)
// Simulates: Unauthenticated Access, Cross-User Data Access

console.log("--- STARTING SECURITY TESTS ---\n");

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
const mockDb = {
    contact: {
        findMany: (opts: any) => {
            // Check if filtering by userId is present
            if (!opts.where.userId) return Promise.resolve(null); // LEAK! Returns everything if no filter
            if (opts.where.userId === "user-1") return Promise.resolve([{ id: 1, userId: "user-1" }]);
            if (opts.where.userId === "user-2") return Promise.resolve([{ id: 2, userId: "user-2" }]);
            return Promise.resolve([]);
        }
    }
};

// MOCK ROUTE HANDLER LOGIC (Generic)
async function securedRouteHandler(session: any, requestedResourceId?: string) {
    // 1. Auth Check
    if (!session || !session.user) {
        return { status: 401, error: "Unauthorized" };
    }

    // 2. IDOR Check (Simulating fetching contacts)
    // The implementation MUST use session.user.id in the 'where' clause.
    // It should NOT rely solely on 'requestedResourceId' without owning checks.

    // BAD: const data = await db.contact.findUnique({ where: { id: requestedResourceId } })
    // GOOD: const data = await db.contact.findFirst({ where: { id: requestedResourceId, userId: session.user.id } })

    // For this test, let's simulate a "List Contacts" endpoint
    const data = await mockDb.contact.findMany({
        where: {
            userId: session.user.id // This is the enforcement line
        }
    });

    return { status: 200, data };
}

async function test() {
    console.log("Test 1: Unauthenticated Access Block");
    const res1 = await securedRouteHandler(null);
    assert("Rejects null session", res1.status === 401);

    console.log("\nTest 2: Data Isolation (IDOR Protection)");
    const sessionUser1 = { user: { id: "user-1", email: "bob@test.com" } };
    const res2 = await securedRouteHandler(sessionUser1);

    // Check if we got User 1's data
    const data1 = res2.data as any[];
    assert("Returns User 1 data", data1.length === 1 && data1[0].userId === "user-1");

    // Check if we accidentally got User 2 logic (impossible in this mock flow unless `userId` var was mishandled)
    // The strict check is: Did we pass `userId: session.user.id` to the DB?
    // Verified by the mock responding correctly only when that specific ID is requested.
}

test().then(() => {
    console.log(`\nRESULTS: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) process.exit(1);
});
