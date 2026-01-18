"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronRight, Upload, Check, ChevronLeft, Mail, FileText, User, ShieldCheck } from "lucide-react"
import { completeOnboarding } from "@/app/actions/onboarding"
import { uploadResume, uploadHrList } from "@/app/actions/upload"

type OnboardingData = {
    name: string
    phoneNumber: string
    template: { subject: string; body: string }
    dailyLimit: number
}

const steps = [
    { id: 1, title: "Connect", icon: Mail },
    { id: 2, title: "Identity", icon: User },
    { id: 3, title: "Resume", icon: FileText },
    { id: 4, title: "HR List", icon: Upload },
    { id: 5, title: "Template", icon: Mail },
    { id: 6, title: "Limits", icon: ShieldCheck },
    { id: 7, title: "Review", icon: Check }
]

export default function OnboardingPage() {
    const { data: session, update } = useSession()
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState<OnboardingData>({
        name: session?.user?.name || "",
        phoneNumber: "",
        template: {
            subject: "Application for [Role]",
            body: "Hi {{name}},\n\nI noticed your company is hiring and wanted to apply..."
        },
        dailyLimit: 20
    })
    const [resumeName, setResumeName] = useState("")
    const [csvCount, setCsvCount] = useState(0)
    const [confirmed, setConfirmed] = useState(false)

    const handleNext = () => {
        if (currentStep < 7) setCurrentStep(prev => prev + 1)
        else handleSubmit()
    }

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1)
    }

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return
        setIsLoading(true)
        const formData = new FormData()
        formData.append("file", e.target.files[0])
        try {
            const res = await uploadResume(formData)
            setResumeName(e.target.files[0].name)
        } catch (err) { console.error(err) }
        setIsLoading(false)
    }

    const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return
        setIsLoading(true)
        const formData = new FormData()
        formData.append("file", e.target.files[0])
        try {
            const res = await uploadHrList(formData)
            setCsvCount(res.count ?? 0)
        } catch (err) { console.error(err) }
        setIsLoading(false)
    }

    const handleSubmit = async () => {
        if (!confirmed) return
        setIsLoading(true)
        try {
            await completeOnboarding(data)
            await update()
            router.push("/dashboard")
        } catch (error) {
            console.error("Onboarding failed", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 font-sans selection:bg-indigo-500/30">
            <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black"></div>

            <div className="w-full max-w-4xl relative z-10 grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8 bg-[#0F0F10] border border-white/10 rounded-3xl p-2 shadow-2xl overflow-hidden">

                {/* Sidebar Stepper */}
                <div className="bg-zinc-900/30 p-6 rounded-2xl hidden md:flex flex-col gap-6">
                    <div className="mb-4">
                        <h2 className="font-bold text-xl tracking-tight">Setup Guide</h2>
                        <p className="text-xs text-gray-400 mt-1">Configure your personal assistant.</p>
                    </div>
                    <div className="space-y-4">
                        {steps.map((step) => (
                            <div key={step.id} className={`flex items-center gap-3 transition-colors ${currentStep === step.id ? "text-white" : currentStep > step.id ? "text-indigo-400" : "text-gray-600"}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs
                                    ${currentStep === step.id ? "border-white bg-white text-black" :
                                        currentStep > step.id ? "border-indigo-500 bg-indigo-500/10 text-indigo-400" : "border-gray-700"}`}>
                                    {currentStep > step.id ? <Check className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                                </div>
                                <span className="text-sm font-medium">{step.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-6 md:p-10 flex flex-col h-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex-1"
                        >
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <h1 className="text-3xl font-bold">Connect Google Account</h1>
                                    <p className="text-gray-400">AutoMailer sends emails directly from your Gmail account.</p>
                                    <div className="flex items-center gap-4 p-4 border border-green-500/30 bg-green-500/10 rounded-xl">
                                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-black">
                                            <Check className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-green-400">Connected</p>
                                            <p className="text-sm text-gray-300">{session?.user?.email}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">We only use the "Send Email" permission. We do not read your inbox.</p>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <h1 className="text-3xl font-bold">Your Identity</h1>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Full Name</Label>
                                            <Input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className="bg-white/5 border-white/10" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phone Number</Label>
                                            <Input value={data.phoneNumber} onChange={(e) => setData({ ...data, phoneNumber: e.target.value })} className="bg-white/5 border-white/10" placeholder="+1..." />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <h1 className="text-3xl font-bold">Upload Resume</h1>
                                    <p className="text-gray-400">Attached to every email.</p>
                                    <div className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center hover:bg-white/5 transition-colors relative">
                                        <input type="file" accept=".pdf" onChange={handleResumeUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                                        <p className="text-sm font-medium">{resumeName || "Click to Upload PDF"}</p>
                                    </div>
                                    {resumeName && (
                                        <div className="flex items-center gap-2 text-indigo-400 text-sm">
                                            <Check className="w-4 h-4" /> Ready: {resumeName}
                                        </div>
                                    )}
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <h1 className="text-3xl font-bold">Upload HR List</h1>
                                    <p className="text-gray-400">CSV with an 'email' column.{csvCount > 0 ? ` Found ${csvCount} contacts.` : ""}</p>
                                    <div className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center hover:bg-white/5 transition-colors relative">
                                        <input type="file" accept=".csv" onChange={handleCsvUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        <FileText className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                                        <p className="text-sm font-medium">Click to Upload CSV</p>
                                    </div>
                                </div>
                            )}

                            {currentStep === 5 && (
                                <div className="space-y-6">
                                    <h1 className="text-3xl font-bold">Default Template</h1>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Subject</Label>
                                            <Input value={data.template.subject} onChange={(e) => setData({ ...data, template: { ...data.template, subject: e.target.value } })} className="bg-white/5 border-white/10" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Body</Label>
                                            <Textarea value={data.template.body} onChange={(e) => setData({ ...data, template: { ...data.template, body: e.target.value } })} className="bg-white/5 border-white/10 h-32" />
                                            <p className="text-xs text-gray-500">Variables: {"{{name}}"}, {"{{company}}"}, {"{{role}}"}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 6 && (
                                <div className="space-y-6">
                                    <h1 className="text-3xl font-bold">Daily Limit</h1>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                                            <span className="font-bold text-2xl text-indigo-400">{data.dailyLimit}</span>
                                            <span className="text-sm text-gray-400">Emails / Day</span>
                                        </div>
                                        <input type="range" min="1" max="50" value={data.dailyLimit} onChange={(e) => setData({ ...data, dailyLimit: parseInt(e.target.value) })} className="w-full accent-indigo-500 h-2 bg-white/10 rounded-lg appearance-none" />
                                        <p className="text-amber-400 text-xs bg-amber-400/10 p-3 rounded-lg border border-amber-400/20">Conservative limits protect your sender reputation.</p>
                                    </div>
                                </div>
                            )}

                            {currentStep === 7 && (
                                <div className="space-y-6">
                                    <h1 className="text-3xl font-bold">Ready to Start</h1>
                                    <div className="bg-white/5 p-6 rounded-xl space-y-4 text-sm text-gray-300">
                                        <div className="flex justify-between"><span>Name:</span> <span className="text-white">{data.name}</span></div>
                                        <div className="flex justify-between"><span>Resume:</span> <span className="text-white">{resumeName || "None"}</span></div>
                                        <div className="flex justify-between"><span>Contacts:</span> <span className="text-white">{csvCount}</span></div>
                                        <div className="flex justify-between"><span>Limit:</span> <span className="text-white">{data.dailyLimit}/day</span></div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 border border-white/10 rounded-xl bg-indigo-500/5">
                                        <Checkbox id="confirm" checked={confirmed} onCheckedChange={(c) => setConfirmed(c as boolean)} />
                                        <label htmlFor="confirm" className="text-sm leading-tight cursor-pointer">
                                            I confirm that I have reviewed the template and recipients. I authorize AutoMailer to send emails on my behalf using my Google Account.
                                        </label>
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex justify-between mt-auto pt-8 border-t border-white/10">
                        <Button variant="ghost" onClick={handleBack} disabled={currentStep === 1 || isLoading} className="text-gray-400 hover:text-white">Back</Button>
                        <Button onClick={handleSubmit} disabled={isLoading || (currentStep === 7 && !confirmed)} className="bg-white text-black hover:bg-gray-200">
                            {isLoading ? "Saving..." : currentStep === 7 ? "Activate Agent" : "Continue"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
