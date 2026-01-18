"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SignOutButton() {
    return (
        <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-[#CCCCCC] hover:bg-[#FFFFFF10] hover:text-white transition-colors"
            onClick={async () => {
                try {
                    await signOut({ callbackUrl: "/login" })
                } catch (error) {
                    console.error("SignOutButton: Error signing out", error)
                }
            }}
        >
            <LogOut className="w-4 h-4" />
            Logout
        </button>
    )
}
