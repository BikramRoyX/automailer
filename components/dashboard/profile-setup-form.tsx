"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, AlertCircle, ArrowRight, CheckCircle2, RotateCcw, Palette, Smartphone, Monitor, Layout } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { saveProfile } from "@/app/actions/profile"

// --- 1. Strict Validation Schema ---
const profileSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    mobile: z.string()
        .regex(/^\+?[0-9\s-]{10,}$/, "Mobile number must be at least 10 digits")
        .transform(val => val.replace(/\s/g, '')),
    experienceLevel: z.string().min(1, "Please select your experience level"),
    preferredField: z.string().min(1, "Please select a preferred field"),
    linkedinUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
})

type ProfileFormValues = z.infer<typeof profileSchema>

// --- 2. Advanced Design System Definition ---
type Theme = {
    name: string
    id: string
    // Layout & Container
    wrapper: string
    container: string
    // Component Styles
    card: string
    header: string
    title: string
    description: string
    inputWrapper: string
    input: string
    label: string
    button: string
    selectTrigger: string
    selectContent: string
    // Visual Accents
    progressBar: string
    iconColor: string
}

const THEMES: Theme[] = [
    {
        name: "Minimal Professional",
        id: "minimal",
        wrapper: "bg-gray-50 text-gray-900 font-sans selection:bg-gray-200",
        container: "max-w-xl mx-auto",
        card: "bg-white border border-gray-200 shadow-sm sm:rounded-xl rounded-none min-h-screen sm:min-h-fit",
        header: "border-b border-gray-100 pb-6 mb-8 px-6 pt-8",
        title: "text-2xl font-semibold text-gray-900 tracking-tight",
        description: "text-gray-500 text-sm mt-1",
        inputWrapper: "space-y-1.5",
        input: "bg-white border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 rounded-lg h-12 text-base transition-all placeholder:text-gray-400",
        label: "text-sm font-medium text-gray-700",
        button: "bg-gray-900 hover:bg-black text-white rounded-lg shadow-sm h-12 font-medium text-base w-full",
        selectTrigger: "bg-white border-gray-300 text-gray-900 rounded-lg h-12",
        selectContent: "bg-white border-gray-200 text-gray-900 shadow-lg rounded-lg",
        progressBar: "bg-gray-900",
        iconColor: "text-gray-900"
    },
    {
        name: "Modern Gradient",
        id: "modern",
        wrapper: "bg-[#050505] text-white font-sans selection:bg-indigo-500/30",
        container: "max-w-2xl mx-auto flex items-center justify-center min-h-screen p-0 sm:p-4",
        card: "bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl sm:rounded-3xl rounded-none w-full border-x-0 border-y-0 sm:border",
        header: "border-b border-white/5 pb-8 mb-8 px-8 pt-10",
        title: "text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent",
        description: "text-gray-400 text-base mt-2 font-light",
        inputWrapper: "space-y-2 group",
        input: "bg-black/40 border-white/10 focus:border-indigo-500 focus:bg-black/60 rounded-xl h-14 text-lg transition-all text-white placeholder:text-gray-600 group-hover:border-white/20",
        label: "text-xs font-bold uppercase tracking-widest text-indigo-300/80 ml-1",
        button: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 h-14 font-bold text-lg w-full transition-transform active:scale-95",
        selectTrigger: "bg-black/40 border-white/10 text-white rounded-xl h-14",
        selectContent: "bg-[#1a1a1b] border-white/10 text-white backdrop-blur-md rounded-xl",
        progressBar: "bg-gradient-to-r from-indigo-500 to-purple-500",
        iconColor: "text-indigo-400"
    },
    {
        name: "Dark Tech",
        id: "tech",
        wrapper: "bg-black text-green-500 font-mono selection:bg-green-500/30",
        container: "max-w-lg mx-auto py-0 sm:py-12",
        card: "bg-black border-x border-y sm:border-2 border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.1)] rounded-none min-h-screen sm:min-h-fit",
        header: "border-b border-green-500/30 pb-4 mb-6 px-6 pt-6 border-dashed",
        title: "text-xl font-bold text-green-500 uppercase tracking-widest flex items-center gap-2 before:content-['>'] before:animate-pulse",
        description: "text-green-500/60 text-xs mt-2",
        inputWrapper: "space-y-1",
        input: "bg-black border-green-500/50 focus:border-green-400 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)] rounded-none transition-none text-green-400 placeholder:text-green-900 border-x-0 border-t-0 border-b-2 h-12 px-0 focus:ring-0",
        label: "text-[10px] font-bold text-green-700 uppercase mb-1 block",
        button: "bg-green-900/10 hover:bg-green-500/20 text-green-500 border border-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] rounded-none h-12 uppercase font-bold tracking-widest w-full transition-all",
        selectTrigger: "bg-black border-green-500/50 text-green-500 rounded-none border-x-0 border-t-0 border-b-2 px-0 h-12 focus:ring-0",
        selectContent: "bg-black border-green-500 text-green-500 rounded-none",
        progressBar: "bg-green-500",
        iconColor: "text-green-500"
    },
    {
        name: "Friendly Card",
        id: "friendly",
        wrapper: "bg-[#FDF6E3] text-[#5D576B] font-sans selection:bg-[#F29559]/30",
        container: "max-w-2xl mx-auto p-4 sm:p-8",
        card: "bg-white border-2 border-[#F4E4BA] shadow-[8px_8px_0px_#F4E4BA] sm:rounded-[32px] rounded-2xl w-full",
        header: "pb-6 mb-4 text-center px-8 pt-10",
        title: "text-4xl font-black text-[#F29559] tracking-tight transform -rotate-1",
        description: "text-[#5D576B] text-lg opacity-80 mt-2 font-medium",
        inputWrapper: "space-y-3",
        input: "bg-[#FDF6E3] border-2 border-transparent focus:border-[#F29559] focus:bg-white rounded-2xl transition-all text-[#5D576B] h-14 px-5 text-lg shadow-inner",
        label: "text-base font-bold text-[#F29559] ml-3",
        button: "bg-[#F29559] hover:bg-[#F2D492] hover:text-[#5D576B] text-white rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,0.1)] h-16 font-black text-xl w-full transform hover:-translate-y-1 transition-transform active:translate-y-0 active:shadow-none",
        selectTrigger: "bg-[#FDF6E3] border-none text-[#5D576B] rounded-2xl h-14 px-5 text-lg",
        selectContent: "bg-white border-2 border-[#F4E4BA] text-[#5D576B] rounded-xl shadow-xl",
        progressBar: "bg-[#F29559]",
        iconColor: "text-[#F29559]"
    }
]

