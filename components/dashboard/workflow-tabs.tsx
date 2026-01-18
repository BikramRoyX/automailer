"use client"

import { motion } from "framer-motion"
import { Plug, Users, PenTool, Rocket, BarChart3, Check, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

export type DashboardStep = 'connect' | 'prepare' | 'craft' | 'launch' | 'analytics'

interface WorkflowTabsProps {
    currentStep: DashboardStep
    onStepChange: (step: DashboardStep) => void
    status: {
        isGmailConnected: boolean
        isContactsReady: boolean
        isTemplateReady: boolean
    }
    locks?: {
        craft?: boolean
        prepare?: boolean
        launch?: boolean
    }
}

export function WorkflowTabs({ currentStep, onStepChange, status, locks }: WorkflowTabsProps) {

    const tabs = [
        {
            id: 'connect',
            label: 'Connect',
            icon: Plug,
            status: status.isGmailConnected ? 'complete' : 'current',
            isLocked: false
        },
        {
            id: 'prepare',
            label: 'Resources',
            icon: Users,
            status: status.isContactsReady ? 'complete' : 'current',
            isLocked: !!locks?.prepare
        },
        {
            id: 'craft',
            label: 'Template',
            icon: PenTool,
            status: status.isTemplateReady ? 'complete' : 'current',
            isLocked: !!locks?.craft
        },
        {
            id: 'launch',
            label: 'Launch',
            icon: Rocket,
            status: 'current',
            isLocked: !!locks?.launch
        }
    ] as const

    return (
        <div className="w-full border-b border-white/10 bg-white/5 backdrop-blur-md">
            <div className="container mx-auto max-w-7xl">
                <div className="flex items-center overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => {
                        const isActive = currentStep === tab.id
                        const Icon = tab.icon
                        // Use explicit check for 'complete' string status we set above
                        const isComplete = tab.status === 'complete'

                        return (
                            <button
                                key={tab.id}
                                onClick={() => !tab.isLocked && onStepChange(tab.id as DashboardStep)}
                                disabled={tab.isLocked}
                                title={tab.isLocked ? "Complete previous step to unlock" : ""}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-3 py-4 px-6 relative transition-all min-w-[140px]",
                                    isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300",
                                    tab.isLocked && "opacity-40 cursor-not-allowed hover:text-zinc-500"
                                )}
                            >
                                {/* Background Highlight for Active Tab */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white/5 border-b-2 border-indigo-500"
                                    />
                                )}

                                <div className="relative z-10 flex items-center gap-3">
                                    {/* Icon Box */}
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                        isActive ? "bg-indigo-500/20 text-indigo-400" :
                                            tab.isLocked ? "bg-white/5 text-zinc-500" : // LOCKED takes priority over complete
                                                isComplete ? "bg-green-500/10 text-green-500" : "bg-white/5 text-zinc-500"
                                    )}>
                                        {tab.isLocked ? (
                                            <Lock className="w-4 h-4" />
                                        ) : (
                                            <Icon className="w-4 h-4" />
                                        )}
                                    </div>

                                    <div className="flex flex-col items-start">
                                        <span className="text-sm font-bold tracking-wide">{tab.label}</span>
                                        <div className="flex items-center gap-1 text-[10px] font-mono uppercase">
                                            <div className="flex items-center gap-1 text-[10px] font-mono uppercase">
                                                {tab.isLocked ? (
                                                    <span className="text-zinc-600 flex items-center gap-1">
                                                        <Lock className="w-3 h-3" /> Locked
                                                    </span>
                                                ) : isComplete ? (
                                                    <span className="text-green-500 flex items-center gap-1">
                                                        <Check className="w-3 h-3" /> Done
                                                    </span>
                                                ) : (
                                                    <span className={isActive ? "text-indigo-400" : "text-zinc-600"}>
                                                        {tab.id === 'launch' ? "Ready" : "Pending"}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
