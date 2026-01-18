import { OAuth2Client } from 'google-auth-library';
import { db } from '@/lib/db';

// Fallback to localhost if env var is missing
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
const REDIRECT_URI = `${APP_URL}/api/auth/google/callback`;

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("❌ CRITICAL ERROR: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing from .env");
}

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
);

export const getGoogleAuthUrl = () => {
    const url = client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent', // Always consent to ensure we get refresh token
        include_granted_scopes: true,
        redirect_uri: REDIRECT_URI,
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/gmail.send', // Crucial for sending emails
            'https://www.googleapis.com/auth/gmail.readonly' // Useful for checking status
        ],
    });
    console.log("🔗 Generated Google Auth URL:", url);
    return url;
};

export const getGoogleTokens = async (code: string) => {
    const { tokens } = await client.getToken(code);
    return tokens;
};

export const getGoogleUser = async (tokens: any) => {
    // Verify the ID token if present, or fetch user info
    if (tokens.id_token) {
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        return ticket.getPayload();
    } else {
        // Fallback or if just access token
        client.setCredentials(tokens);
        const userInfo = await client.request({ url: 'https://www.googleapis.com/oauth2/v3/userinfo' });
        return userInfo.data;
    }
};

export const linkGoogleAccount = async (userId: string, tokens: any, googleUser: any) => {
    const { email, sub, picture, name } = googleUser;

    console.log(`🔗 Linking Google Account ${email} for user ${userId}`);
    if (tokens.refresh_token) {
        console.log("✅ New Refresh Token received");
    } else {
        console.log("⚠️ No Refresh Token received (keeping existing if any)");
    }

    // Prepare update data
    const updateData: any = {
        userId: userId,
        access_token: tokens.access_token,
        expires_at: Math.floor(Date.now() / 1000 + (tokens.expires_in || 3600)),
        token_type: tokens.token_type,
        scope: tokens.scope,
        id_token: tokens.id_token
    };

    // Only update refresh_token if new one exists
    if (tokens.refresh_token) {
        updateData.refresh_token = tokens.refresh_token;
    }

    // 1. Upsert Account
    await db.account.upsert({
        where: {
            provider_providerAccountId: {
                provider: 'google-gmail', // Distinct provider to avoid collision with NextAuth
                providerAccountId: sub
            }
        },
        update: updateData,
        create: {
            userId: userId,
            type: 'oauth',
            provider: 'google-gmail', // Distinct provider
            providerAccountId: sub,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token, // For create, we accept it might be undefined (though improper)
            expires_at: Math.floor(Date.now() / 1000 + (tokens.expires_in || 3600)),
            token_type: tokens.token_type,
            scope: tokens.scope,
            id_token: tokens.id_token
        }
    });

    return true;
};
