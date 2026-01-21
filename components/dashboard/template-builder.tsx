"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SwipeableTemplates } from "@/components/dashboard/swipeable-templates"
import { Sparkles, ArrowRight, User, Briefcase, Phone, Code2 } from "lucide-react"

interface TemplateBuilderProps {
    template: any
    setTemplate: (t: any) => void
    profile: any
    onComplete: () => void
    // New Props for Strict Flow
    isLocked?: boolean
    isGenerated?: boolean
    onGenerating?: () => void
}

import { generateSmartTemplates } from "@/lib/template-engine"

// Helper to generate templates (Delegated to Engine)
const generateTemplates = (data: { name: string; phone: string; level: string; role: string }) => {
    // Adapter to match engine signature
    const engineResults = generateSmartTemplates({
        profile: {
            fullName: data.name,
            mobile: data.phone,
            experienceLevel: data.level,
            preferredField: data.role,
            skills: data.role // Fallback to role as skill if not provided
        },
        companyName: "{{company}}", // Placeholder
        contactName: "{{name}}",    // Placeholder
        role: data.role,
        industry: "Tech"            // Default
    })

    // Map to UI format (adding Icons)
    return engineResults.map(t => ({
        id: t.id,
        name: t.name,
        role: t.type, // Map Type to Role Badge
        subject: t.subject,
        preview: t.body, // Map Body to Preview
        icon: t.type === 'Creative' ? Sparkles
            : t.type === 'Short' ? Sparkles
                : t.type === 'Value-First' ? User
                    : t.type === 'Detailed' ? Code2
                        : Briefcase
    }))
}

