"use client"

import { Check, X, Circle, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface StatusStepperProps {
    status: {
        isAuthenticated: boolean
        isGmailConnected: boolean
        isTemplateReady: boolean
        isContactsReady: boolean
    }
}

export function StatusStepper({ status }: StatusStepperProps) {
    const steps = [
        {
            id: "auth",
            label: "Account",
            completed: status.isAuthenticated,
            failed: !status.isAuthenticated
        },
        {
            id: "gmail",
            label: "Gmail",
            completed: status.isGmailConnected,
            failed: !status.isGmailConnected && status.isAuthenticated
        },
        {
            id: "template",
            label: "Template",
            completed: status.isTemplateReady,
            failed: !status.isTemplateReady && status.isGmailConnected
        },
        {
            id: "resources",
            label: "Resources",
            completed: status.isContactsReady,
            failed: !status.isContactsReady && status.isTemplateReady
        },
        {
            id: "ready",
            label: "Ready",
            completed: Object.values(status).every(Boolean),
            failed: !Object.values(status).every(Boolean)
        }
    ]

    return (
        <div className="w-full">
            <div className="flex items-center justify-between relative">
                {/* Connecting Line - Background */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-zinc-800 -z-10 rounded-full" />

                {/* Connecting Line - Active */}
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 -z-10 transition-all duration-1000 ease-out"
                    style={{ 
                        width: `${Math.min(100, (steps.filter(s => s.completed).length / (steps.length - 1)) * 100)}%` 
                    }}
                />

                {steps.map((step, idx) => {
                    const isActive = step.completed
                    const isFailed = step.failed && !step.completed
                    // Special case for last step
                    const isLastFailed = idx === 4 && !step.completed

                    return (
                        <div key={step.id} className="relative flex flex-col items-center group">
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isActive || isFailed || isLastFailed ? 1 : 0.9,
                                    borderColor: isActive ? "#6366f1" : (isFailed || isLastFailed) ? "#ef4444" : "#27272a",
                                    backgroundColor: isActive ? "#0F0F10" : (isFailed || isLastFailed) ? "#1a0b0b" : "#09090b"
                                }}
                                className={cn(
                                    "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10",
                                    isActive && "shadow-[0_0_15px_rgba(99,102,241,0.4)]",
                                    (isFailed || isLastFailed) && "shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                                )}
                            >
                                {isActive ? (
                                    <Check className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />
                                ) : (isFailed || isLastFailed) ? (
                                    <X className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                                ) : (
                                    <Circle className="w-3 h-3 md:w-4 md:h-4 text-zinc-700 fill-zinc-900" />
                                )}
                            </motion.div>

                            <span className={cn(
                                "absolute -bottom-6 text-[10px] uppercase font-bold tracking-wider whitespace-nowrap transition-colors duration-300",
                                isActive ? "text-indigo-300" : (isFailed || isLastFailed) ? "text-red-400" : "text-zinc-600"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
