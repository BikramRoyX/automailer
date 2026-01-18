import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        accessToken?: string
        user: {
            id: string
            isSetupComplete: boolean
            dailyLimit: number
        } & DefaultSession["user"]
    }

    interface User {
        isSetupComplete?: boolean
        dailyLimit?: number
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string
        isSetupComplete?: boolean
        dailyLimit?: number
    }
}
