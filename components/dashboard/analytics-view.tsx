"use client"

import { useState, useEffect, useRef } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, Send, AlertOctagon, Calendar, ArrowUpRight, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function AnalyticsView() {
    const [filterDays, setFilterDays] = useState("30")
    // Real-time fetching using SWR
    const fetcher = (url: string) => fetch(url).then(async res => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    })

    const { data, error, isLoading } = useSWR(`/api/analytics?days=${filterDays}`, fetcher, {
        refreshInterval: 5000,
        revalidateOnFocus: true
    })

    // Limit Notification Logic
    const hasNotifiedLimit = useRef(false)

    useEffect(() => {
        if (data?.limits) {
            const { used, total } = data.limits
            if (used >= total && !hasNotifiedLimit.current) {
                toast.error("Daily Limit Reached", {
                    description: `You have sent ${used} of ${total} emails today. The agent has paused safely.`,
                    duration: 8000,
                    icon: <AlertOctagon className="w-5 h-5 text-red-500" />
                })
                hasNotifiedLimit.current = true
            } else if (used < total) {
                // Reset if limit is increased or new day
                hasNotifiedLimit.current = false
            }
        }
    }, [data])

    if (isLoading && !data) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        )
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500 space-y-4">
                <AlertOctagon className="w-12 h-12 opacity-20" />
                <p>Unable to load analytics data.</p>
                <div className="text-xs opacity-50">Please check your internet or try again later.</div>
            </div>
        )
    }

    const { metrics, roles, chart, limits } = data

    // Format chart data for Recharts
    const chartData = chart.map((d: any) => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: d.date,
        sent: d.count
    }))

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Header + Filter */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                    <Activity className="w-6 h-6 text-indigo-400" /> Performance Analytics
                </h2>
                <div className="flex items-center gap-2">
                    {/* Limit Indicator */}
                    {limits && (
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-full text-xs font-medium mr-2">
                            <span className={limits.used >= limits.total ? "text-red-400" : "text-green-400"}>
                                {limits.used} / {limits.total}
                            </span>
                            <span className="text-zinc-500">daily limit</span>
                        </div>
                    )}

                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <Select value={filterDays} onValueChange={setFilterDays}>
                        <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-700 text-white shadow-sm hover:bg-zinc-800 transition-colors">
                            <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-700 z-50 text-white">
                            <SelectItem value="7" className="focus:bg-zinc-800 focus:text-white cursor-pointer">Last 7 Days</SelectItem>
                            <SelectItem value="30" className="focus:bg-zinc-800 focus:text-white cursor-pointer">Last 30 Days</SelectItem>
                            <SelectItem value="90" className="focus:bg-zinc-800 focus:text-white cursor-pointer">Last 3 Months</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>


            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-[#0F0F10] border-white/10 group hover:border-indigo-500/30 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Sent</CardTitle>
                        <Send className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{metrics.sent.toLocaleString()}</div>
                        <p className="text-xs text-zinc-500 mt-1">
                            outreach emails dispatched
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-[#0F0F10] border-white/10 group hover:border-green-500/30 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Valid HR List</CardTitle>
                        <Users className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{metrics.validContacts.toLocaleString()}</div>
                        <p className="text-xs text-green-500 mt-1">fresh contacts ready</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#0F0F10] border-white/10 group hover:border-red-500/30 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Bounced</CardTitle>
                        <AlertOctagon className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{metrics.bounced}</div>
                        <p className="text-xs text-zinc-500 mt-1">{(metrics.bounced / (metrics.sent || 1) * 100).toFixed(1)}% bounce rate</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#0F0F10] border-white/10 group hover:border-purple-500/30 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Reply Count</CardTitle>
                        <ArrowUpRight className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{metrics.replies}</div>
                        <p className="text-xs text-zinc-500 mt-1">responses received</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Sending Activity Chart */}
                <Card className="lg:col-span-2 bg-[#0F0F10] border-white/10">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-white flex gap-2">
                            <Activity className="w-4 h-4 text-indigo-400" /> Sending Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#666"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#666"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#ffffff10' }}
                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                        labelStyle={{ color: '#a1a1aa' }}
                                    />
                                    <Bar
                                        dataKey="sent"
                                        fill="#6366f1"
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={50}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Role Breakdown */}
                <Card className="bg-[#0F0F10] border-white/10">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-white flex gap-2">
                            <Users className="w-4 h-4 text-purple-400" /> Positions Applied
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {roles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-zinc-500">
                                <Users className="w-8 h-8 mb-2 opacity-20" />
                                <p className="text-xs">No role data available yet.</p>
                            </div>
                        ) : (
                            roles.map((role: any, idx: number) => {
                                const total = roles.reduce((acc: number, r: any) => acc + r.count, 0)
                                const percentage = Math.round((role.count / total) * 100)
                                const colors = ["bg-indigo-500", "bg-purple-500", "bg-pink-500", "bg-blue-500", "bg-emerald-500"]

                                return (
                                    <div key={role.name} className="space-y-2 group">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-zinc-200 font-medium group-hover:text-white transition-colors">
                                                {role.name}
                                            </span>
                                            <span className="text-zinc-500 tabular-nums">
                                                {role.count} <span className="text-zinc-600 ml-1">({percentage}%)</span>
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${colors[idx % colors.length]} transition-all duration-500 ease-out`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Bounce Activity (New Section) */}
            <Card className="bg-[#0F0F10] border-white/10">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-white flex gap-2">
                        <AlertOctagon className="w-4 h-4 text-red-500" /> Recent Bounce Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!data.recentBounces || data.recentBounces.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-zinc-500">
                            <AlertOctagon className="w-8 h-8 mb-2 opacity-20" />
                            <p className="text-xs">No bounce data recorded.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-zinc-500 uppercase border-b border-white/10">
                                    <tr>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Reason</th>
                                        <th className="px-4 py-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="text-zinc-300">
                                    {data.recentBounces.map((bounce: any, i: number) => (
                                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 font-medium text-white">{bounce.email}</td>
                                            <td className="px-4 py-3 text-red-400 font-mono text-xs truncate max-w-[200px]" title={bounce.reason}>
                                                {bounce.reason || "Unknown"}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-500">
                                                {new Date(bounce.lastBouncedAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
