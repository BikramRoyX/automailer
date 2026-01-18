"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Shield, Globe } from "lucide-react"

const CARDS = [
    {
        id: 1,
        title: "Automated Job Outreach",
        subtitle: "Zero Manual Work",
        icon: <Globe className="h-8 w-8" />,
        color: "from-indigo-500 to-purple-600",
        stats: [
            { label: "Applications Sent", value: "24/7", valueColor: "text-green-400" },
            { label: "Response Rate", value: "+40%", valueColor: "text-indigo-400" }
        ],
        quote: "I woke up to 5 interview requests. AutoMailer did the work while I slept. It's like having a personal recruiter.",
        author: "Devin J.",
        role: "Frontend Developer",
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Devin"
    },
    {
        id: 2,
        title: "Intelligent Filtering",
        subtitle: "Targeted Precision",
        icon: <CheckCircle2 className="h-8 w-8" />,
        color: "from-blue-500 to-cyan-500",
        stats: [
            { label: "Relevance Score", value: "99%", valueColor: "text-blue-400" },
            { label: "False Positives", value: "0%", valueColor: "text-cyan-400" }
        ],
        quote: "It only applies to roles that match my experience. No more wasting time on senior roles I'm not qualified for.",
        author: "Sarah K.",
        role: "Data Analyst",
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=SarahK"
    },
    {
        id: 3,
        title: "Account Safety Guard",
        subtitle: "Human Behavior",
        icon: <Shield className="h-8 w-8" />,
        color: "from-emerald-500 to-green-600",
        stats: [
            { label: "Ban Risk", value: "0%", valueColor: "text-emerald-400" },
            { label: "Daily Limit", value: "Safe", valueColor: "text-green-400" }
        ],
        quote: "I was scared of getting banned, but AutoMailer paces everything perfectly. My account is 100% safe.",
        author: "Mike R.",
        role: "UX Designer",
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=MikeR"
    }
]

export function SwipeableCards() {
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % CARDS.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="relative w-full max-w-2xl h-[600px] perspective-1000">
            <AnimatePresence mode="popLayout">
                {CARDS.map((card, index) => {
                    if (index !== currentIndex) return null

                    return (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, x: 100, rotateY: -20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1, zIndex: 10 }}
                            exit={{ opacity: 0, x: -100, rotateY: 20, scale: 0.9, zIndex: 0 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            className="absolute inset-0 rounded-[2.5rem] border border-white/10 bg-black/60 backdrop-blur-2xl p-12 shadow-2xl origin-center flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center gap-6 mb-10">
                                    <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-xl transform -rotate-3`}>
                                        {card.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-bold text-white mb-1">{card.title}</h3>
                                        <p className="text-lg text-gray-400 font-medium">{card.subtitle}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {card.stats.map((stat, i) => (
                                        <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                            <span className="text-lg text-gray-300 font-medium">{stat.label}</span>
                                            <span className={`text-xl font-mono font-bold ${stat.valueColor}`}>{stat.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/10">
                                <p className="text-xl font-medium leading-relaxed italic text-gray-200 mb-8">
                                    &quot;{card.quote}&quot;
                                </p>
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 rounded-full border-2 border-white/10 p-0.5 overflow-hidden bg-white/5">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={card.avatar}
                                            alt={card.author}
                                            className="h-full w-full object-cover rounded-full"
                                        />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-lg">{card.author}</div>
                                        <div className="text-gray-400 text-sm">{card.role}</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </AnimatePresence>

            {/* Progress Indicators */}
            <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-4">
                {CARDS.map((_, i) => (
                    <div
                        key={i}
                        className={`h-3 rounded-full transition-all duration-500 ${i === currentIndex ? "w-12 bg-indigo-500 shadow-lg shadow-indigo-500/50" : "w-3 bg-gray-800"}`}
                    />
                ))}
            </div>
        </div>
    )
}
