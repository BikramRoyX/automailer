import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import { compare } from "bcryptjs"
import { z } from "zod"


import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"

import fs from 'fs';
import path from 'path';

function logAuth(message: string, data?: any) {
    try {
        const timestamp = new Date().toISOString();
        const logLine = `[${timestamp}] ${message} ${data ? JSON.stringify(data) : ''}\n`;
        const logPath = path.join(process.cwd(), 'auth-debug.log');
        fs.appendFileSync(logPath, logLine);
    } catch (e) {
        console.error("Failed to write log", e);
    }
    console.log(`[AUTH LOG] ${message}`, data || '');
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db),
    debug: true, // Enable debug logs
    secret: process.env.NEXTAUTH_SECRET, // Explicitly set secret
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
        // error: "/login" // Disable custom error page to see actual error
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                    scope: "openid email profile"
                }
            }
        }),
        GoogleProvider({
            id: "google-gmail",
            name: "Gmail",
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                    scope: "openid email profile https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly"
                }
            }
        }),
        CredentialsProvider({
            // ... (keep middle unchanged if possible, but replace tool limitations mean I might need to copy more or use careful ranges. I will allow replace of the Provider block)
            // Actually, I'll use multi-replace if I can, or just replace the GoogleProvider part and then the Session callback part.
            // But the replace_tool works on contiguous blocks.
            // I'll replace the GoogleProvider block first.

            name: "Sign in",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    console.log("Auth Debug: Missing credentials")
                    return null
                }

                const user = await db.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                })

                if (!user) {
                    console.log("Auth Debug: User not found:", credentials.email)
                    return null
                }


                if (!user.passwordHash) {
                    console.log("Auth Debug: User has no password hash (likely Google OAuth):", credentials.email)
                    return null
                }

                const isPasswordValid = await compare(
                    credentials.password,
                    user.passwordHash
                )

                if (!isPasswordValid) {
                    console.log("Auth Debug: Password invalid for:", credentials.email)
                    return null
                }

                return {
                    id: user.id + "",
                    email: user.email,
                    name: user.name,
                    image: user.image
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            try {
                logAuth("SignIn Callback", { userEmail: user.email, provider: account?.provider });
                console.log("Auth Debug: SignIn Callback", { user: user.email, accountId: account?.providerAccountId });

                // Reset Resume and Templates on every fresh Login
                if (user.email) {
                    try {
                        // 1. Find the user ID based on email (since 'user.id' might vary depending on how NextAuth constructs it at this stage)
                        const dbUser = await db.user.findUnique({ where: { email: user.email } })

                        if (dbUser) {
                            // 2. Reset Workflow State (Strict Requirement)
                            await db.user.update({
                                where: { id: dbUser.id },
                                data: {
                                    communityStatus: 'NOT_SELECTED',
                                    templateStatus: 'NOT_STARTED'
                                    // Note: We are NOT deleting the resume file, so resumeStatus stays 'UPLOADED' if present, 
                                    // but user must re-select community to proceed.
                                }
                            })
                            logAuth("User Login - Reset Workflow State", { userId: dbUser.id });
                        }
                    } catch (error) {
                        console.error("Error in sign-in callback:", error)
                    }
                }

                return true;
            } catch (globalError) {
                logAuth("SignIn Callback FATAL ERROR", { error: globalError });
                return false;
            }
        },
        async session({ session, token }) {
            // logAuth("Session Callback", { sessionUser: session?.user?.email, tokenSub: token?.sub });
            console.log("Auth Debug: Session Callback", { tokenSub: token?.sub, sessionUser: session?.user?.email });
            if (token.sub && session.user) {
                session.user.id = token.sub
                session.user.isSetupComplete = token.isSetupComplete as boolean
                session.user.dailyLimit = token.dailyLimit as number
                session.accessToken = token.accessToken as string
            }
            return session
        },
        async jwt({ token, user, account }) {
            logAuth("JWT Callback", { tokenSub: token?.sub, event: account ? "SignIn" : "Session", hasAccount: !!account });
            console.log("Auth Debug: JWT Callback", { tokenSub: token?.sub, trigger: account ? "Sign-In/Link" : "Session Access" });

            // On Support Sign-in or Account Linking
            if (account) {
                token.accessToken = account.access_token
                token.refreshToken = account.refresh_token
            }

            // On Initial User Creation / Load
            if (user) {
                token.isSetupComplete = user.isSetupComplete
                token.dailyLimit = user.dailyLimit
            }

            return token
        }
    }
}
