
"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

export function Toaster({ ...props }: ToasterProps) {
    return (
        <Sonner
            theme="dark"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-[#0F0F10] group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:shadow-2xl group-[.toaster]:backdrop-blur-xl group-[.toaster]:rounded-xl font-sans",
                    description: "group-[.toast]:text-zinc-400",
                    actionButton:
                        "group-[.toast]:bg-indigo-500 group-[.toast]:text-white",
                    cancelButton:
                        "group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-400",
                },
            }}
            {...props}
        />
    )
}
