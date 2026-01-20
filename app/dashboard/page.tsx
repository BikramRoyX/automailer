"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import { WorkflowTabs, DashboardStep } from "@/components/dashboard/workflow-tabs"
import { AgentControlPanel } from "@/components/dashboard/agent-control-panel"
import { SetupGuide } from "@/components/dashboard/setup-guide"
import { TemplateBuilder } from "@/components/dashboard/template-builder"
import { ProfileSetupForm } from "@/components/dashboard/profile-setup-form"
// Use existing sending flow
import { SendingFlow } from "@/components/dashboard/sending-flow"
import { AnalyticsView } from "@/components/dashboard/analytics-view"

export default function DashboardPage() {
    const { data: session } = useSession()

    // State
    const [activeStep, setActiveStep] = useState<DashboardStep>('connect')
    const [batchSize, setBatchSize] = useState<number | "MAX">("MAX")

    // Core Status
    const [isRunning, setIsRunning] = useState(false)
    const [agentStatus, setAgentStatus] = useState<any>(null)
    const [workStatus, setWorkStatus] = useState<any>(null) // New Strict Status
    const [result, setResult] = useState<{ success?: boolean; message?: string; sent?: number; failed?: number } | null>(null)
    const [showingSendingFlow, setShowingSendingFlow] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Data Fetching
    const fetchStatus = async () => {
        try {
            const [agentRes, workRes] = await Promise.all([
                fetch(`/api/agent/status?t=${Date.now()}`),
                fetch(`/api/workflow/status?t=${Date.now()}`)
            ])
            const agentData = await agentRes.json()
            const workData = await workRes.json()

            setAgentStatus(agentData)
            setWorkStatus(workData)
            setIsLoading(false)

            // Auto-advance logic (only on first load)
            if (isLoading) {
                // Logic refined by strict status (NEW ORDER: Connect -> Prepare -> Craft -> Launch)

                // 1. If not connected -> Connect
                if (!agentData.gmail_connected) setActiveStep('connect')

                // 2. If connected but Resources (Resume/Community) missing -> Prepare
                else if (workData.resumeStatus !== 'UPLOADED' || workData.communityStatus === 'NOT_SELECTED') setActiveStep('prepare')

                // 3. If Resources ready but Template NOT_GENERATED -> Craft
                else if (workData.templateStatus !== 'GENERATED') setActiveStep('craft')

                // 4. If Template generated but NO FRESH CONTACTS -> Redirect to Prepare
                else if (agentData.fresh_contact_count === 0) {
                    setActiveStep('prepare')
                    // Optional: We could set a message here to let the user know why
                    setResult({ success: false, message: "Campaign exhausted. Please add more contacts." })
                }

                // 5. If all done -> Launch
                else setActiveStep('launch')
            }
        } catch (err) {
            console.error("Status check failed", err)
            setIsLoading(false)
        }
    }

    // Helper to update status locally and on server
    const updateWorkflowStatus = async (field: string, value: string) => {
        // Optimistic Update
        setWorkStatus((prev: any) => ({ ...prev, [field]: value }))

        try {
            const res = await fetch("/api/workflow/status", {
                method: "POST",
                body: JSON.stringify({ [field]: value })
            })
            // Update with server source of truth to ensure synchronization
            if (res.ok) {
                const updatedData = await res.json()
                setWorkStatus((prev: any) => ({ ...prev, ...updatedData }))
            }
        } catch (e) {
            console.error("Failed to update workflow priority", e)
        }
    }

    // This is a placeholder as I am switching to editing the config file first.
    // I will not actually edit the dashboard page yet.
    useEffect(() => {
        fetchStatus()
    }, [])

    // Derived Status for Strict Locking
    const isGmailConnected = !!agentStatus?.gmail_connected

    // Strict Locking Rules (NEW ORDER)
    // 1. Prepare: Unlocked if Connected.
    // 2. Craft (Template): Locked until Resume UPLOADED && Community SELECTED.
    // 3. Launch: Locked until Craft (Template) is GENERATED.

    // 1. Prepare: Unlocked if Connected.
    // 2. Craft (Template): Locked until Resume UPLOADED && Community SELECTED.
    // 3. Launch: Locked until Craft (Template) is GENERATED.

    const isPrepareUnlocked = isGmailConnected
    const isTemplateUnlocked = isPrepareUnlocked && workStatus?.resumeStatus === 'UPLOADED' && !!workStatus?.resumePath && workStatus?.communityStatus !== 'NOT_SELECTED'
    // Strict Lock: Launch requires Template GENERATED AND Fresh Contacts > 0
    const isLaunchUnlocked = isTemplateUnlocked && workStatus?.templateStatus === 'GENERATED' && (agentStatus?.fresh_contact_count || 0) > 0

    const statusMap = {
        isGmailConnected,
        isContactsReady: workStatus?.communityStatus !== 'NOT_SELECTED' && workStatus?.resumeStatus === 'UPLOADED' && !!workStatus?.resumePath,
        isTemplateReady: workStatus?.templateStatus === 'GENERATED',
        // Passed to SetupGuide for granular UI
        isResumeReady: workStatus?.resumeStatus === 'UPLOADED' && !!workStatus?.resumePath,
        isContactsListReady: workStatus?.communityStatus !== 'NOT_SELECTED'
    }

    // Actions
    const [launchContacts, setLaunchContacts] = useState<any[]>([])

    const handleRunAgent = async () => {
        try {
            // Buffer Strategy: Fetch more than needed to allow for skips/errors
            // If user wants 1, we fetch 5. If user wants 5, we fetch 10.
            let fetchLimit = "";
            let targetCount = -1; // -1 means "Send All" (MAX)

            if (batchSize !== "MAX") {
                targetCount = batchSize;
                const buffer = Math.max(5, Math.ceil(batchSize * 0.5)); // min 5 buffer, or 50% extra
                const safeLimit = batchSize + buffer;
                fetchLimit = `?limit=${safeLimit}`;
            }

            const res = await fetch(`/api/agent/contacts${fetchLimit}`)
            const data = await res.json()
            if (data.contacts && data.contacts.length > 0) {
                setLaunchContacts(data.contacts)
                // Pass targetCount to SendingFlow via a new state or just prop if I could. 
                // Since SendingFlow is rendered conditionally below, I need to pass it there.
                // I will add a transient state for this run.
                setRunConfig({ targetCount })
                setShowingSendingFlow(true)
            } else {
                setResult({ success: false, message: "No fresh contacts found to email." })
            }
        } catch (e) {
            console.error(e)
            setResult({ success: false, message: "Failed to load contacts." })
        }
    }

    // Transient Switcher State
    const [runConfig, setRunConfig] = useState({ targetCount: -1 })

    // Template State (Keeping it lifted here so it persists between tabs)
    const [template, setTemplate] = useState({
        name: "My Awesome Template",
        subject: "Application for [My Role] - {{name}}",
        body: "Hi {{name}},\n\nI recently came across the [My Role] opening at {{company}} and wanted to reach out directly.\n\nWith my background in software development and a passion for building scalable solutions, I believe I can bring immediate value to your team. I have attached my resume for your review.\n\nI would welcome the opportunity to discuss how my skills align with {{company}}'s goals.\n\nBest regards,\nBikram",
        senderPhone: "+1 (555) 000-0000",
        senderEmail: "bikram@example.com"
    })

    // Load template from DB on mount (Source of Truth)
    useEffect(() => {
        const loadTemplate = async () => {
            try {
                const res = await fetch("/api/templates")
                if (res.ok) {
                    const data = await res.json()
                    if (data) {
                        setTemplate({
                            name: data.name,
                            subject: data.subject,
                            body: data.body,
                            senderPhone: data.senderPhone || "",
                            senderEmail: data.senderEmail || ""
                        })
                        return // Exit if DB hit
                    }
                }
            } catch (e) {
                console.error("Failed to load template from DB", e)
            }

            // Fallback: Local Storage (only if DB is empty)
            const saved = localStorage.getItem("automailer_template_draft")
            if (saved) {
                try {
                    setTemplate(JSON.parse(saved))
                } catch (e) { }
            }
        }
        loadTemplate()
    }, [])

    // Save template to local storage on change
    useEffect(() => {
        localStorage.setItem("automailer_template_draft", JSON.stringify(template))
    }, [template])

    // 1. Loading State
    if (isLoading || !agentStatus) {
        return (
            <div className="space-y-8 animate-pulse p-1">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-[200px] bg-white/10" />
                    <Skeleton className="h-4 w-[300px] bg-white/5" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-3xl bg-white/5 border border-white/10" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Skeleton className="h-[400px] w-full rounded-3xl bg-white/5" />
                    <Skeleton className="h-[400px] w-full rounded-3xl bg-white/5" />
                </div>
            </div>
        )
    }

    // 3. Main Dashboard
    return (
        <div className="min-h-screen pb-20 fade-in-0 animate-in">

            {/* Header Area */}
            <div className="mb-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                            Dashboard <span className="text-indigo-500">.</span>
                        </h1>
                        <p className="text-zinc-400 text-sm">
                            System Status: <span className="text-green-400 font-medium font-mono">ONLINE</span>
                        </p>
                    </div>
                </div>

                {/* Workflow Navigation - STRICT (Reordered) */}
                <div className="bg-[#0F0F10] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <WorkflowTabs
                        currentStep={activeStep}
                        onStepChange={(step) => {
                            // Strict Validation on Click
                            if (step === 'prepare' && !isPrepareUnlocked) return;
                            if (step === 'craft' && !isTemplateUnlocked) return;
                            if (step === 'launch' && !isLaunchUnlocked) return;
                            setActiveStep(step)
                        }}
                        status={statusMap}
                        locks={{
                            prepare: !isPrepareUnlocked,
                            craft: !isTemplateUnlocked,
                            launch: !isLaunchUnlocked
                        }}
                    />

                    <div className="p-4 md:p-8 min-h-[500px]">
                        <AnimatePresence mode="wait">
                            {/* CONNECT STEP */}
                            {activeStep === 'connect' && (
                                <motion.div key="connect" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <SetupGuide step="connect" status={statusMap} gmailEmail={agentStatus?.gmail_email} />
                                </motion.div>
                            )}

                            {/* PREPARE STEP (Resources First) */}
                            {activeStep === 'prepare' && (
                                <motion.div key="prepare" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <SetupGuide
                                        step="prepare"
                                        status={statusMap}
                                        globalHrCount={agentStatus?.global_hr_count}
                                        contactSourceType={workStatus?.communityStatus} // Pass specific selection
                                        onResumeUpload={() => {
                                            updateWorkflowStatus('resumeStatus', 'UPLOADED')
                                            fetchStatus() // Refresh to sync resume path absolute check
                                        }}
                                        onCommunitySelect={(type) => {
                                            updateWorkflowStatus('communityStatus', type === 'db' ? 'SELECTED_DB' : 'SELECTED_CSV')
                                            fetchStatus() // Refresh to update fresh_contact_count
                                        }}
                                        onComplete={() => {
                                            setActiveStep('craft') // Move to Template
                                        }}
                                    />
                                </motion.div>
                            )}

                            {/* CRAFT STEP */}
                            {activeStep === 'craft' && (
                                <motion.div key="craft" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <TemplateBuilder
                                        template={template}
                                        setTemplate={setTemplate}
                                        profile={agentStatus.profile}
                                        isLocked={workStatus?.templateStatus === 'GENERATING'}
                                        isGenerated={workStatus?.templateStatus === 'GENERATED'}
                                        onComplete={() => {
                                            updateWorkflowStatus('templateStatus', 'GENERATED').then(() => {
                                                fetchStatus().then(() => {
                                                    // Status check in fetchStatus will redirect if contacts are 0
                                                    // But we can also force it here if we want to be explicit, 
                                                    // though letting the effect/state settle is safer.
                                                    // We'll let fetchStatus decide the active step based on data.
                                                    // However, to be snappy, we might want to set launch IF we know we are good.
                                                    // For fast UI, let's keep setActiveStep but rely on fetchStatus to correct if wrong.
                                                    setActiveStep('launch')
                                                })
                                            })
                                        }}
                                        onGenerating={() => updateWorkflowStatus('templateStatus', 'GENERATING')}
                                    />
                                </motion.div>
                            )}

                            {/* LAUNCH STEP */}
                            {activeStep === 'launch' && (
                                <motion.div key="launch" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto">
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-bold text-white mb-2">Mission Control</h2>
                                        <p className="text-zinc-400">Review your campaign settings and initiate the outreach sequence.</p>
                                    </div>
                                    <AgentControlPanel
                                        dailyLimit={agentStatus?.daily_limit || 50}
                                        emailsSentToday={agentStatus?.emails_sent_today || 0}
                                        appliedCount={agentStatus?.applied_count || 0}
                                        bouncedCount={agentStatus?.bounced_count || 0}
                                        validCount={agentStatus?.fresh_contact_count || 0}
                                        isReady={isLaunchUnlocked}
                                        onRunAgent={handleRunAgent}
                                        isRunning={isRunning}
                                        batchSize={batchSize}
                                        setBatchSize={setBatchSize}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Same notification/modal logic as before... */}
            {/* Notification Toast (Existing) */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl bg-zinc-900/95 backdrop-blur-md border border-white/10 shadow-2xl flex items-center gap-4 max-w-md"
                    >
                        <div className={cn(
                            "w-3 h-3 rounded-full flex-shrink-0",
                            result.success ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                        )} />
                        <div>
                            <h4 className="text-sm font-bold text-white">{result.success ? "Success" : "Error"}</h4>
                            <p className="text-xs text-zinc-400 mt-1">{result.message}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto text-zinc-500 hover:text-white"
                            onClick={() => setResult(null)}
                        >
                            <span className="sr-only">Close</span>
                            &times;
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Send Flow Modal (Existing) */}
            <AnimatePresence>
                {showingSendingFlow && (
                    <SendingFlow
                        contacts={launchContacts}
                        template={template}
                        targetCount={runConfig.targetCount} // Pass the target
                        onComplete={(stats) => {
                            setShowingSendingFlow(false)
                            const isSuccess = stats.sent > 0
                            setResult({
                                success: isSuccess,
                                message: `Campaign Completed: ${stats.sent} Sent, ${stats.failed} Failed.`
                            })
                            fetchStatus()
                        }}
                        onStop={() => setShowingSendingFlow(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
