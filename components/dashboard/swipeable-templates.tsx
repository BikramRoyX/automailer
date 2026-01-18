"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Edit2, Check, Briefcase, User, Sparkles, Building2, Users } from "lucide-react"

interface Template {
    id: string
    name: string
    role: string
    preview: string
    icon: any
}

const DEMO_TEMPLATES: Template[] = [
    {
        id: "1",
        name: "Job Application",
        role: "HR",
        preview: "Hi {{name}},\n\nI recently came across the [Role] opening at {{company}} and wanted to reach out directly.\n\nWith my background in software development and a passion for building scalable solutions, I believe I can bring immediate value to your team. I have attached my resume for your review.\n\nI would welcome the opportunity to discuss how my skills align with {{company}}'s goals.\n\nBest regards,\nBikram Roy",
        icon: Building2
    },
    {
        id: "2",
        name: "Outreach Follow-up",
        role: "Recruiter",
        preview: "Hi {{name}},\n\nI just wanted to float this to the top of your inbox.\n\nI'm confident my experience with full-stack development aligns perfectly with {{company}}'s upcoming goals.\n\nLooking forward to hearing from you.\n\nBest regards,\nBikram Roy",
        icon: Users
    },
    {
        id: "3",
        name: "Founder Direct",
        role: "Founder",
        preview: "Hey {{name}},\n\nI love what you're building at {{company}}. I'm a developer who specializes in shipping products fast.\n\nI'd love to share some ideas on how I could contribute to your engineering velocity.\n\nBest regards,\nBikram Roy",
        icon: Sparkles
    },
    {
        id: "4",
        name: "Referral Request",
        role: "Peer",
        preview: "Hi {{name}},\n\nI noticed you work at {{company}}. I'm applying for the {{role}} role and typically love connecting with the team first.\n\nWould you be open to a quick chat about the culture there?\n\nBest regards,\nBikram Roy",
        icon: User
    },
    {
        id: "5",
        name: "Internship Inquiry",
        role: "Student",
        preview: "Dear {{name}},\n\nI am a final year student deeply passionate about {{company}}'s mission.\n\nI have built several projects using Next.js and React and would love to bring this energy to your team as an intern.\n\nBest regards,\nBikram Roy",
        icon: Briefcase
    }
]

import Link from "next/link" // Added import

// ... imports ...

interface SwipeableTemplatesProps {
    onSelect?: (template: Template) => void
    isDemoMode?: boolean
    templates?: Template[]
}

export function SwipeableTemplates({ onSelect, isDemoMode = false, templates = DEMO_TEMPLATES }: SwipeableTemplatesProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)

    const paginate = (newDirection: number) => {
        setDirection(newDirection)
        let newIndex = currentIndex + newDirection
        if (newIndex < 0) newIndex = templates.length - 1
        if (newIndex >= templates.length) newIndex = 0
        setCurrentIndex(newIndex)
    }

    // Auto-play effect
    useEffect(() => {
        const timer = setInterval(() => {
            paginate(1)
        }, 5000)
        return () => clearInterval(timer)
    }, [currentIndex])

    const currentTemplate = templates[currentIndex]

    const variants: any = {
        enter: (direction: number) => ({
            x: direction > 0 ? 500 : -500,
            opacity: 0,
            scale: 0.9
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5, type: "spring", stiffness: 300, damping: 30 }
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 500 : -500,
            opacity: 0,
            scale: 0.9,
            transition: { duration: 0.5 }
        })
    }

    return (
        <div className="w-full max-w-6xl mx-auto py-12 px-4">
            {!isDemoMode && (
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-indigo-400" />
                            Proven Email Templates
                        </h2>
                        <p className="text-zinc-400 text-sm">Automated sequences that get replies. Swipe to browse.</p>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => paginate(-1)} className="rounded-full border-white/10 hover:bg-white/10">
                            <ChevronLeft className="w-5 h-5 text-zinc-400" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => paginate(1)} className="rounded-full border-white/10 hover:bg-white/10">
                            <ChevronRight className="w-5 h-5 text-zinc-400" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Container Height Increased from 400px to 550px for 'Bada' feel */}
            <div className="relative h-[550px] flex items-center justify-center overflow-visible perspective-1000">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset }) => {
                            if (offset.x < -100) paginate(1);
                            else if (offset.x > 100) paginate(-1);
                        }}
                        className="absolute w-full max-w-2xl"
                    >
                        {/* Realistic Email Window Card - Added shadow-2xl and larger border radius */}
                        <div className="bg-[#1e1e20] rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                            {/* Email Header (Mac Style Window) */}
                            <div className="bg-[#27272a] px-4 py-3 border-b border-white/5 flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                                </div>
                                <div className="ml-4 flex items-center gap-2 bg-black/20 px-3 py-1 rounded-md border border-white/5 flex-1 max-w-xs">
                                    <currentTemplate.icon className="w-3 h-3 text-zinc-500" />
                                    <span className="text-[10px] text-zinc-400 truncate">Draft: {currentTemplate.name}</span>
                                </div>
                            </div>

                            {/* Email Metadata */}
                            <div className="p-6 pb-2 space-y-3">
                                <div className="flex items-center gap-3 text-sm border-b border-white/5 pb-2">
                                    <span className="text-zinc-500 w-12 text-right">To:</span>
                                    <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border-indigo-500/20">
                                        Hiring Manager
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-sm border-b border-white/5 pb-2">
                                    <span className="text-zinc-500 w-12 text-right">Subject:</span>
                                    <span className="text-white font-medium">Application for {"{{role}}"} at {"{{company}}"}</span>
                                </div>
                            </div>

                            {/* Email Body Preview - Increased min-height */}
                            <div className="px-6 py-4 min-h-[220px] bg-[#1a1a1c] text-left">
                                <p className="text-sm text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">
                                    {currentTemplate.preview}
                                </p>
                                <div className="mt-4 h-4 w-32 bg-white/5 rounded animate-pulse" />
                            </div>

                            {/* Action Footer */}
                            <div className="p-4 bg-[#27272a] border-t border-white/5 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs border-white/10 text-zinc-500">
                                        {currentTemplate.role} Template
                                    </Badge>
                                </div>
                                {isDemoMode ? null : (
                                    <Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg border border-indigo-400/50" onClick={() => onSelect && onSelect(currentTemplate)}>
                                        Save & Launch <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Progress Bar - Increased top margin for clear separation 'uske nicche' */}
            <div className="flex justify-center mt-8">
                <div className="flex gap-1">
                    {templates.map((_, idx) => (
                        <div
                            key={idx}
                            onClick={() => {
                                setDirection(idx > currentIndex ? 1 : -1)
                                setCurrentIndex(idx)
                            }}
                            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentIndex ? "w-12 bg-indigo-500" : "w-4 bg-white/10 hover:bg-white/20"
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