interface ProfileSetupFormProps {
    onComplete: () => void
}

export function ProfileSetupForm({ onComplete }: ProfileSetupFormProps) {
    const [currentThemeIndex, setCurrentThemeIndex] = useState(1) // Default to Modern
    const [isSubmitting, setIsSubmitting] = useState(false)
    const activeTheme = useMemo(() => THEMES[currentThemeIndex], [currentThemeIndex])

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        mode: "onChange",
        defaultValues: {
            fullName: "",
            mobile: "",
            experienceLevel: "",
            preferredField: "",
            linkedinUrl: ""
        }
    })

    const { register, handleSubmit, formState: { errors, isValid }, setFocus, watch, setValue } = form

    // --- 3. Switch Design Logic ---
    const switchTheme = useCallback(() => {
        setCurrentThemeIndex((prev) => (prev + 1) % THEMES.length)
    }, [])

    // --- 4. Auto-Suggest Logic ---
    const experienceLevel = watch("experienceLevel")
    const preferredField = watch("preferredField")

    useEffect(() => {
        // Example: Auto-suggest or just log potential role
        // In a real app, this could set a 'role' field. 
        // Here we just ensure smart defaults if allowed.
        if (experienceLevel === "Internship" && !preferredField) {
            // Optional: could auto-focus preferred field
        }
    }, [experienceLevel, preferredField])

    // --- 5. UX Intelligence: Auto-Focus & Scroll ---
    const onError = useCallback((errors: any) => {
        const firstErrorKey = Object.keys(errors)[0]
        if (firstErrorKey) {
            const element = document.getElementById(`field-${firstErrorKey}`)
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" })
                element.animate([
                    { transform: 'translateX(0)' },
                    { transform: 'translateX(-4px)' },
                    { transform: 'translateX(4px)' },
                    { transform: 'translateX(0)' }
                ], { duration: 300 })
                setFocus(firstErrorKey as any)
            }
        }
    }, [setFocus])

    const onSubmit = async (data: ProfileFormValues) => {
        setIsSubmitting(true)
        try {
            const res = await saveProfile(data)
            if (res.success) {
                onComplete()
            } else {
                console.error(res.message)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Helper for rendering error messages consistently
    const ErrorMessage = ({ message }: { message?: string }) => (
        <AnimatePresence mode="wait">
            {message && (
                <motion.p
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-xs flex items-center gap-1.5 mt-1.5 font-medium ml-1"
                >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{message}</span>
                </motion.p>
            )}
        </AnimatePresence>
    )

    return (
        <div className={cn("min-h-screen w-full transition-colors duration-700 ease-in-out flex flex-col", activeTheme.wrapper)}>

            {/* Sticky/Floating Design Switcher */}
            <header className="sticky top-0 z-50 p-4 flex justify-end pointer-events-none">
                <Button
                    onClick={switchTheme}
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "pointer-events-auto transition-all hover:scale-105 gap-2 backdrop-blur-xl shadow-lg border",
                        activeTheme.id === 'minimal' ? "bg-white text-black border-gray-200" :
                            activeTheme.id === 'modern' ? "bg-white/10 text-white border-white/20" :
                                activeTheme.id === 'tech' ? "bg-black text-green-500 border-green-500" :
                                    "bg-[#F29559] text-white border-none"
                    )}
                >
                    <Palette className="w-4 h-4" />
                    <span className="hidden sm:inline font-medium">Theme: {activeTheme.name}</span>
                </Button>
            </header>

            <div className={cn("flex-1 flex items-center w-full px-0 sm:px-4 pb-0 sm:pb-8", activeTheme.container)}>
                <motion.div
                    key={activeTheme.id}
                    initial={{ opacity: 0, y: 10, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className={cn("w-full relative overflow-hidden flex flex-col", activeTheme.card)}
                >

                    {/* Progress Bar */}
                    <div className={cn("absolute top-0 left-0 h-1.5 w-full opacity-30 origin-left", activeTheme.progressBar)} />

                    <div className={activeTheme.header}>
                        <h2 className={activeTheme.title}>Setup Profile</h2>
                        <p className={activeTheme.description}>
                            Let's auto-configure your assistant.
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-8 pt-0 custom-scrollbar">
                        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6 sm:space-y-8">

                            {/* Full Name */}
                            <div className={activeTheme.inputWrapper} id="field-fullName">
                                <Label className={activeTheme.label}>Full Name</Label>
                                <Input
                                    {...register("fullName")}
                                    className={cn(activeTheme.input, errors.fullName && "border-red-500 ring-1 ring-red-500/50")}
                                    placeholder="e.g. Jane Doe"
                                    autoComplete="name"
                                />
                                <ErrorMessage message={errors.fullName?.message} />
                            </div>

                            {/* Mobile */}
                            <div className={activeTheme.inputWrapper} id="field-mobile">
                                <Label className={activeTheme.label}>Mobile Number</Label>
                                <div className="relative">
                                    <Input
                                        {...register("mobile")}
                                        className={cn(activeTheme.input, errors.mobile && "border-red-500 ring-1 ring-red-500/50")}
                                        placeholder="+1 234 567 8900"
                                        type="tel"
                                        autoComplete="tel"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none">
                                        <Smartphone className={cn("w-4 h-4", activeTheme.iconColor)} />
                                    </div>
                                </div>
                                <ErrorMessage message={errors.mobile?.message} />
                            </div>

                            {/* Responsive Grid for Selectors */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                {/* Experience Level */}
                                <div className={activeTheme.inputWrapper} id="field-experienceLevel">
                                    <Label className={activeTheme.label}>Experience</Label>
                                    <Select onValueChange={(val) => setValue("experienceLevel", val, { shouldValidate: true })}>
                                        <SelectTrigger className={cn(activeTheme.selectTrigger, errors.experienceLevel && "border-red-500 ring-1 ring-red-500/50")}>
                                            <SelectValue placeholder="Select Level" />
                                        </SelectTrigger>
                                        <SelectContent className={activeTheme.selectContent}>
                                            <SelectItem value="Internship">Internship</SelectItem>
                                            <SelectItem value="Fresher">Fresher</SelectItem>
                                            <SelectItem value="Entry-Level">Entry-Level</SelectItem>
                                            <SelectItem value="Experienced">Experienced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <ErrorMessage message={errors.experienceLevel?.message} />
                                </div>

                                {/* Preferred Field */}
                                <div className={activeTheme.inputWrapper} id="field-preferredField">
                                    <Label className={activeTheme.label}>Target Role</Label>
                                    <Select onValueChange={(val) => setValue("preferredField", val, { shouldValidate: true })}>
                                        <SelectTrigger className={cn(activeTheme.selectTrigger, errors.preferredField && "border-red-500 ring-1 ring-red-500/50")}>
                                            <SelectValue placeholder="Select Field" />
                                        </SelectTrigger>
                                        <SelectContent className={activeTheme.selectContent}>
                                            <SelectItem value="Frontend">Frontend Dev</SelectItem>
                                            <SelectItem value="Backend">Backend Dev</SelectItem>
                                            <SelectItem value="Fullstack">Fullstack Dev</SelectItem>
                                            <SelectItem value="Data Science">Data Science</SelectItem>
                                            <SelectItem value="Product Design">Product Design</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <ErrorMessage message={errors.preferredField?.message} />
                                </div>
                            </div>

                            {/* Submit Button Area */}
                            <div className="pt-4 sm:pt-6 pb-2">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !isValid}
                                    className={cn(
                                        activeTheme.button,
                                        !isValid && "opacity-50 cursor-not-allowed grayscale"
                                    )}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Continue <ArrowRight className="w-5 h-5" />
                                        </span>
                                    )}
                                </Button>

                                <div className={cn("text-center mt-4 transition-opacity duration-300", !isValid ? "opacity-100" : "opacity-0")}>
                                    <p className={cn("text-[10px] uppercase tracking-wider font-semibold opacity-60", activeTheme.description?.split(" ")[0])}>
                                        Fill all required fields
                                    </p>
                                </div>
                            </div>

                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