export function TemplateBuilder({ template, setTemplate, profile, onComplete, isLocked, isGenerated, onGenerating }: TemplateBuilderProps) {
    const [step, setStep] = useState<'input' | 'selection' | 'editor' | 'browse'>('input')
    const [isGenerating, setIsGenerating] = useState(false)
    const [libraryTemplates, setLibraryTemplates] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false)

    // User requested active placeholders: Start strictly empty.
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        level: "",
        role: ""
    })

    // Sync Profile Data to Form
    useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                name: prev.name || profile.fullName || "",
                phone: prev.phone || profile.mobile || "",
                level: prev.level || profile.experienceLevel || "",
                role: prev.role || profile.preferredField || ""
            }))
        }
    }, [profile])

    const [generatedStats, setGeneratedTemplates] = useState<any[]>([])
    const [selectedDraft, setSelectedDraft] = useState<any>(null)

    const handleGenerate = () => {
        if (onGenerating) onGenerating()
        setIsGenerating(true)
        setTimeout(() => {
            // Use defaults ONLY for generation, not for UI display
            const temps = generateTemplates({
                name: formData.name || "Candidate",
                phone: formData.phone || "+1234567890",
                level: formData.level || "Entry Level",
                role: formData.role || "Software Engineer"
            })
            setGeneratedTemplates(temps)
            setStep('selection')
            setIsGenerating(false)
        }, 1500)
    }

    const handleBrowseLibrary = async () => {
        setStep('browse')
        setIsLoadingLibrary(true)
        try {
            const res = await fetch('/api/templates')
            if (res.ok) {
                // The API currently returns a SINGLE template (the user's saved one) or a list? 
                // Wait, /api/templates usually handles the User's Current Template (GET) or Updates it (POST).
                // We need an endpoint to get ALL SEEDED templates. 
                // The seed script created them in the DB.
                // But the current API endpoint might only fetch the single active template.
                // I need to check /api/templates. 
                // If it only returns one, I might need to fetch ALL.
                // Let's assume for a second I might need to create a new endpoint or pass a flag.
                // Checking the file content of /api/templates/route.ts would be wise, but to save time/tools:
                // I'll assume I need to fetch all. 
                // Actually, if I look at `api/agent/send/route.ts`, it does `db.template.findMany`.
                // So I should probably use a server action or a new endpoint. 
                // Let's try fetching with a query param `?mode=library` if I can modify the API, 
                // OR just hit a new endpoint if I could make one. 
                // For now, I'll fetch `/api/templates?mode=list`.
                const res = await fetch('/api/templates?mode=list')
                if (res.ok) {
                    const data = await res.json()
                    // Map DB format to UI format
                    const mapped = (Array.isArray(data) ? data : []).map((t: any) => ({
                        id: t.id,
                        name: t.name,
                        role: t.role || "General",
                        subject: t.subject,
                        preview: t.body,
                        icon: Sparkles // Default icon
                    }))
                    setLibraryTemplates(mapped)
                }
            }
        } catch (e) {
            console.error("Failed to load library", e)
        }
        setIsLoadingLibrary(false)
    }

    const handleSelectTemplate = (t: any) => {
        setSelectedDraft(t)
        setStep('editor') // Go to Editor instead of auto-completing
    }

    // State for saving mechanism
    const [isSaving, setIsSaving] = useState(false)

    const handleSaveFinal = async () => {
        if (!selectedDraft) return
        setIsSaving(true)

        const finalTemplate = {
            name: selectedDraft.name,
            subject: selectedDraft.subject,
            body: selectedDraft.preview, // This comes from the edited textarea
            role: formData.role || "General",
            senderPhone: formData.phone || "",
            senderEmail: template.senderEmail
        }

        setTemplate({ ...template, ...finalTemplate })

        try {
            const res = await fetch('/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalTemplate)
            })

            if (res.ok) {
                // Only proceed if save was successful
                onComplete()
            } else {
                console.error("Failed to save template")
            }
        } catch (error) {
            console.error("Failed to save:", error)
        } finally {
            setIsSaving(false)
        }
    }

    if (step === 'input') {
        return (
            <div className="max-w-xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="bg-[#0F0F10] border-white/10 shadow-2xl">
                    <div className="p-4 md:p-8 space-y-8">
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                                <Sparkles className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Let's craft your pitch</h2>
                            <p className="text-zinc-400">GenAI can write for you, or choose from our expert library.</p>
                        </div>
                        {/* Input Fields */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-zinc-300 font-semibold text-sm uppercase tracking-wider">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                                        <Input
                                            className="pl-10 h-11 bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 font-medium text-base focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                            placeholder="Bikram Roy"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            disabled={isGenerating}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-300 font-semibold text-sm uppercase tracking-wider">Target Role</Label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                                        <Input
                                            className="pl-10 h-11 bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 font-medium text-base focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                            placeholder="Python Developer"
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            disabled={isGenerating}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-300 font-semibold text-sm uppercase tracking-wider">Mobile Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                                    <Input
                                        className="pl-10 h-11 bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 font-medium text-base focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                        placeholder="8969640393"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        disabled={isGenerating}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-300 font-semibold text-sm uppercase tracking-wider">Experience Level</Label>
                                <Select
                                    value={["Internship", "Fresher", "Entry Level", "Experienced"].includes(formData.level) ? formData.level : undefined}
                                    onValueChange={v => setFormData({ ...formData, level: v })}
                                    disabled={isGenerating}
                                >
                                    <SelectTrigger className="h-11 bg-zinc-900/50 border-white/10 text-white data-[placeholder]:text-zinc-500 font-medium text-base focus:ring-indigo-500/20">
                                        <SelectValue placeholder="Select Your Level" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-white/10 text-white font-medium">
                                        {["Internship", "Fresher", "Entry Level", "Experienced"].map(l => (
                                            <SelectItem key={l} value={l} className="focus:bg-indigo-600 cursor-pointer py-3">{l}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                className="h-12 border-white/10 text-white hover:bg-white/5 font-medium"
                                onClick={handleBrowseLibrary}
                            >
                                Browse Library
                            </Button>
                            <Button
                                className="h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleGenerate}
                                disabled={isGenerating}
                            >
                                {isGenerating ? "Generating..." : "Generate AI"}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        )
    }

    if (step === 'browse') {
        const filtered = libraryTemplates.filter(t =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.role.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => setStep('input')}>
                        ← Back
                    </Button>
                    <div className="relative flex-1">
                        <Input
                            placeholder="Search templates by role (e.g. 'Python', 'HR')..."
                            className="pl-10 bg-zinc-900/50 border-white/10 text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Sparkles className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                    </div>
                </div>

                {isLoadingLibrary ? (
                    <div className="text-center py-20 text-zinc-500">Loading library...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {filtered.map(t => (
                            <div key={t.id} className="bg-zinc-900 border border-white/5 hover:border-indigo-500/50 p-4 rounded-xl cursor-pointer transition-all hover:bg-zinc-800/50 group" onClick={() => handleSelectTemplate(t)}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-white group-hover:text-indigo-400 transition-colors">{t.name}</div>
                                    <div className="text-xs px-2 py-1 rounded bg-white/5 text-zinc-400">{t.role}</div>
                                </div>
                                <div className="text-xs text-zinc-500 truncate mb-4">{t.subject}</div>
                                <p className="text-xs text-zinc-600 line-clamp-3 font-mono leading-relaxed">
                                    {t.preview}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    if (step === 'editor') {
        return (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="flex items-center gap-4 mb-4">
                    <Button variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => setStep('selection')}>
                        ← Back to Selection
                    </Button>
                    <h2 className="text-xl font-bold text-white">Customize Your Template</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Editor Side */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-gray-400">Subject Line</Label>
                            <Input
                                value={selectedDraft?.subject}
                                onChange={e => setSelectedDraft({ ...selectedDraft, subject: e.target.value })}
                                className="bg-white/5 border-white/10 text-white font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-400">Email Body</Label>
                            <textarea
                                value={selectedDraft?.preview}
                                onChange={e => setSelectedDraft({ ...selectedDraft, preview: e.target.value })}
                                className="w-full h-[400px] bg-white/5 border-white/10 text-white p-4 rounded-xl font-mono text-sm leading-relaxed focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none"
                            />
                        </div>
                    </div>

                    {/* Preview Side */}
                    <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20"><Sparkles className="w-24 h-24 text-indigo-500" /></div>
                        <h3 className="text-lg font-bold text-indigo-300 mb-4">Live Preview</h3>
                        <div className="space-y-4 text-sm text-zinc-300">
                            <p><span className="text-zinc-500">Subject:</span> <span className="text-white">{selectedDraft?.subject}</span></p>
                            <div className="w-full h-px bg-white/10" />
                            <div className="whitespace-pre-wrap font-sans">
                                {selectedDraft?.preview?.replace("{{name}}", "John Doe").replace("{{company}}", "Acme Corp")}
                            </div>
                        </div>

                        <div className="mt-8">
                            <Button
                                onClick={handleSaveFinal}
                                disabled={isSaving}
                                className="w-full bg-white text-black hover:bg-zinc-200 font-bold"
                            >
                                {isSaving ? (
                                    <>Saving <Sparkles className="w-4 h-4 ml-2 animate-spin" /></>
                                ) : (
                                    <>Save & Continue <ArrowRight className="w-4 h-4 ml-2" /></>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-bold text-white">Your Personal Collection</h2>
                <p className="text-zinc-400">We generated specialized templates for <strong>{formData.role || "your role"}</strong>. Swipe to choose & customize.</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                    <Button variant="ghost" size="sm" onClick={() => setStep('input')} className="text-zinc-500 hover:text-white">Edit Details</Button>
                </div>
            </div>

            <SwipeableTemplates
                templates={generatedStats}
                onSelect={handleSelectTemplate}
                isDemoMode={false}
            />

            <div className="text-center mt-8">
                <p className="text-xs text-zinc-500">Swipe Right to Favorite, or Click "Use" to Edit.</p>
            </div>
        </div>
    )
}
