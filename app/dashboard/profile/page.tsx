"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import {
    Mail,
    Zap,
    Calendar,
    ShieldCheck,
    TrendingUp,
    User,
    Briefcase,
    CheckCircle2,
    XCircle,
    Save,
    X,
    Loader2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
    const { data: session, update: updateSession, status } = useSession()
    const [analytics, setAnalytics] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Profile Editing State
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [profileData, setProfileData] = useState({
        fullName: "",
        mobile: "",
        preferredField: "",
        experienceLevel: "",
        bio: "",
        linkedinUrl: "",
        portfolioUrl: ""
    })

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // Fetch Analytics & Profile Data in parallel
                const [analyticsRes, profileRes] = await Promise.all([
                    fetch("/api/analytics"),
                    fetch("/api/profile")
                ])

                const analyticsData = await analyticsRes.json()
                const profileData = await profileRes.json()

                setAnalytics(analyticsData)
                setProfileData({
                    fullName: profileData.fullName || session?.user?.name || "",
                    mobile: profileData.mobile || "",
                    preferredField: profileData.preferredField || "Software Engineering",
                    experienceLevel: profileData.experienceLevel || "Mid Level",
                    bio: profileData.bio || "",
                    linkedinUrl: profileData.linkedinUrl || "",
                    portfolioUrl: profileData.portfolioUrl || ""
                })
            } catch (e) {
                console.error("Failed to fetch data", e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [session])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const res = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profileData)
            })

            if (res.ok) {
                setIsEditing(false)
                // Optionally trigger session update if name changed
                if (profileData.fullName !== session?.user?.name) {
                    await updateSession({ name: profileData.fullName })
                }
            }
        } catch (e) {
            console.error("Failed to save profile", e)
        } finally {
            setIsSaving(false)
        }
    }

    const fallbackImage = `https://ui-avatars.com/api/?name=${session?.user?.name || "User"}&background=random`
    const dailyLimit = session?.user?.dailyLimit || 50
    // Calculate quotas
    const todayStr = new Date().toISOString().split('T')[0]
    const todayChartData = analytics?.chart?.find((d: any) => d.date === todayStr)
    const estimatedToday = todayChartData?.count || 0
    const limitPercentage = Math.min((estimatedToday / dailyLimit) * 100, 100)

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-7xl mx-auto space-y-8 pb-20"
        >
            {/* HERO SECTION */}
            <motion.div variants={item} className="relative rounded-3xl overflow-hidden min-h-[280px] bg-zinc-900 border border-white/5 shadow-2xl">
                {/* Mesh Gradient Background */}
                <div className="absolute inset-0 bg-[#0F0F10]">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 mix-blend-screen" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3 mix-blend-screen" />
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" /> {/* Texture if available, else hidden */}
                </div>

                <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center md:items-end gap-8 h-full">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-indigo-500 to-purple-500 shadow-xl">
                            <img
                                src={session?.user?.image || fallbackImage}
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover border-4 border-[#0F0F10]"
                            />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-[#0F0F10] p-1.5 rounded-full">
                            <div className="bg-green-500 w-4 h-4 rounded-full border-2 border-[#0F0F10]" />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                                {profileData.fullName || session?.user?.name || "AutoMailer User"}
                            </h1>
                            <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 border-0 text-white font-bold tracking-wider px-3 py-1 text-xs">
                                PRO
                            </Badge>
                        </div>
                        <p className="text-zinc-400 text-lg flex items-center justify-center md:justify-start gap-2">
                            <Mail className="w-4 h-4" /> {session?.user?.email}
                        </p>
                        <div className="flex items-center justify-center md:justify-start gap-4 pt-2 text-sm text-zinc-500">
                            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined Jan 2026</span>
                            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-green-500" /> Verified</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[200px]">
                        {/* Optional CTA or Status */}
                        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Plan Usage</span>
                                <span className="text-xs font-mono text-white">{estimatedToday}/{dailyLimit}</span>
                            </div>
                            <Progress value={limitPercentage} className="h-2 bg-white/10" indicatorClassName="bg-gradient-to-r from-indigo-500 to-purple-500" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* KEY METRICS GRID */}
            <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    title="Total Outreach"
                    value={analytics?.metrics?.sent || 0}
                    icon={Mail}
                    trend="+12% this week"
                    color="text-indigo-400"
                    loading={loading}
                />
                <MetricCard
                    title="Response Rate"
                    value={`${analytics?.metrics?.successRate || 0}%`}
                    icon={TrendingUp}
                    trend="Top 5% of users"
                    color="text-green-400"
                    loading={loading}
                />
                <MetricCard
                    title="Daily Credits"
                    value={dailyLimit - estimatedToday}
                    subtitle={`of ${dailyLimit} remaining`}
                    icon={Zap}
                    color="text-yellow-400"
                    loading={loading}
                />
            </motion.div>

            {/* CONTENT SPLIT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ACTIVITY TIMELINE (Left 2/3) */}
                <motion.div variants={item} className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-indigo-500" /> Recent Activity
                        </h2>
                    </div>

                    <div className="bg-[#0F0F10]/50 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm relative">
                        {loading ? (
                            <div className="space-y-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex gap-4">
                                        <Skeleton className="w-12 h-12 rounded-full" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : analytics?.recentLogs?.length > 0 ? (
                            <div className="relative space-y-8 pl-4">
                                {/* Timeline Vertical Line */}
                                <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-white/5" />

                                {analytics.recentLogs.map((log: any, idx: number) => (
                                    <div key={log.id} className="relative flex gap-6 group">
                                        <div className={cn(
                                            "relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 shadow-lg",
                                            "bg-[#1A1A1C] border-white/5 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10"
                                        )}>
                                            <Mail className="w-6 h-6 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                                        </div>
                                        <div className="flex-1 py-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-zinc-200 font-medium text-base group-hover:text-white transition-colors">
                                                    Application Sent
                                                </h3>
                                                <span className="text-xs font-mono text-zinc-500">
                                                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                                                {log.message}
                                            </p>
                                            {log.appliedRole && (
                                                <div className="mt-3 flex items-center gap-2">
                                                    <Badge variant="secondary" className="bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10 hover:text-indigo-300 transition-colors">
                                                        {log.appliedRole}
                                                    </Badge>
                                                    <span className="text-xs text-green-500 flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> Delivered
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-8 h-8 text-zinc-700" />
                                </div>
                                <h3 className="text-zinc-300 font-medium">No activity yet</h3>
                                <p className="text-zinc-500 text-sm mt-2">Start a campaign to see your timeline populate.</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* PROFILE SIDEBAR (Right 1/3) */}
                <motion.div variants={item} className="space-y-6">
                    <div className="bg-[#0F0F10]/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <User className="w-5 h-5 text-purple-500" /> Profile Details
                            </h3>
                            {isEditing && (
                                <Badge variant="outline" className="text-yellow-400 border-yellow-500/50 bg-yellow-500/10">Editing</Badge>
                            )}
                        </div>

                        <div className="space-y-6">
                            <ProfileField
                                label="Full Name"
                                value={profileData.fullName}
                                isEditing={isEditing}
                                onChange={(v) => setProfileData({ ...profileData, fullName: v })}
                            />
                            <ProfileField
                                label="Email Address"
                                value={session?.user?.email || "Not set"}
                                isEditing={false} // Email locked
                            />
                            <ProfileField
                                label="Phone Number"
                                value={profileData.mobile}
                                placeholder="+1 (555) 000-0000"
                                isEditing={isEditing}
                                onChange={(v) => setProfileData({ ...profileData, mobile: v })}
                            />
                            <ProfileField
                                label="Target Role"
                                value={profileData.preferredField}
                                placeholder="e.g. Software Engineer"
                                isEditing={isEditing}
                                onChange={(v) => setProfileData({ ...profileData, preferredField: v })}
                            />
                            <ProfileField
                                label="Experience Level"
                                value={profileData.experienceLevel}
                                placeholder="e.g. Senior (5+ Yrs)"
                                isEditing={isEditing}
                                onChange={(v) => setProfileData({ ...profileData, experienceLevel: v })}
                            />
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 flex gap-3">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-400 text-sm font-medium hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <X className="w-4 h-4" /> Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex-1 py-3 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full py-3 rounded-xl bg-white/5 text-zinc-400 text-sm font-medium hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    Edit Profile Information
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-white mb-2">Upgrade to Expert</h3>
                            <p className="text-indigo-200/70 text-sm mb-4">Get unlimited daily emails, priority support, and advanced AI template customization.</p>
                            <button disabled className="w-full bg-indigo-500/10 border border-indigo-500/50 text-indigo-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-not-allowed group">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                <span className="group-hover:text-indigo-200 transition-colors">Coming Soon</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}

function MetricCard({ title, value, icon: Icon, trend, color, subtitle, loading }: any) {
    if (loading) return <Skeleton className="h-32 w-full rounded-3xl bg-white/5" />

    return (
        <div className="bg-[#0F0F10]/50 border border-white/5 rounded-3xl p-6 backdrop-blur-md hover:border-white/10 transition-colors group">
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors", color.replace('text-', 'bg-').replace('400', '500/20'))}>
                    <Icon className={cn("w-6 h-6", color)} />
                </div>
                {trend && <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">{trend}</span>}
            </div>
            <div>
                <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
                <div className="text-sm text-zinc-500 mt-1 font-medium">{subtitle || title}</div>
            </div>
        </div>
    )
}

function ProfileField({ label, value, isEditing, onChange, placeholder }: { label: string, value: string, isEditing?: boolean, onChange?: (val: string) => void, placeholder?: string }) {
    return (
        <div className="group">
            <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider block mb-1 group-hover:text-indigo-400 transition-colors">{label}</label>
            {isEditing ? (
                <Input
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    placeholder={placeholder}
                    className="bg-black/20 border-white/10 text-white h-9 text-sm focus:border-indigo-500/50"
                />
            ) : (
                <div className="text-zinc-200 font-medium border-b border-transparent group-hover:border-white/10 pb-1 transition-all h-9 flex items-center">
                    {value || <span className="text-zinc-600 italic">Not set</span>}
                </div>
            )}
        </div>
    )
}
