import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGoogleTokens, getGoogleUser, linkGoogleAccount } from '@/lib/auth-service';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
        console.error("❌ OAuth Error param:", error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=${error}`);
    }

    if (!code) {
        console.error("❌ No code provided");
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=no_code`);
    }

    try {
        // 1. Verify User Session (Must be logged in to connect)
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            console.error("❌ No active session found during callback");
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=session_expired`);
        }

        console.log("🔵 Google Callback for user:", session.user.email);

        // 2. Exchange code for tokens
        const tokens = await getGoogleTokens(code);

        // 2.5 Verify Scopes
        const scopes = tokens.scope || "";
        if (!scopes.includes("gmail.send") || !scopes.includes("gmail.readonly")) {
            console.error("❌ User did not grant Gmail permissions. Scopes:", scopes);
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=missing_permissions`);
        }

        // 3. Get Google User Profile
        const googleUser = await getGoogleUser(tokens);

        // 4. Link Account to Current User
        // Use session.user.id if available, otherwise we might rely on the email match logic in auth-service
        // But the safest is linking to the ID in the session.
        await linkGoogleAccount(session.user.id, tokens, googleUser);

        // 5. Redirect back to settings
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=connected`);

    } catch (error: any) {
        console.error('❌ OAuth Execution Error:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=oauth_failed`);
    }
}
