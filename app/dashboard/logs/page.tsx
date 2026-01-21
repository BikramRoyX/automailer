"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, RefreshCcw } from "lucide-react" // Import icons
import { Button } from "@/components/ui/button"

interface Log {
    id: string
    type: string
    message: string
    timestamp: string
}

export default function LogsPage() {
    const [logs, setLogs] = useState<Log[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchLogs = async () => {
        try {
            setRefreshing(true)
            const res = await fetch("/api/logs")
            if (res.ok) {
                const data = await res.json()
                setLogs(data)
            }
        } catch (error) {
            console.error("Failed to fetch logs", error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchLogs()
        // Poll every 3 seconds for "live" feel
        const interval = setInterval(fetchLogs, 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Activity Logs</h1>
                <Button variant="outline" size="sm" onClick={fetchLogs} disabled={refreshing} className="border-white/10 text-zinc-400 hover:text-white hover:bg-white/10">
                    <RefreshCcw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            <Card className="bg-[#0a0a0a] border-white/10">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Live Events
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-hidden rounded-md border border-white/5">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="hover:bg-transparent border-white/5">
                                    <TableHead className="text-zinc-400">Type</TableHead>
                                    <TableHead className="text-zinc-400">Message</TableHead>
                                    <TableHead className="text-right text-zinc-400">Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            <div className="flex justify-center items-center gap-2 text-zinc-500">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Loading activity...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center text-zinc-500">
                                            No activity recorded yet. Start a campaign!
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id} className="border-white/5 hover:bg-white/[0.02] bg-[#0a0a0a]">
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border
                                    ${log.type === "email_sent" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                        log.type === "error" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                            log.type === "success" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                                                                "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"}`}
                                                >
                                                    {log.type === 'email_sent' ? 'Email Sent' : log.type?.replace("_", " ")}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-zinc-300 font-mono text-xs">{log.message}</TableCell>
                                            <TableCell className="text-right text-zinc-500 text-xs tabular-nums">
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
