
// Standalone Test Script for Bounce Regex
// Run with: npx tsx tests/unit/test-bounce-regex.ts

console.log("--- STARTING BOUNCE REGEX UNIT TESTS ---\n");

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

// 1. RE-IMPLEMENT LOGIC TO TEST (We mock the extraction logic from bounce-scanner.ts)
// We copy the regexes exactly as they appear in the file.
function parseBounce(bodyText: string) {
    const msgIdMatch = bodyText.match(/Message-ID:\s*<([^>]+)>/i)
    const originalMsgIdMatch = bodyText.match(/Original-Message-ID:\s*<([^>]+)>/i);

    let originalMsgId = originalMsgIdMatch ? originalMsgIdMatch[1] : (msgIdMatch ? msgIdMatch[1] : null);

    const reasonMatch = bodyText.match(/Diagnostic-Code: smtp; (.*)/i) ||
        bodyText.match(/Status:\s*5\.\d+\.\d+/i) ||
        bodyText.match(/550 (.*)/);

    const reason = reasonMatch ? reasonMatch[0] : null;

    return { originalMsgId, reason };
}

// TEST CASES

// Case 1: Standard Postfix/Sendmail Bounce
const case1 = `
Content-Type: message/delivery-status

Reporting-MTA: dns; googlemail.com
Received-From-MTA: dns; mail.example.com
Arrival-Date: Mon, 16 Jan 2026 12:00:00 -0000

Final-Recipient: rfc822; invalid@example.com
Action: failed
Status: 5.1.1
Diagnostic-Code: smtp; 550-5.1.1 The email account that you tried to reach does not exist.

Content-Type: message/rfc822

Message-ID: <12345-abcde-67890@mail.example.com>
From: sender@example.com
Subject: Hello
`;

const res1 = parseBounce(case1);
assert("Extracts Message-ID from standard bounce", res1.originalMsgId === "12345-abcde-67890@mail.example.com");
assert("Extracts Diagnostic Code", res1.reason?.includes("550-5.1.1") || false);


// Case 2: Outlook / Exchange Style (Original-Message-ID)
const case2 = `
Original-Message-ID: <GUID-1234-5678@outlook.com>
Final-Recipient: rfc822; bob@nowhere.com
Action: failed
Status: 5.2.2
Diagnostic-Code: smtp; 552 5.2.2 Mailbox full
`;
const res2 = parseBounce(case2);
assert("Extracts Original-Message-ID", res2.originalMsgId === "GUID-1234-5678@outlook.com");
assert("Extracts 552 Reason", res2.reason?.includes("552") || false);


// Case 3: Simple 550 Error line (Minimalist server)
const case3 = `
Hi, I gave up.
550 No such user here
Message-ID: <simple-id@test.com>
`;
const res3 = parseBounce(case3);
assert("Extracts Simple 550", res3.reason?.includes("No such user") || false);
assert("Extracts ID separate from block", res3.originalMsgId === "simple-id@test.com");


// Case 4: False Positive Check (Reply email vs Bounce)
const case4 = `
From: human@example.com
Message-ID: <reply-id@example.com>
In-Reply-To: <original-id@ourdomain.com>

Hey, I got your message!
`;
const res4 = parseBounce(case4);
// CRITICAL: Current logic assumes ANY Message-ID in body is the bounce target. 
// If it's a reply, it has its OWN Message-ID.
// The code blindly grabs the FIRST Message-ID. In a real bounce, the first ID is usually the bounce notification's ID, NOT the original.
// Example Bounce Structure:
/*
  Message-ID: <bounce-notification-id@google.com>  <-- WRONG ONE
  ...
  Original-Message-ID: <actual-sent-id@us.com>     <-- CORRECT ONE
*/
// Let's test if our logic prefers Original-Message-ID if both exist?
// The code uses || so it takes Message-ID first if found.

const case5_Risky = `
Message-ID: <bounce-notification@google.com>
Date: Mon, 16 Jan 2026

...
Original-Message-ID: <actual-sent-email@my-app.com>
`;
const res5 = parseBounce(case5_Risky);
// We expect it to FAIL if the code blindly takes the first one.
if (res5.originalMsgId === "bounce-notification@google.com") {
    assert("FAIL: Logic picked Bounce ID instead of Original ID", false);
} else if (res5.originalMsgId === "actual-sent-email@my-app.com") {
    assert("PASS: Logic correctly prioritized Original-Message-ID", true);
} else {
    assert("FAIL: Logic extracted nothing", false);
}


console.log(`\n\nRESULTS: ${passed} Passed, ${failed} Failed`);
if (failed > 0) process.exit(1);
