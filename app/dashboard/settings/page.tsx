"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Loader2, CheckCircle2, XCircle, ShieldCheck, Mail, AlertCircle, Trash2, LogOut } from "lucide-react"
import { resetUserData } from "@/app/actions/auth-reset"
import { signOut, signIn } from "next-auth/react"

export default function SettingsPage() {
    const [status, setStatus] = useState<{ logged_in: boolean; gmail_connected: boolean; login_email: string; gmail_email: string; status: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const searchParams = useSearchParams()

    // Check for URL params
    const error = searchParams.get('error')
    const success = searchParams.get('success')

    const checkStatus = () => {
        setLoading(true)
        fetch("/api/settings/gmail-status")
            .then(res => res.json())
            .then(data => {
                setStatus(data)
                setLoading(false)
            })
            .catch(() => {
                setStatus(null)
                setLoading(false)
            })
    }

    useEffect(() => {
        checkStatus()
        // Clean up URL params
        if (error || success) {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl)
        }
    }, [error, success])

    const handleConnect = () => {
        // Redirect to our custom OAuth flow
        signIn("google-gmail", { callbackUrl: "/dashboard/settings" });
    }

    const handleDisconnect = async () => {
        if (!confirm("Are you sure you want to disconnect Gmail sending?")) return;
        setLoading(true);
        try {
            await fetch("/api/settings/gmail-disconnect", { method: "DELETE" });
            checkStatus(); // Refresh status
        } catch (e) {
            console.error("Disconnect failed", e);
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Mail Connection</h1>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex gap-3 text-sm text-red-400 mb-4">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p>Connection failed: {error === 'access_denied' ? 'Access denied. Please try again.' : error}</p>
                </div>
            )}

            {success && (
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg flex gap-3 text-sm text-green-400 mb-4">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <p>Successfully connected Google account!</p>
                </div>
            )}

            <Card className="border-indigo-500/20 bg-indigo-500/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
                        <ShieldCheck className="h-6 w-6 text-indigo-400" />
                        Google Account Status
                    </CardTitle>
                    <CardDescription>
                        AutoMailer uses the Gmail API to send emails securely from your own account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {loading ? (
                        <div className="flex h-20 items-center justify-center gap-2 text-gray-400">
                            <Loader2 className="animate-spin h-5 w-5" /> Checking connection...
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {status?.gmail_connected ? (
                                // CONNECTED STATE
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between p-4 rounded-xl border bg-green-500/10 border-green-500/20">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-green-400">Connected & Ready</p>
                                                <p className="text-sm text-gray-400">
                                                    Active Account: <span className="text-gray-200">{status.gmail_email}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 justify-end">
                                        <Button
                                            onClick={handleDisconnect}
                                            variant="destructive"
                                            size="sm"
                                            className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                                        >
                                            Disconnect Gmail
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                // DISCONNECTED STATE
                                <div className="flex flex-col md:flex-row items-center justify-between p-6 rounded-xl border bg-white/5 border-white/10 gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                                            <XCircle className="h-6 w-6 text-red-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-200">Not Connected</p>
                                            <p className="text-sm text-gray-500 max-w-sm">
                                                Connect your Google account to start sending automated emails via the Gmail API.
                                                {status?.status && status.status !== "Not Linked" && (
                                                    <span className="block mt-1 text-red-400 text-xs">Error: {status.status}</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 shrink-0">
                                        <Button
                                            onClick={handleConnect}
                                            variant="default"
                                            className="bg-indigo-600 hover:bg-indigo-700 min-w-[140px]"
                                        >
                                            Connect Gmail
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Help Text for Verification - Only show if not connected or error */}
                            {!status?.gmail_connected && (
                                <p className="text-[11px] text-center text-gray-500">
                                    Note: If you see "App not verified", click <strong>Advanced</strong> then <strong>Go to... (unsafe)</strong>
                                </p>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mt-2">
                        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                            <p className="font-semibold text-gray-300 mb-1">Security</p>
                            <p>OAuth 2.0 Encrypted</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                            <p className="font-semibold text-gray-300 mb-1">Daily Limit</p>
                            <p>50 Emails / 24h</p>
                        </div>
                    </div>

                </CardContent>
            </Card>

            {/* Danger Zone */}
            <div className="bg-red-900/10 border border-red-500/10 rounded-lg p-6 space-y-4">
                <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" /> Danger Zone
                </h3>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-300 font-medium">Reset Account Data</p>
                        <p className="text-xs text-red-200/70">Wipe all local session data and templates.</p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={async () => {
                            if (confirm("This will clear all templates and cached data. Continue?")) {
                                await resetUserData()
                                window.location.href = "/"
                            }
                        }}
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 text-xs"
                    >
                        <Trash2 className="w-3 h-3 mr-1" /> Reset
                    </Button>
                </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg flex gap-3 text-sm text-yellow-200/80">
                <Mail className="h-5 w-5 shrink-0" />
                <p>
                    Emails are sent directly through Google's servers. They will appear in your "Sent" folder.
                    We do not store your password or access other emails.
                </p>
            </div>

        </div>
    )
}
