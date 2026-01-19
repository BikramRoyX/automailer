"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Copy, ArrowRight, Zap, Check, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

const categories = ["All", "Student", "Job Application", "Data Science", "Design", "Engineering", "Marketing"]

const templates = [
    {
        title: "Application for Software Trainee / Intern - BCA Final Year",
        category: "Student",
        difficulty: "Beginner",
        content: `Dear [Name],

I am a BCA final-year student seeking an opportunity as a Software Trainee / Intern.
I have hands-on experience with academic projects and a strong interest in software development.

Please find my resume attached for your review.

Regards,
Bikram Roy
8969640393`,
        tags: ["Personalized", "Direct"]
    },
    {
        title: "Frontend Developer - React/Next.js",
        category: "Job Application",
        difficulty: "Intermediate",
        content: `Hi [Name],

I've been using [Company App] and noticed some UI performance opportunities. 
I am a Frontend Developer specialized in React & Next.js. I recently improved a dashboard's load time by 40% in my last project.

I'd love to solve similar problems for [Company].`,
        tags: ["Technical", "Value-Add"]
    },
    {
        title: "Data Analyst & Visualization",
        category: "Data Science",
        difficulty: "Advanced",
        content: `Dear Hiring Manager,

I analyzed [Company]'s recent growth reports and built a sample visualization dashboard to demonstrate how we could track [Metric] better.
I am a Data Analyst proficient in Python, SQL, and Tableau.

Link to dashboard: [Link]`,
        tags: ["Portfolio", "Proof of Work"]
    },
    {
        title: "Product Designer (UI/UX) Portfolio",
        category: "Design",
        difficulty: "Intermediate",
        content: `Hi [Name],

I noticed your checkout flow has a slight friction point on mobile. I took the liberty of redesigning it to reduce clicks by 30%.
I'm a Product Designer looking to help [Company] improve user retention.

Case study attached.`,
        tags: ["Visual", "Proactive"]
    },
    {
        title: "Backend Engineer - API Optimization",
        category: "Engineering",
        difficulty: "Advanced",
        content: `Hi [CTO Name],

I saw you're scaling your [Service Name].
I am a Backend Engineer (Node/Go) with experience handling high-concurrency systems. I've previously architected APIs serving 10k+ requests/sec.

Would love to discuss your infrastructure challenges.`,
        tags: ["Scalability", "Expert"]
    },
    {
        title: "Marketing & Growth Lead",
        category: "Marketing",
        difficulty: "Intermediate",
        content: `Hello [Name],

I have 3 ideas on how [Company] could lower CAC on LinkedIn ads by targeting [Specific Audience].
I'm a Growth Marketer who loves data-driven experiments.

Can I share a 1-page strategy document with you?`,
        tags: ["Strategy", "Growth"]
    }
]

export default function EmailTemplatesPage() {
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

    const filteredTemplates = selectedCategory === "All"
        ? templates
        : templates.filter(t => t.category === selectedCategory || (selectedCategory === "Job Application" && ["Engineering", "Data Science", "Design"].includes(t.category)))

    const handleCopy = (content: string, index: number) => {
        navigator.clipboard.writeText(content)
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 font-sans relative overflow-hidden">
            {/* --- V3 Aurora Backgrounds --- */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen animate-[pulse_10s_infinite]"></div>
                <div className="absolute top-[20%] right-[-20%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] mix-blend-screen animate-[pulse_15s_infinite]"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[100px] mix-blend-screen animate-[pulse_12s_infinite]"></div>
                {/* Texture Removed to prevent 404 */}
            </div>

            {/* Header */}
            <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium group">
                        <div className="p-1 rounded-md bg-white/5 group-hover:bg-white/10 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        Back to Home
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        <span className="text-xs font-medium text-zinc-400">Premium Library</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
                {/* Hero Section */}
                <div className="text-center mb-16 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, type: "spring" }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-transparent border border-white/10 shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)] mb-4"
                    >
                        <Mail className="w-8 h-8 text-indigo-300 drop-shadow-[0_0_10px_rgba(165,180,252,0.5)]" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-500"
                    >
                        Crafted for Impact.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        Proven templates that potential employers actually read.
                        <br className="hidden md:block" />
                        <span className="text-indigo-400 font-medium"> Zero fluff. 100% Signal.</span>
                    </motion.p>
                </div>

                {/* Categories */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-wrap justify-center gap-2 mb-20"
                >
                    {categories.map((cat, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border backdrop-blur-sm ${selectedCategory === cat
                                ? "bg-indigo-500 text-white border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                                : "bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10 hover:border-white/10 hover:text-white"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </motion.div>

                {/* Templates Grid - V3 Ultra Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {filteredTemplates.map((template, i) => (
                        <motion.div
                            layout
                            key={template.title}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="group relative flex flex-col"
                        >
                            {/* Card Background & Border */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent rounded-[2rem] border border-white/10 group-hover:border-indigo-500/30 transition-colors duration-500 backdrop-blur-md"></div>

                            {/* Hover Glycerin Effect */}
                            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]"></div>

                            <div className="relative z-10 p-6 flex flex-col h-full">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex flex-col gap-1">
                                        <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-400/80">
                                            {template.category}
                                        </div>
                                        <h3 className="text-xl font-bold leading-tight group-hover:text-indigo-200 transition-colors">
                                            {template.title}
                                        </h3>
                                    </div>
                                </div>

                                {/* Email Body - The "Real" Look */}
                                <div className="flex-1 bg-[#0a0a0a] rounded-xl p-5 mb-6 border border-white/5 shadow-inner group-hover:border-white/10 transition-colors relative overflow-hidden">
                                    {/* Subtle top reflection */}
                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10"></div>

                                    <div className="mb-3 pb-3 border-b border-white/5 flex items-center gap-2 opacity-60">
                                        <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
                                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Subject Line</span>
                                    </div>

                                    <div className="text-sm md:text-base text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap opacity-90">
                                        {template.content.length > 200 ? template.content.slice(0, 200) + "..." : template.content}
                                    </div>
                                </div>

                                {/* Footer / Actions */}
                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex flex-wrap gap-2">
                                        {template.tags.map(tag => (
                                            <span key={tag} className="text-[10px] text-zinc-500 font-medium px-2.5 py-1 rounded-full border border-white/5 bg-white/[0.02]">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <Button
                                        size="icon"
                                        variant="default"
                                        onClick={() => handleCopy(template.content, i)}
                                        className="rounded-full w-10 h-10 bg-white/10 text-white hover:bg-indigo-600 hover:scale-105 hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all border border-white/5"
                                    >
                                        {copiedIndex === i ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Call To Action */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-32 relative rounded-[3rem] overflow-hidden border border-white/10 group bg-zinc-900/40"
                >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(79,70,229,0.1),transparent_60%)] group-hover:opacity-100 opacity-50 transition-opacity"></div>
                    <div className="relative z-10 p-12 md:p-20 text-center">
                        <h3 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                            Start your career <span className="text-indigo-400">today.</span>
                        </h3>
                        <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
                            Stop sending emails into the void. Use data-driven templates that actually get read.
                        </p>
                        <Link href="/register">
                            <Button size="lg" className="h-14 px-10 text-base bg-white text-black hover:bg-zinc-200 rounded-full font-bold shadow-2xl hover:scale-105 transition-all">
                                Create My Campaign <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </main>
        </div>
    )
}
