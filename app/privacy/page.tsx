"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Logo } from "@/components/logo"
import { Shield, Lock, Eye, Database, Server, ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-green-500/30 relative overflow-hidden">

            {/* Background Ambience - Green/Emerald for Privacy */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-green-600/10 rounded-full blur-[100px] mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] mix-blend-screen"></div>
            </div>

            <div className="container mx-auto px-6 py-12 relative z-10 max-w-4xl">

                {/* Header */}
                <div className="relative flex items-center justify-center mb-16">
                    <Link href="/register" className="absolute left-0 flex items-center gap-2 group text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Back</span>
                    </Link>
                    <Link href="/">
                        <Logo iconClassName="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600" />
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Privacy Policy</h1>
                    <p className="text-lg text-gray-400">Your privacy is not just a promise, it's our architecture.</p>
                    <div className="mt-4 text-xs font-mono text-green-400 bg-green-500/10 px-3 py-1 rounded-full w-fit mx-auto border border-green-500/20">
                        Last updated: January 15, 2026
                    </div>
                </motion.div>

                {/* Content Card */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 space-y-12 backdrop-blur-xl shadow-2xl">

                    {/* Section 1 */}
                    <section className="flex gap-6">
                        <div className="shrink-0 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20">
                            <Database className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-3">1. Data We Collect</h2>
                            <p className="leading-relaxed text-gray-400 mb-4">
                                We believe in minimalism. We only collect what is strictly necessary to make the service work:
                            </p>
                            <ul className="grid sm:grid-cols-2 gap-3">
                                <li className="flex items-center gap-2 text-sm text-gray-300 bg-black/40 p-3 rounded-lg border border-white/5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Profile Info (Name, Email)
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-300 bg-black/40 p-3 rounded-lg border border-white/5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Uploaded Contacts & Resumes
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-300 bg-black/40 p-3 rounded-lg border border-white/5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Custom Email Templates
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-300 bg-black/40 p-3 rounded-lg border border-white/5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Usage Logs (for limits)
                                </li>
                            </ul>
                        </div>
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                    {/* Section 2 - Google API */}
                    <section className="relative overflow-hidden rounded-2xl bg-green-500/5 p-6 border border-green-500/10">
                        <div className="flex gap-6 relative z-10">
                            <div className="shrink-0 w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 border border-green-500/20">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                    2. Google User Data Policy
                                    <span className="text-[10px] uppercase tracking-wider bg-green-500 text-black px-2 py-0.5 rounded font-bold">Important</span>
                                </h2>
                                <p className="leading-relaxed text-gray-300 mb-4">
                                    AutoMailer connects to your Google Account via official OAuth2 protocols. We adhere strictly to the <strong>Google API Services User Data Policy</strong>, specifically the Limited Use requirements:
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Lock className="w-5 h-5 text-green-500 mt-0.5" />
                                        <p className="text-sm text-gray-400">We only request `gmail.send` scope to send emails on your behalf.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Eye className="w-5 h-5 text-green-500 mt-0.5" />
                                        <p className="text-sm text-gray-400">We <strong>NEVER</strong> read, scan, or analyze your personal emails or inbox content.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Server className="w-5 h-5 text-green-500 mt-0.5" />
                                        <p className="text-sm text-gray-400">We do <strong>NOT</strong> share or sell your data to any third parties for advertising or AI training.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                    {/* Section 3 */}
                    <section className="flex gap-6">
                        <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/20">
                            <Server className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-3">3. Data Storage & Security</h2>
                            <p className="leading-relaxed text-gray-400">
                                Your trust is paramount. We employ enterprise-grade security measures:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-400">
                                <li><strong>Encryption:</strong> All data in transit is encrypted via TLS 1.3.</li>
                                <li><strong>Database:</strong> Stored securely on enterprise providers (Neon/Supabase) with strict access controls.</li>
                                <li><strong>Deletion:</strong> You have the "Right to be Forgotten". You can delete your account and all associated data instantly from your dashboard.</li>
                            </ul>
                        </div>
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                    {/* Section 4 */}
                    <section className="flex gap-6">
                        <div className="shrink-0 w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/20">
                            <Logo iconClassName="w-6 h-6 bg-transparent shadow-none" textClassName="hidden" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-3">4. Contact Privacy Officer</h2>
                            <p className="leading-relaxed text-gray-400">
                                If you have any concerns regarding your data privacy, please contact our Data Protection Officer directly at <a href="mailto:jasonroycompany@gmail.com" className="text-green-400 hover:text-green-300 transition-colors">jasonroycompany@gmail.com</a>.
                            </p>
                        </div>
                    </section>

                </div>

                <div className="text-center mt-12 text-gray-600 text-sm">
                    © 2026 AutoMailer Inc. - Privacy First Architecture
                </div>

            </div>
        </div>
    )
}
