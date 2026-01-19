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
