"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2, AlertTriangle, Terminal, Activity, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AgentControlPanelProps {
    dailyLimit: number
    emailsSentToday: number
    appliedCount: number
    validCount: number
    bouncedCount: number
    isReady: boolean
    onRunAgent: () => Promise<void>
    isRunning: boolean
    batchSize: number | "MAX"
    setBatchSize: (size: number | "MAX") => void
}

export function AgentControlPanel({
    dailyLimit,
    emailsSentToday,
    appliedCount,
    validCount,
    bouncedCount,
    isReady,
    onRunAgent,
    isRunning,
    batchSize,
    setBatchSize
}: AgentControlPanelProps) {
    const remaining = Math.max(0, dailyLimit - emailsSentToday)
    const logsEndRef = useRef<HTMLDivElement>(null)

    // Simulate live logs for "Techy" feel
    const [logs, setLogs] = useState<string[]>(["> System initialized...", "> Waiting for command..."])

    useEffect(() => {
        if (isRunning) {
            const interval = setInterval(() => {
                const msgs = [
                    "> Fetching next lead...",
                    "> Verifying email address...",
                    "> Generating personalized content...",
                    "> Optimization engine active...",
                    "> Connection stable..."
                ]
                const randomMsg = msgs[Math.floor(Math.random() * msgs.length)]
                setLogs(prev => [...prev.slice(-4), randomMsg])
            }, 1500)
            return () => clearInterval(interval)
        } else if (isReady) {
            setLogs(["> System Ready.", "> Awaiting user input."])
        }
    }, [isRunning, isReady])

    // Auto scroll logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [logs])

    return (
        <div className="w-full">
            <div className="relative group overflow-hidden rounded-3xl bg-[#0F0F10] border border-white/10 shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <Terminal className="w-5 h-5 text-indigo-500" />
                        <span className="font-mono font-bold tracking-widest text-zinc-300">MISSION CONTROL</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/5">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${isRunning ? "bg-green-500" : isReady ? "bg-green-500" : "bg-yellow-500"}`} />
                        <span className={`text-xs font-mono uppercase tracking-widest ${isReady ? "text-green-500 font-bold" : "text-zinc-400"}`}>
                            {isRunning ? "SEQUENCE RUNNING" : isReady ? "SYSTEM ONLINE" : "AWAITING DATA"}
                        </span>
                    </div>
                </div>

                {/* Main Dashboard Area */}
                <div className="p-4 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center justify-items-center">

                        {/* 1. circular Progress (Daily Limit) */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                {/* Background Circle */}
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="58"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="text-white/5"
                                    />
                                    {/* Progress Circle */}
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="58"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={2 * Math.PI * 58}
                                        strokeDashoffset={2 * Math.PI * 58 * (1 - (remaining / dailyLimit))}
                                        className="text-indigo-500 transition-all duration-1000 ease-out"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-white font-mono">{remaining}</span>
                                    <span className="text-[10px] uppercase text-zinc-500 tracking-wider">Credits</span>
                                </div>
                            </div>
                            <span className="text-xs text-zinc-400 font-medium">DAILY QUOTA</span>
                        </div>

                        {/* 2. Central Launch Button & Controls */}
                        <div className="relative flex flex-col items-center gap-6">

                            {/* Batch Size Selector */}
                            <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900 border border-zinc-800">
                                {(["1", "5", "10", "20", "40", "MAX"] as const).map((label) => {
                                    const val = label === "MAX" ? "MAX" : parseInt(label)
                                    const isActive = batchSize === val
                                    return (
                                        <button
                                            key={label}
                                            onClick={() => setBatchSize(val)}
                                            className={cn(
                                                "px-3 py-1 text-xs font-mono font-bold rounded transition-colors",
                                                isActive
                                                    ? "bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                                    : "text-zinc-500 hover:text-indigo-400 hover:bg-white/5"
                                            )}
                                        >
                                            {label}
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="relative">
                                <div className={`absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full transition-opacity duration-500 ${isReady && !isRunning ? "opacity-100" : "opacity-0"}`} />
                                <Button
                                    onClick={onRunAgent}
                                    disabled={!isReady || isRunning || remaining === 0}
                                    className={cn(
                                        "w-40 h-40 rounded-full border-4 relative z-10 transition-all duration-300 flex flex-col items-center justify-center gap-2 group",
                                        isRunning
                                            ? "bg-zinc-900 border-zinc-800 cursor-default"
                                            : isReady && remaining > 0
                                                ? "bg-indigo-600 hover:bg-indigo-500 border-indigo-400 hover:scale-105 shadow-[0_0_50px_rgba(79,70,229,0.4)]"
                                                : "bg-zinc-900 border-zinc-800 opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {isRunning ? (
                                        <>
                                            <Loader2 className="w-8 h-8 animate-spin text-white mb-1" />
                                            <span className="text-xs tracking-widest font-mono text-zinc-400">BUSY</span>
                                        </>
                                    ) : (
                                        <>
                                            {remaining === 0 ? (
                                                <div className="flex flex-col items-center">
                                                    <span className="text-2xl font-bold text-zinc-600">0</span>
                                                    <span className="text-[10px] tracking-widest font-mono text-zinc-600">CREDITS</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <Zap className={cn("w-10 h-10 transition-colors", isReady ? "text-white" : "text-zinc-600")} />
                                                    <span className={cn("text-sm font-bold tracking-widest font-mono", isReady ? "text-white" : "text-zinc-600")}>
                                                        LAUNCH
                                                    </span>
                                                </>
                                            )}
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Empty Queue Warning/Action */}
                            {!isRunning && !isReady && remaining > 0 && validCount === 0 && (
                                <div className="absolute top-[110%] w-max animate-in fade-in slide-in-from-top-2">
                                    <Button variant="outline" size="sm" className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-400 hover:text-white" asChild>
                                        <a href="/dashboard?step=prepare" onClick={(e) => {
                                            e.preventDefault()
                                            // Hacky way to switch tab is handled via href since URL param controls init state, 
                                            // but since we are SPA, maybe just clicking the tab is cleaner. The user instructions are clear though.
                                        }}>
                                            <AlertTriangle className="w-3 h-3 mr-2" /> Add Contacts to Queue
                                        </a>
                                    </Button>
                                    <p className="text-[10px] text-zinc-500 text-center mt-2 max-w-[150px]">
                                        You have credits, but no contacts to send to.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* 3. Detailed Stats Grid */}
                        <div className="flex flex-col gap-4 w-full max-w-[200px]">
                            {/* Valid */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                <span className="text-[10px] uppercase font-bold text-zinc-500">Queue</span>
                                <span className="text-lg font-mono font-bold text-blue-400">{validCount}</span>
                            </div>
                            {/* Applied */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                <span className="text-[10px] uppercase font-bold text-zinc-500">Applied</span>
                                <span className="text-lg font-mono font-bold text-green-400">{appliedCount}</span>
                            </div>
                            {/* Bounced */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                <span className="text-[10px] uppercase font-bold text-zinc-500">Bounce</span>
                                <span className="text-lg font-mono font-bold text-red-400">{bouncedCount}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Log Console */}
                <div className="border-t border-white/5 bg-black/60 p-4 font-mono text-xs h-40 overflow-hidden relative">
                    <div className="absolute top-2 right-4 text-[10px] text-green-500 flex items-center gap-1 opacity-70">
                        <Activity className="w-3 h-3" /> NETWORK ACTIVE
                    </div>
                    <div className="h-full overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                        <AnimatePresence initial={false}>
                            {logs.map((log, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-zinc-400 flex items-start gap-2"
                                >
                                    <span className="text-indigo-500 shrink-0">➜</span>
                                    <span>{log}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <div ref={logsEndRef} />
                    </div>
                </div>
            </div>
        </div>
    )
}
