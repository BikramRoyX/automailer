
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { google } from "googleapis"
import { OAuth2Client } from "google-auth-library"
import { db } from "@/lib/db"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return Response.json({ connected: false, status: "No Session" }, { status: 401 })
        }

        // Try getting token from session or DB
        let accessToken = null // STRICT: Start null. Do NOT use session.accessToken (which is for Login only)
        let refreshToken = null
        let expiryDate = null
        let account = null

        // Improved Strategy: Get the dedicated Gmail App connection first
        const accounts = await db.account.findMany({
            where: {
                userId: session.user.id,
                provider: "google-gmail" // Look for the dedicated high-scope connection
            },
            orderBy: {
                expires_at: 'desc'
            },
            take: 1
        })

        account = accounts[0]

        console.log(`Debug Status: User ${session.user.id} - Found Gmail Account: ${!!account}`)

        // STRICT MODE: Do NOT fallback to 'google' provider.
        // If 'google-gmail' is missing, it IS Not Connected.


        if (account) {
            accessToken = account.access_token as string
            refreshToken = account.refresh_token as string
            // Convert seconds to ms for google-auth-library
            if (account.expires_at) {
                expiryDate = account.expires_at * 1000
            }
        }

        if (!accessToken) {
            console.log("Status Check: No access token found in DB or Session")
            return Response.json({ gmail_connected: false, status: "Not Linked" })
        }

        // Check Token Validity by making a lightweight API call
        // IMPORTANT: Initialize with credentials to allow auto-refresh
        const auth = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        )

        const credentials: any = {
            access_token: accessToken,
            refresh_token: refreshToken
        }

        if (expiryDate) {
            credentials.expiry_date = expiryDate
        }

        auth.setCredentials(credentials)

        // Force a refresh if we have a refresh token and no valid expiry, or just let the lib handle it.
        // The lib handles it if we make a request.

        const gmail = google.gmail({ version: 'v1', auth })

        try {
            const profile = await gmail.users.getProfile({ userId: 'me' })
            return Response.json({
                gmail_connected: true,
                status: "Active",
                gmail_email: profile.data.emailAddress // Use the ACTUAL connected email and rename property for consistency
            })
        } catch (error: any) {
            console.warn("Gmail Status Check Failed:", error.message)

            // Detailed Error Mapping
            let statusMessage = "Connection Error"

            if (error.code === 401) {
                statusMessage = "Token Expired/Revoked"
            } else if (error.code === 403) {
                statusMessage = "Insufficient Permissions (Scopes)"

                // DEBUG: Check actual scopes
                try {
                    const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`)
                    const tokenInfo = await tokenInfoRes.json()
                    console.warn(`[Scope Debug] Actual Scopes: ${tokenInfo.scope}`)

                    if (tokenInfo.scope && !tokenInfo.scope.includes("gmail.send")) {
                        statusMessage = "Missing 'Send' Permission. Please reconnect and check the box."
                    }
                } catch (e) {
                    console.error("Failed to debug token scopes", e)
                }

                if (error.message.includes("quota")) statusMessage = "Quota Exceeded"
            } else {
                statusMessage = `Error: ${error.message}`
            }

            return Response.json({ gmail_connected: false, status: statusMessage })
        }

    } catch (error: any) {
        console.error("Gmail Health Check Evaluation Error:", error)
        return Response.json({ gmail_connected: false, status: "System Error", message: error.message }, { status: 500 })
    }
}
