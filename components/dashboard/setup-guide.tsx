"use client"

import { useState, useRef, useEffect } from "react"
import { uploadFile } from "@/app/actions/upload"
import { copySystemContacts } from "@/app/actions/contacts"
import { Button } from "@/components/ui/button"
import { Mail, Upload, FileJson, FileText, Check, Loader2, Link as LinkIcon, ArrowRight, ShieldCheck, Database, Fingerprint } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface SetupGuideProps {
    step: 'connect' | 'prepare'
    status: {
        isGmailConnected: boolean
        isContactsReady: boolean
        isTemplateReady: boolean
        isResumeReady?: boolean
        isContactsListReady?: boolean
    }
    gmailEmail?: string
    globalHrCount?: number
    onComplete?: () => void
    // New Props
    onResumeUpload?: () => Promise<void> | void
    onCommunitySelect?: (type: 'db' | 'csv') => Promise<void> | void
    // Contact Source Type
    contactSourceType?: 'SELECTED_DB' | 'SELECTED_CSV' | 'NOT_SELECTED'
}

export function SetupGuide({ step, status, gmailEmail, globalHrCount, onComplete, onResumeUpload, onCommunitySelect, contactSourceType }: SetupGuideProps) {
    const [uploading, setUploading] = useState<string | null>(null) // 'resume' | 'csv' | null
    const [uploadStatus, setUploadStatus] = useState<{ resume: boolean, csv: boolean }>({
        resume: !!status.isResumeReady,
        csv: !!status.isContactsListReady
    })

    const [contactSource, setContactSource] = useState<'system' | 'upload' | null>(null)
    const [isCopyingContacts, setIsCopyingContacts] = useState(false)

    // Update upload status if props change (e.g. revalidation)
    useEffect(() => {
        setUploadStatus({
            resume: !!status.isResumeReady,
            csv: !!status.isContactsListReady
        })
    }, [status.isResumeReady, status.isContactsListReady])

    const resumeInputRef = useRef<HTMLInputElement>(null)
    const csvInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'csv') => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(type)
        const formData = new FormData()
        formData.append("file", file)
        formData.append("type", type)

        try {
            const res = await uploadFile(formData)
            if (res.success) {
                if (type === 'resume' && onResumeUpload) await onResumeUpload()
                if (type === 'csv' && onCommunitySelect) await onCommunitySelect('csv')

                // Premium Notification Logic
                if (res.systemAddedCount && res.systemAddedCount > 0) {
                    toast.success("Community Database Updated", {
                        description: `You added ${res.systemAddedCount} valid HRs to the Global List!`,
                        icon: <Database className="w-4 h-4 text-indigo-400" />
                    })
                }

                toast.success("Resource Uploaded", {
                    description: res.message
                })

                setUploadStatus(prev => {
                    const next = { ...prev, [type]: true }
                    // Check if both are now done
                    if (next.resume && next.csv && onComplete) {
                        setTimeout(() => onComplete(), 1500) // Delay for visual confirmation
                    }
                    return next
                })
            } else {
                toast.error("Upload Failed", {
                    description: res.message
                })
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred during upload")
        } finally {
            setUploading(null)
            if (e.target) e.target.value = ''
        }
    }

    if (step === 'connect') {
        return (
            <div className="max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="group relative">
                    <div className={cn(
                        "absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl blur opacity-20 transition duration-500",
                        !status.isGmailConnected && "opacity-60 group-hover:opacity-100"
                    )} />
                    <div className="relative h-full bg-[#0F0F10] border border-white/10 rounded-2xl p-8 flex flex-col justify-between overflow-hidden">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "p-4 rounded-xl transition-colors",
                                    status.isGmailConnected ? "bg-green-500/10 text-green-500" : "bg-indigo-500/10 text-indigo-400"
                                )}>
                                    <Mail className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Gmail Integration</h3>
                                    <p className="text-zinc-400">Connect your account safely via OAuth 2.0</p>
                                </div>
                            </div>
                            {status.isGmailConnected && (
                                <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-2 text-[10px] text-green-400 font-medium uppercase tracking-wider">
                                    <Check className="w-3 h-3" /> Connected
                                </div>
                            )}
                        </div>
                        {/* Content */}
                        <div className="space-y-6 mb-8 relative z-10 max-w-xl">
                            <p className="text-base text-zinc-400 leading-relaxed">
                                {status.isGmailConnected
                                    ? `Great! You are connected as ${gmailEmail}. The system now has permission to draft and send emails on your behalf based on your defined limits.`
                                    : "To ensure high deliverability and trust, we send emails directly through your Gmail account API. This prevents your emails from landing in spam folders."}
                            </p>
                            {!status.isGmailConnected && (
                                <div className="bg-white/5 rounded-lg p-4 text-sm text-zinc-300 border border-white/5">
                                    <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold">
                                        <ShieldCheck className="w-4 h-4" /> Security Note
                                    </div>
                                    We only request permissions to <strong>send emails</strong>. We cannot read your inbox or access other personal data.
                                </div>
                            )}
                        </div>
                        {/* Action */}
                        <div className="mt-auto pt-6 border-t border-white/5">
                            {status.isGmailConnected ? (
                                <div className="flex items-center gap-4">
                                    <Button variant="outline" className="border-white/10 hover:bg-white/5 text-zinc-400" asChild>
                                        <a href="/dashboard/settings">Manage Connection</a>
                                    </Button>
                                    <span className="text-sm text-green-500 flex items-center gap-2">
                                        <Check className="w-4 h-4" /> Ready for next step
                                    </span>
                                </div>
                            ) : (
                                <Button className="w-full md:w-auto px-8 py-6 text-lg bg-white text-black hover:bg-zinc-200 group/btn" asChild>
                                    <a href="/dashboard/settings" className="flex items-center justify-center gap-2">
                                        Connect Google Account <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (step === 'prepare') {
        return (
            <div className="max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="group relative">
                    <div className={cn(
                        "absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur opacity-20 transition duration-500",
                        (!uploadStatus.csv || !uploadStatus.resume) && "opacity-40 group-hover:opacity-80"
                    )} />
                    <div className="relative h-full bg-[#0F0F10] border border-white/10 rounded-2xl p-8 flex flex-col justify-between">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "p-4 rounded-xl transition-colors",
                                    (uploadStatus.csv && uploadStatus.resume) ? "bg-green-500/10 text-green-500" : "bg-purple-500/10 text-purple-400"
                                )}>
                                    <Upload className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Upload Resources</h3>
                                    <p className="text-zinc-400">Prepare your assets for the campaign</p>
                                </div>
                            </div>
                            {(uploadStatus.csv && uploadStatus.resume) && (
                                <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-2 text-[10px] text-green-400 font-medium uppercase tracking-wider">
                                    <Check className="w-3 h-3" /> Ready
                                </div>
                            )}
                        </div>
                        {/* Content */}
                        <div className="space-y-6 mb-8">
                            <p className="text-base text-zinc-400 leading-relaxed max-w-xl">
                                We need two things to get started: your <strong>Resume</strong> and your <strong>Target Contacts</strong>.
                            </p>
                        </div>
                        {/* Resume Upload (Always needed) */}
                        <div className="mb-8">
                            <input type="file" ref={resumeInputRef} className="hidden" accept=".pdf" onChange={(e) => handleFileChange(e, 'resume')} />
                            <div
                                onClick={() => resumeInputRef.current?.click()}
                                className={cn(
                                    "flex items-center justify-between p-6 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]",
                                    uploadStatus.resume ? "bg-green-500/5 border-green-500/20 hover:bg-green-500/10" : "bg-white/5 border-white/5 hover:bg-white/10"
                                )}>
                                <div className="flex items-center gap-4">
                                    {uploading === 'resume' ? <Loader2 className="w-6 h-6 animate-spin text-zinc-400" /> : <FileText className={cn("w-6 h-6", uploadStatus.resume ? "text-green-500" : "text-zinc-500")} />}
                                    <div>
                                        <span className={cn("block text-sm font-bold", uploadStatus.resume ? "text-white" : "text-zinc-300")}>Resume.pdf</span>
                                        <span className="text-xs text-zinc-500">Max 5MB</span>
                                    </div>
                                </div>
                                {uploadStatus.resume ? (
                                    <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                                        <Check className="w-4 h-4 text-green-500" />
                                        <span className="text-sm font-medium text-green-500">Resume Uploaded</span>
                                    </div>
                                ) : (
                                    <span className="text-[10px] uppercase text-zinc-600 font-bold bg-white/5 px-2 py-1 rounded">Upload</span>
                                )}
                            </div>
                        </div>
                        {/* Contact Source Selection */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Select Contact Source</h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Option A: Community/System */}
                                <div
                                    onClick={() => setContactSource('system')}
                                    className={cn(
                                        "p-6 rounded-xl border cursor-pointer transition-all hover:border-indigo-500/50 relative overflow-hidden",
                                        contactSource === 'system' ? "bg-indigo-600/10 border-indigo-500" : "bg-white/5 border-white/5"
                                    )}
                                >
                                    <Database className="w-8 h-8 text-indigo-400 mb-4" />
                                    <h5 className="font-bold text-white mb-1">Community Database</h5>
                                    <p className="text-xs text-zinc-400">
                                        Use our verified list of <strong className="text-white">{globalHrCount ? globalHrCount.toLocaleString() + '+' : '...'}</strong> HRs & Recruiters. Instant access.
                                    </p>
                                    {/* Visual Selection Indicator - ONLY if DB selected */}
                                    {contactSourceType === 'SELECTED_DB' && !uploading && (
                                        <div className="absolute top-4 right-4 bg-green-500 rounded-full p-1 shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                    {/* Active State Indicator (Pre-selection) */}
                                    {contactSource === 'system' && !uploadStatus.csv && <div className="absolute top-4 right-4 w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
                                </div>
                                {/* Option B: Upload */}
                                <div
                                    onClick={() => setContactSource('upload')}
                                    className={cn(
                                        "p-6 rounded-xl border cursor-pointer transition-all hover:border-pink-500/50 relative overflow-hidden",
                                        contactSource === 'upload' ? "bg-pink-600/10 border-pink-500" : "bg-white/5 border-white/5"
                                    )}
                                >
                                    <Fingerprint className="w-8 h-8 text-pink-400 mb-4" />
                                    <h5 className="font-bold text-white mb-1">Upload Your List</h5>
                                    <p className="text-xs text-zinc-400">Have your own CSV? Upload it and contribute to the community.</p>

                                    {/* Visual Selection Indicator - ONLY if CSV selected */}
                                    {contactSourceType === 'SELECTED_CSV' && !uploading && (
                                        <div className="absolute top-4 right-4 bg-green-500 rounded-full p-1 shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                    {/* Active State Indicator (Pre-selection) */}
                                    {contactSource === 'upload' && !uploadStatus.csv && <div className="absolute top-4 right-4 w-3 h-3 bg-pink-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]" />}
                                </div>
                            </div>
                            {/* Actions Area */}
                            <div className="pt-4 animate-in fade-in slide-in-from-top-2">
                                {contactSource === 'system' && (
                                    <div className="bg-indigo-900/10 border border-indigo-500/20 p-4 rounded-xl flex items-center justify-between">
                                        <div className="text-sm text-indigo-200">
                                            We'll add <strong>50 verified contacts</strong> to your campaign.
                                        </div>
                                        <Button
                                            size="sm"
                                            className="bg-indigo-600 hover:bg-indigo-500"
                                            disabled={isCopyingContacts}
                                            onClick={async () => {
                                                setIsCopyingContacts(true)
                                                // Call server action
                                                const res = await copySystemContacts()

                                                if (res.success) {
                                                    if (onCommunitySelect) await onCommunitySelect('db')
                                                    setUploadStatus(prev => ({ ...prev, csv: true }))
                                                    toast.success("Community List Synced", { description: res.message })
                                                    if (uploadStatus.resume && onComplete) setTimeout(() => onComplete(), 1000)
                                                } else {
                                                    // Handle "Exhausted" case specifically
                                                    if (res.message && res.message.includes("No new valid contacts")) {
                                                        toast.warning("Community List Exhausted", {
                                                            description: "You have already contacted all available safe HRs. Please upload your own CSV list to continue."
                                                        })
                                                    } else {
                                                        toast.error("Sync Failed", { description: res.message })
                                                    }
                                                }
                                                setIsCopyingContacts(false)
                                            }}
                                        >
                                            {isCopyingContacts ? "Syncing..." : uploadStatus.csv && contactSourceType === 'SELECTED_DB' ? "Synced (Click to Re-sync)" : "Use System List"}
                                        </Button>
                                    </div>
                                )}
                                {contactSource === 'upload' && (
                                    <div className="bg-pink-900/10 border border-pink-500/20 p-4 rounded-xl flex items-center justify-between">
                                        <div className="text-sm text-pink-200">
                                            Upload a CSV with <strong>Email, Name, Company</strong> columns.
                                        </div>
                                        <input type="file" ref={csvInputRef} className="hidden" accept=".csv" onChange={(e) => handleFileChange(e, 'csv')} />
                                        <Button
                                            size="sm"
                                            className="bg-pink-600 hover:bg-pink-500"
                                            disabled={uploading === 'csv'}
                                            onClick={() => csvInputRef.current?.click()}
                                        >
                                            {uploading === 'csv' ? "Uploading..." : uploadStatus.csv && contactSourceType === 'SELECTED_CSV' ? "Re-upload CSV" : "Select CSV"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return null
}
