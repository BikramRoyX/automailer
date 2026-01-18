
import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { db } from "@/lib/db"

export async function scanBouncesForUser(userId: string) {
    const account = await db.account.findFirst({
        where: { userId, provider: { in: ['google', 'google-gmail'] } }
    })

    if (!account?.access_token) return { processed: 0, errors: ["No Gmail account linked"] }

    // 1. Setup Gmail Client
    const auth = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    )
    auth.setCredentials({ access_token: account.access_token })

    // Auto-refresh token
    if (account.expires_at && account.expires_at * 1000 < Date.now()) {
        try {
            auth.setCredentials({ refresh_token: account.refresh_token! })
            const { credentials } = await auth.refreshAccessToken()
            await db.account.update({
                where: { id: account.id },
                data: {
                    access_token: credentials.access_token,
                    expires_at: Math.floor(credentials.expiry_date! / 1000)
                }
            })
        } catch (e) {
            console.error("Token refresh failed for user", userId, e)
            return { processed: 0, errors: ["Token refresh failed"] }
        }
    }

    const gmail = google.gmail({ version: 'v1', auth })

    // 2. Search for Bounces (Last 48h to be safe, IS:UNREAD is critical)
    // "includeSpamTrash: true" is critical as bounces often land in spam
    const query = 'from:mailer-daemon is:unread after:' + Math.floor((Date.now() - 48 * 60 * 60 * 1000) / 1000)

    let processedCount = 0
    let pageToken: string | undefined = undefined
    let loopCount = 0

    do {
        // Safety Break
        if (loopCount > 10) break;
        loopCount++;

        try {
            const res = await gmail.users.messages.list({
                userId: 'me',
                q: query,
                maxResults: 50,
                includeSpamTrash: true,
                pageToken: pageToken
            }) as any

            const messages = res.data.messages || []
            pageToken = res.data.nextPageToken || undefined

            if (messages.length === 0) continue

            // 3. Process Batch
            for (const msg of messages) {
                try {
                    const fullMsg = await gmail.users.messages.get({
                        userId: 'me',
                        id: msg.id,
                        format: 'full'
                    })

                    const payload = fullMsg.data.payload
                    const snippet = fullMsg.data.snippet || ""

                    // 4. Extract Body (Better recursion)
                    const getText = (p: any): string => {
                        if (p.mimeType === 'text/plain' && p.body?.data) {
                            return Buffer.from(p.body.data, 'base64').toString('utf-8')
                        }
                        if (p.parts) return p.parts.map(getText).join('\n')
                        // Fallback
                        if (p.body?.data) return Buffer.from(p.body.data, 'base64').toString('utf-8')
                        return ""
                    }
                    const bodyText = getText(payload || {})

                    // 5. robust Extraction
                    // Priority A: Content-Type: message/rfc822 (The original message attached)
                    // Priority B: Diagnostic-Code in body
                    // Priority C: Original-Message-ID header

                    let originalMsgId = ""

                    const msgIdMatch = bodyText.match(/Message-ID:\s*<([^>]+)>/i)
                    const originalMsgIdMatch = bodyText.match(/Original-Message-ID:\s*<([^>]+)>/i)

                    if (originalMsgIdMatch) {
                        originalMsgId = originalMsgIdMatch[1]
                    } else if (msgIdMatch) {
                        originalMsgId = msgIdMatch[1]
                    }

                    if (originalMsgId) {
                        // 6. Find Record
                        const sentEmail = await db.sentEmail.findFirst({
                            where: { gmailMessageId: { contains: originalMsgId } }
                        })

                        if (sentEmail) {
                            const reasonMatch = bodyText.match(/Diagnostic-Code: smtp; (.*)/i) ||
                                bodyText.match(/Status:\s*5\.\d+\.\d+/i) ||
                                bodyText.match(/550 (.*)/)

                            const reason = reasonMatch ? reasonMatch[0].substring(0, 255) : "Bounce detected"
                            const bouncedEmail = sentEmail.recipient.toLowerCase()

                            // Upsert Global Bounce
                            await db.globalBounce.upsert({
                                where: { email: bouncedEmail },
                                create: {
                                    email: bouncedEmail,
                                    reason: reason,
                                    bounceCount: 1,
                                    isActive: true,
                                    firstBouncedAt: new Date(),
                                    lastBouncedAt: new Date()
                                },
                                update: {
                                    bounceCount: { increment: 1 },
                                    lastBouncedAt: new Date(),
                                    reason: reason,
                                    isActive: true
                                }
                            })

                            // Clean HR List
                            await db.globalHrList.updateMany({
                                where: { email: bouncedEmail },
                                data: { status: 'BOUNCED' }
                            })

                            // Update Local Records
                            if (sentEmail.status !== 'BOUNCED') {
                                await db.$transaction([
                                    db.sentEmail.update({
                                        where: { id: sentEmail.id },
                                        data: { status: 'BOUNCED', bounceReason: reason }
                                    }),
                                    db.contact.update({
                                        where: {
                                            userId_email: {
                                                userId: userId,
                                                email: sentEmail.recipient
                                            }
                                        },
                                        data: { status: 'bounced', bounceDescription: reason }
                                    })
                                ])
                                processedCount++
                            }
                        }
                    }

                    // 7. MARK AS READ (CRITICAL for Idempotency)
                    await gmail.users.messages.modify({
                        userId: 'me',
                        id: msg.id!,
                        requestBody: {
                            removeLabelIds: ['UNREAD']
                        }
                    })

                } catch (e) {
                    console.error(`Failed to process message ${msg.id}`, e)
                }
            }

        } catch (e) {
            console.error("Gmail list/loop failed", e)
            return { processed: processedCount, errors: ["Gmail loop error"] }
        }

    } while (pageToken);

    return { processed: processedCount, errors: [] }
}
