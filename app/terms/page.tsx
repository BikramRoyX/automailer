"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Logo } from "@/components/logo"
import { ShieldCheck, ArrowLeft, Scale, AlertCircle, StopCircle, HelpCircle } from "lucide-react"

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-indigo-500/30 relative overflow-hidden">

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] mix-blend-screen"></div>
            </div>

            <div className="container mx-auto px-6 py-12 relative z-10 max-w-4xl">

                {/* Header */}
                <div className="relative flex items-center justify-center mb-16">
                    <Link href="/register" className="absolute left-0 flex items-center gap-2 group text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Back</span>
                    </Link>
                    <Link href="/">
                        <Logo />
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Terms of Service</h1>
                    <p className="text-lg text-gray-400">Please read these terms carefully before using AutoMailer.</p>
                    <div className="mt-4 text-xs font-mono text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full w-fit mx-auto border border-indigo-500/20">
                        Last updated: January 15, 2026
                    </div>
                </motion.div>

                {/* Content Card */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 space-y-12 backdrop-blur-xl shadow-2xl">

                    {/* Section 1 */}
                    <section className="flex gap-6">
                        <div className="shrink-0 w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                            <Scale className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-3">1. Introduction</h2>
                            <p className="leading-relaxed text-gray-400">
                                Welcome to AutoMailer. By accessing or using our website and services, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
                            </p>
                        </div>
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                    {/* Section 2 */}
                    <section className="flex gap-6">
                        <div className="shrink-0 w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/20">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-3">2. Usage Limits & Fair Use</h2>
                            <p className="leading-relaxed text-gray-400 mb-4">
                                AutoMailer enables you to send automated emails via your personal Google account. To ensure ecosystem safety:
                            </p>
                            <ul className="space-y-2 text-gray-400 list-disc pl-5">
                                <li>You agree to a strict daily sending limit (default: 50 emails/day).</li>
                                <li>Circumventing these limits via multiple accounts or technical exploits is prohibited.</li>
                                <li>We reserve the right to throttle or suspend accounts showing abusive patterns.</li>
                            </ul>
                        </div>
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                    {/* Section 3 */}
                    <section className="flex gap-6">
                        <div className="shrink-0 w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 border border-red-500/20">
                            <StopCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-3">3. Acceptable Use Policy</h2>
                            <p className="leading-relaxed text-gray-400">
                                You are solely responsible for the content you send. You agree NOT to use AutoMailer for:
                            </p>
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <div className="bg-black/40 p-4 rounded-lg border border-white/5 text-sm text-gray-300">
                                    🚫 Sending unsolicited spam or scams
                                </div>
                                <div className="bg-black/40 p-4 rounded-lg border border-white/5 text-sm text-gray-300">
                                    🚫 Phishing or credential harvesting
                                </div>
                                <div className="bg-black/40 p-4 rounded-lg border border-white/5 text-sm text-gray-300">
                                    🚫 Harassment or hate speech
                                </div>
                                <div className="bg-black/40 p-4 rounded-lg border border-white/5 text-sm text-gray-300">
                                    🚫 Violating GDPR/CAN-SPAM act
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                    {/* Section 4 */}
                    <section className="flex gap-6">
                        <div className="shrink-0 w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400 border border-sky-500/20">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-3">4. Limitation of Liability</h2>
                            <p className="leading-relaxed text-gray-400">
                                AutoMailer is provided "AS IS". We do not guarantee that your emails will land in the primary inbox, as this depends heavily on your own domain reputation, email content, and recipient filters. We are not liable for any lost opportunities or damages resulting from the use of our service.
                            </p>
                        </div>
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                    {/* Section 5 */}
                    <section className="flex gap-6">
                        <div className="shrink-0 w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                            <HelpCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-3">5. Contact Us</h2>
                            <p className="leading-relaxed text-gray-400">
                                If you have any questions about these Terms, please contact our support team at <a href="mailto:jasonroycompany@gmail.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">jasonroycompany@gmail.com</a>.
                            </p>
                        </div>
                    </section>

                </div>

                <div className="text-center mt-12 text-gray-600 text-sm">
                    © 2026 AutoMailer Inc. All rights reserved.
                </div>

            </div>
        </div>
    )
}
