"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Lock, ShieldCheck, Mail, ArrowRight, CheckCircle2, User, FileText, Send } from "lucide-react"
import { motion } from "framer-motion"

const steps = [
    {
        number: "01",
        title: "Connect Your Account",
        description: "Securely link your Gmail account. We use official Google OAuth2 to ensure your credentials never touch our servers. It's the same technology used by millions of apps.",
        icon: Lock,
        color: "text-indigo-400",
        Mockup: () => (
            <div className="w-full h-full bg-zinc-900 rounded-xl border border-white/10 p-6 flex flex-col gap-4 relative overflow-hidden backdrop-blur-sm shadow-2xl">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <div className="h-8 bg-white/5 rounded w-3/4 animate-pulse"></div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="p-4 bg-white rounded-lg flex items-center gap-3 shadow-lg">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">G</div>
                        <span className="text-black text-sm font-medium">Sign in with Google</span>
                    </div>
                </div>
            </div>
        )
    },
    {
        number: "02",
        title: "Prepare Your Data",
        description: "Upload your resume (PDF) and your target contact list (CSV). Our system will automatically parse fields like 'Company' and 'Name' to personalize every single email.",
        icon: FileText,
        color: "text-purple-400",
        Mockup: () => (
            <div className="w-full h-full bg-zinc-900 rounded-xl border border-white/10 p-6 flex flex-col gap-3 relative overflow-hidden backdrop-blur-sm shadow-2xl">
                <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
                    <div className="h-4 bg-white/10 rounded w-1/3"></div>
                    <div className="h-4 bg-purple-500/20 rounded w-1/4"></div>
                </div>
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-2">
                        <div className="h-2 bg-white/5 rounded w-1/4"></div>
                        <div className="h-2 bg-white/5 rounded w-1/4"></div>
                        <div className="h-2 bg-indigo-500/20 rounded w-1/2"></div>
                    </div>
                ))}
                <div className="mt-auto p-3 bg-white/5 rounded-lg border border-white/5 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <div className="flex-1">
                        <div className="h-2 bg-white/20 rounded w-1/2 mb-1"></div>
                        <div className="h-2 bg-white/10 rounded w-1/3"></div>
                    </div>
                </div>
            </div>
        )
    },
    {
        number: "03",
        title: "Review & Launch",
        description: "Preview every single email before it sends. Once approved, the AutoMailer agent will start sending at a safe, human pace of ~50 emails per day.",
        icon: Send,
        color: "text-pink-400",
        Mockup: () => (
            <div className="w-full h-full bg-zinc-900 rounded-xl border border-white/10 p-6 flex flex-col gap-4 relative overflow-hidden backdrop-blur-sm shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-white/10"></div>
                    <div className="flex-1 h-2 bg-white/10 rounded"></div>
                </div>
                <div className="bg-white/5 p-4 rounded-lg border border-white/5 text-[10px] text-gray-400 leading-relaxed">
                    <span className="text-white">Subject: Application for [Role]</span>
                    <br /><br />
                    Hi [Name],
                    <br />
                    I admire the work [Company] is doing...
                </div>
                <div className="mt-auto self-end">
                    <div className="px-4 py-2 bg-indigo-500 text-white text-xs font-bold rounded-full shadow-lg shadow-indigo-500/20">
                        Send Campaign
                    </div>
                </div>
            </div>
        )
    }
]

export default function SetupGuidePage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 font-sans relative overflow-x-hidden">
            {/* Background Effects */}
            <div className="fixed top-[20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
            <div className="fixed bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

            <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 pt-32 pb-40 relative z-10">
                <div className="text-center mb-32 space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white/5 border border-white/10 mb-6 shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)]">
                        <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500"
                    >
                        How it Works
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        Your personal AI recruiter in 3 simple steps.
                    </motion.p>
                </div>

                <div className="max-w-6xl mx-auto space-y-32">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.7 }}
                            className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                        >
                            {/* Text Side */}
                            <div className="flex-1 space-y-6 text-center md:text-left">
                                <span className={`text-9xl font-bold opacity-10 leading-none block ${step.color} select-none`}>
                                    {step.number}
                                </span>
                                <h3 className="text-3xl md:text-4xl font-bold flex flex-col md:flex-row items-center md:items-start gap-3">
                                    {step.title}
                                </h3>
                                <p className="text-xl text-gray-400 leading-relaxed font-light">
                                    {step.description}
                                </p>
                            </div>

                            {/* Visual Side */}
                            <div className="flex-1 w-full aspect-square md:aspect-[4/3] relative group perspective-1000">
                                {/* Gradient Blob */}
                                <div className={`absolute inset-0 bg-gradient-to-tr ${step.color.replace('text-', 'from-')}/20 to-transparent blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-700`}></div>

                                {/* 3D Card Container */}
                                <div className="relative w-full h-full transform transition-transform duration-700 hover:scale-[1.02] hover:rotate-1">
                                    <step.Mockup />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-40 text-center"
                >
                    <h2 className="text-3xl font-bold mb-8">Ready to automate your job search?</h2>
                    <Link href="/register">
                        <Button size="lg" className="h-16 px-12 text-lg bg-white text-black hover:bg-gray-100 rounded-full font-bold shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform">
                            Start Sending Now <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                </motion.div>
            </main>
        </div>
    )
}
