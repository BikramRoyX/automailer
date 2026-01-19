"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Rocket, CheckCircle2, XCircle, AlertTriangle, Building2, Loader2, Search, UserCheck, Mail, Send, Check, AlertCircle, RefreshCw, Zap, Shield, Globe } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

function CompanyLogo({ domain, company }: { domain: string, company: string }) {
    const [isLoading, setIsLoading] = useState(true)

    return (
        <div className="relative w-20 h-20 rounded-2xl bg-white shadow-lg overflow-hidden flex items-center justify-center border border-white/20">
            {isLoading && (
                <Skeleton className="absolute inset-0 bg-zine-200 animate-pulse w-full h-full" />
            )}
            {domain ? (
                <img
                    src={`https://logo.clearbit.com/${domain}`}
                    alt="Logo"
                    className={cn("w-full h-full object-cover transition-opacity duration-500", isLoading ? "opacity-0" : "opacity-100")}
                    onLoad={() => setIsLoading(false)}
                    onError={(e) => {
                        setIsLoading(false);
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${company}&background=random`
                    }}
                />
            ) : (
                <div className="text-2xl font-bold text-black">{company?.[0]}</div>
            )}
        </div>
    )
}

interface SendingFlowProps {
    contacts: any[]
    template: any
    onComplete: (stats: { sent: number; failed: number }) => void
    onStop: () => void
}

type StepStatus = "analyzing" | "matching" | "verifying" | "sending" | "success" | "failed"

// Helper for domain extraction
const getDomain = (email: string) => (email || "").split('@')[1] || ""

export function SendingFlow({ contacts, template, onComplete, onStop }: SendingFlowProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [status, setStatus] = useState<StepStatus>("analyzing")
    const [logs, setLogs] = useState<string[]>([])
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    // Live Stats
    const [stats, setStats] = useState({ sent: 0, failed: 0 })

    // Prevent double-firing in Strict Mode
    const isProcessing = useRef(false)

    // Derived
    const currentContact = contacts[currentIndex] || { company: "Unknown", name: "Unknown", role: "Contact", email: "" }
    const currentDomain = getDomain(currentContact.email)

    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    const addLog = (msg: string) => setLogs(prev => [`> ${msg}`, ...prev].slice(0, 7))

    // Preload Logos on Mount
    useEffect(() => {
        contacts.forEach(contact => {
            const domain = getDomain(contact.email)
            if (domain) {
                const img = new Image()
                img.src = `https://logo.clearbit.com/${domain}`
            }
        })
    }, []) // Run once on mount

    useEffect(() => {
        if (isProcessing.current) return

        if (contacts.length > 0 && currentIndex < contacts.length) {
            isProcessing.current = true
            processContact(contacts[currentIndex])
        } else if (currentIndex >= contacts.length && contacts.length > 0) {
            onComplete(stats)
        }
    }, [currentIndex])

    const processContact = async (contact: any) => {
        try {
            // Step 1: Analyze Company
            setStatus("analyzing")
            setErrorMessage(null) // Reset error
            addLog(`Acquiring Target: ${contact.company || "Company"}...`)
            await wait(20) // Snappy (was 150)

            // Step 2: Match Role
            setStatus("matching")
            addLog(`Role Matrix: ${contact.role || "Hiring Manager"}`)
            await wait(20) // Snappy (was 150)

            // Step 3: Verify Email
            setStatus("verifying")
            addLog(`Deep Scan: ${contact.email}`)
            await wait(150) // Faster (was 600)

            // Step 4: Send via API
            setStatus("sending")
            addLog(`Uplinking to Gmail API...`)
            // API call logic follows...

            const res = await fetch("/api/agent/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contactId: contact.id,
                    subject: template?.subject || "Subject",
                    body: template?.body || "Body",
                    targetRole: template?.role // Pass the template's target role (e.g. "Python Dev")
                })
            })

            if (!res.ok) {
                // Determine if it is a Skip (422) or Failure (500)
                let errMsg = "API Error"
                try {
                    const json = await res.json()
                    errMsg = json.error || await res.text()
                } catch {
                    errMsg = await res.text()
                }

                if (res.status === 422) {
                    setStatus("failed")
                    setErrorMessage(errMsg)
                    addLog(`SKIP: ${errMsg}`)
                    setStats(s => ({ ...s, failed: s.failed + 1 }))
                    await wait(800)
                    isProcessing.current = false
                    setCurrentIndex(prev => prev + 1)
                    return
                }

                if (errMsg.includes("<!DOCTYPE")) {
                    throw new Error("Server Error (Check Logs)")
                }
                throw new Error(errMsg)
            }

            // Step 5: Success
            setStatus("success")
            addLog(`PAYLOAD DELIVERED to ${contact.email}`)
            setStats(s => ({ ...s, sent: s.sent + 1 }))
            await wait(800)

        } catch (error: any) {
            setStatus("failed")
            const msg = error.message || "Unknown error"
            setErrorMessage(msg)
            addLog(`FATAL: ${msg}`)
            setStats(s => ({ ...s, failed: s.failed + 1 }))
            await wait(1500)
        }

        // Next
        isProcessing.current = false
        setCurrentIndex(prev => prev + 1)
    }

    const progress = ((currentIndex) / (contacts.length || 1)) * 100

    if (!contacts.length) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
            {/* 1. Animated Background Particles */}
            <div className="absolute inset-0 bg-[#050505] z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black opacity-50" />
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent animate-scanline" />
            </div>

            {/* Dark Backdrop with Blur */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10" />

            {/* Main Interface */}
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-20 w-full max-w-5xl bg-[#0b0b0f]/90 border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(79,70,229,0.15)] overflow-hidden flex flex-col md:flex-row h-full md:h-[700px] max-h-[90vh]"
            >
                {/* --- LEFT PANEL: VISUALIZER (60%) --- */}
                <div className="flex-[3] relative p-4 md:p-8 flex flex-col overflow-hidden">

                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />

                    {/* Top Bar */}
                    <div className="flex justify-between items-center mb-12 z-10">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-50 animate-pulse" />
                                <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center border border-white/20">
                                    <Zap className="h-5 w-5 text-white fill-white" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-wide">AUTO<span className="text-indigo-400">MAILER</span></h2>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Autonomous Agent v2.1</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                                <Globe className="w-3 h-3 text-green-400 animate-pulse" />
                                <span className="text-xs font-mono text-green-400">ONLINE</span>
                            </div>
                        </div>
                    </div>

                    {/* CENTRAL HUB */}
                    <div className="flex-1 flex flex-col justify-center items-center relative z-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentContact.email}
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -50, scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                className="w-full max-w-lg"
                            >
                                {/* TARGET CARD */}
                                <div className="relative group">
                                    {/* Glow Effect behind card */}
                                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-tilt" />

                                    <div className="relative bg-[#121217] border border-white/10 rounded-2xl p-8 overflow-hidden">

                                        {/* Scanner Line */}
                                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                                            <motion.div
                                                className="w-full h-[2px] bg-indigo-400/50 shadow-[0_0_15px_rgba(129,140,248,0.8)]"
                                                animate={{ top: ['0%', '100%'] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                style={{ position: 'absolute' }}
                                            />
                                        </div>

                                        {/* Header: Logo + Name */}
                                        <div className="flex items-center gap-6 mb-8 relative">
                                            {/* Company Logo Fetcher */}
                                            {/* Company Logo Fetcher */}
                                            <div className="relative shrink-0">
                                                <CompanyLogo domain={currentDomain} company={currentContact.company} />
                                                <div className="absolute -bottom-2 -right-2 bg-black border border-zinc-800 rounded-full p-1.5">
                                                    <Shield className="w-4 h-4 text-indigo-400" />
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-3xl font-bold text-white tracking-tight mb-1">{currentContact.company}</h3>
                                                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                                    <UserCheck className="w-4 h-4 text-zinc-500" />
                                                    {currentContact.role}
                                                </div>
                                                <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mt-1">
                                                    @{currentDomain}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Timeline */}
                                        <div className="space-y-3 relative">
                                            {/* Connecting Line */}
                                            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-zinc-800" />

                                            <div className="flex items-center gap-4 relative">
                                                <div className={cn("z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-[#121217] transition-all duration-300",
                                                    status === 'analyzing' || status === 'matching' ? "border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]" :
                                                        "border-zinc-700 text-zinc-600"
                                                )}>
                                                    <Search className="w-4 h-4" />
                                                </div>
                                                <span className={cn("text-sm transition-colors", status === 'analyzing' ? "text-white font-bold" : "text-zinc-500")}>Target Analysis</span>
                                                {status === 'analyzing' && <Loader2 className="w-3 h-3 text-indigo-500 animate-spin" />}
                                            </div>

                                            <div className="flex items-center gap-4 relative">
                                                <div className={cn("z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-[#121217] transition-all duration-300",
                                                    status === 'verifying' ? "border-yellow-500 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]" :
                                                        "border-zinc-700 text-zinc-600"
                                                )}>
                                                    <Shield className="w-4 h-4" />
                                                </div>
                                                <span className={cn("text-sm transition-colors", status === 'verifying' ? "text-white font-bold" : "text-zinc-500")}>Security Verification</span>
                                            </div>

                                            <div className="flex items-center gap-4 relative">
                                                <div className={cn("z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-[#121217] transition-all duration-300",
                                                    status === 'sending' ? "border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]" :
                                                        "border-zinc-700 text-zinc-600"
                                                )}>
                                                    <Send className="w-4 h-4" />
                                                </div>
                                                <span className={cn("text-sm transition-colors", status === 'sending' ? "text-white font-bold" : "text-zinc-500")}>Dispatch Protocol</span>
                                            </div>
                                        </div>

                                        {/* Result Banner */}
                                        <div className="mt-8">
                                            {status === 'success' && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center gap-2 text-green-400 font-bold">
                                                    <CheckCircle2 className="w-5 h-5" /> SUCCESS
                                                </motion.div>
                                            )}
                                            {status === 'failed' && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center gap-2 text-red-400 font-bold">
                                                    <XCircle className="w-5 h-5" /> FAILED
                                                </motion.div>
                                            )}
                                            {['analyzing', 'matching', 'verifying', 'sending'].includes(status) && (
                                                <div className="p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl flex items-center justify-center gap-2 text-zinc-400 font-mono text-xs">
                                                    PROCESSING...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Bottom Progress */}
                    <div className="mt-auto space-y-2 z-10">
                        <div className="flex justify-between text-xs uppercase tracking-widest text-zinc-500">
                            <span>Campaign Progress</span>
                            <span>{currentIndex} / {contacts.length}</span>
                        </div>
                        <Progress value={progress} className="h-1 bg-zinc-900" indicatorClassName="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
                    </div>
                </div>

                {/* --- RIGHT PANEL: DATA & LOGS (40%) --- */}
                <div className="flex-[2] bg-[#09090b] border-l border-white/5 flex flex-col relative">
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 bg-zinc-900/20">
                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Command Center</h3>

                        {/* Circular Stats with Glow */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition" />
                                <div className="text-xs text-green-400 uppercase font-bold mb-1">Delivered</div>
                                <div className="text-4xl font-black text-white group-hover:scale-105 transition-transform">{stats.sent}</div>
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            </div>
                            <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition" />
                                <div className="text-xs text-red-400 uppercase font-bold mb-1">Failed</div>
                                <div className="text-4xl font-black text-white group-hover:scale-105 transition-transform">{stats.failed}</div>
                            </div>
                        </div>
                    </div>

                    {/* Terminal Logs */}
                    <div className="flex-1 p-0 overflow-hidden flex flex-col">
                        <div className="px-6 py-2 bg-black border-b border-white/5 text-[10px] text-zinc-500 font-mono flex justify-between">
                            <span>TERMINAL_OUTPUT</span>
                            <span>/var/log/mailer.log</span>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto font-mono text-xs custom-scrollbar bg-black/50">
                            <div className="space-y-4">
                                {logs.map((log, i) => {
                                    const isError = log.includes("FATAL") || log.includes("SKIP")
                                    const isSuccess = log.includes("DELIVERED")
                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            key={i}
                                            className={cn(
                                                "border-l-2 pl-3 py-1",
                                                isError ? "border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]" :
                                                    isSuccess ? "border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.1)]" :
                                                        "border-zinc-800 text-zinc-500"
                                            )}
                                        >
                                            <span className="opacity-40 text-[10px] block mb-1">
                                                {new Date().toLocaleTimeString()}
                                            </span>
                                            {log.replace("> ", "")}
                                        </motion.div>
                                    )
                                })}
                                <div className="h-4 w-2 bg-indigo-500 animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-white/5 bg-zinc-900/30 backdrop-blur">
                        <Button
                            variant="default"
                            onClick={onStop}
                            className="w-full h-12 bg-red-600 hover:bg-red-500 text-white font-bold tracking-wider shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all hover:scale-[1.02]"
                        >
                            EMERGENCY STOP
                        </Button>
                    </div>
                </div>

            </motion.div>
        </div>
    )
}
