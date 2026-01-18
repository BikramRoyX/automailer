import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export async function sendEmail(
    accessToken: string,
    to: string,
    subject: string,
    body: string,
    attachments: { filename: string; contentType: string; content: Buffer }[] = [],
    senderName: string,
    senderEmail: string
) {
    const auth = new OAuth2Client();
    auth.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth });

    const messageParts = [
        `From: "${senderName}" <${senderEmail}>`,
        `To: ${to}`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/mixed; boundary="boundary_example"`,
        ``,
        `--boundary_example`,
        `Content-Type: text/plain; charset="UTF-8"`,
        ``,
        body,
        ``
    ];

    for (const attachment of attachments) {
        messageParts.push(
            `--boundary_example`,
            `Content-Type: ${attachment.contentType}; name="${attachment.filename}"`,
            `Content-Disposition: attachment; filename="${attachment.filename}"`,
            `Content-Transfer-Encoding: base64`,
            ``,
            attachment.content.toString('base64'),
            ``
        );
    }

    messageParts.push(`--boundary_example--`);

    const rawMessage = messageParts.join('\n');
    const encodedMessage = Buffer.from(rawMessage)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    try {
        const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
            },
        });
        return { success: true, id: res.data.id, threadId: res.data.threadId };
    } catch (error: any) {
        console.error('Gmail Send Error:', error.response?.data || error.message);
        throw new Error(error.message);
    }
}

export async function refreshAccessToken(refreshToken: string) {
    const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );
    client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await client.refreshAccessToken();
    return credentials;
}
// ... existing exports ...

export async function checkForReplies(accessToken: string, sentThreadIds: string[]) {
    if (sentThreadIds.length === 0) return [];

    const auth = new OAuth2Client();
    auth.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth });

    const replies: { email: string; threadId: string; snippet: string; date: Date }[] = [];

    // Batch check threads
    // In production, we'd use History API, but for now, we iterate recent.
    // Optimization: Only check threads where we SENT something.

    // We can't batch 'get' threads locally easily without batch request helper. 
    // We will limit to checking last 20 active threads or just the ones provided.

    // Better strategy: Search 'in:inbox' and see if it belongs to our thread list.
    // Or Search 'to:me'.

    // Let's iterate provided IDs (limit 50 most recent).
    const recentThreads = sentThreadIds.slice(0, 50);

    for (const threadId of recentThreads) {
        try {
            const thread = await gmail.users.threads.get({
                userId: 'me',
                id: threadId
            });

            const messages = thread.data.messages || [];
            if (messages.length > 1) {
                // Determine if the last message is FROM someone else
                const lastMsg = messages[messages.length - 1];
                const headers = lastMsg.payload?.headers || [];
                const fromHeader = headers.find(h => h.name === 'From')?.value || "";

                // Heuristic: If it's not from "me" (we don't know "me" easily without profile check, strictly)
                // BUT we can check if labelIds include "INBOX" usually means incoming.
                // Or check if "SENT" is NOT in labels.

                if (lastMsg.labelIds?.includes('INBOX')) {
                    // Extract email
                    const emailMatch = fromHeader.match(/<(.+)>/);
                    const email = emailMatch ? emailMatch[1] : fromHeader;

                    replies.push({
                        email,
                        threadId,
                        snippet: lastMsg.snippet || "",
                        date: new Date(Number(lastMsg.internalDate))
                    });
                }
            }
        } catch (e) {
            // Thread might be deleted
            console.warn(`Failed to check thread ${threadId}`, e);
        }
    }

    return replies;
}

export async function checkForBounces(accessToken: string, since?: Date) {
    const auth = new OAuth2Client();
    auth.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth });

    // Search query
    let q = 'from:mailer-daemon OR from:postmaster subject:"Delivery Status Notification"';
    if (since) {
        const seconds = Math.floor(since.getTime() / 1000);
        q += ` after:${seconds}`;
    }

    const bounces: { email: string; reason: string; date: Date }[] = [];

    try {
        const res = await gmail.users.messages.list({
            userId: 'me',
            q,
            maxResults: 20
        });

        if (res.data.messages) {
            for (const msg of res.data.messages) {
                const fullMsg = await gmail.users.messages.get({
                    userId: 'me',
                    id: msg.id!,
                    format: 'full'
                });

                const snippet = fullMsg.data.snippet || "";
                // Attempt to extract email
                // Usually "Address not found ... test@example.com"
                const emailMatch = snippet.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/);

                if (emailMatch) {
                    bounces.push({
                        email: emailMatch[1],
                        reason: snippet.substring(0, 100),
                        date: new Date(Number(fullMsg.data.internalDate))
                    });
                }
            }
        }
    } catch (e) {
        console.error("Bounce check failed", e);
    }

    return bounces;
}
