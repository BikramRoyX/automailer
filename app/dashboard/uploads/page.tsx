"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { FileUpload } from "@/components/file-upload"
// Tabs removed in favor of state
import { Button } from "@/components/ui/button"

export default function UploadsPage() {
    const [activeTab, setActiveTab] = useState<"resume" | "contacts">("contacts")
    const [stats, setStats] = useState<any>(null)

    const handleResumeUpload = async (file: File) => {
        const formData = new FormData()
        formData.append("file", file)
        const res = await fetch("/api/uploads/resume", {
            method: "POST",
            body: formData
        })
        if (!res.ok) throw new Error("Upload failed")
    }

    const handleCsvUpload = async (file: File) => {
        const formData = new FormData()
        formData.append("file", file)
        const res = await fetch("/api/uploads/csv", {
            method: "POST",
            body: formData
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "Upload failed")
        setStats(data)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Data & Uploads</h1>
                {/* Simple Tab Switcher */}
                <div className="flex bg-muted p-1 rounded-lg">
                    <Button
                        variant={activeTab === "contacts" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => { setActiveTab("contacts"); setStats(null); }}
                    >
                        Contacts (CSV)
                    </Button>
                    <Button
                        variant={activeTab === "resume" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => { setActiveTab("resume"); setStats(null); }}
                    >
                        Resume (PDF)
                    </Button>
                </div>
            </div>

            {activeTab === "contacts" && (
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Import Contacts</CardTitle>
                            <CardDescription>Upload a CSV with columns: <strong>name, title, email, company</strong></CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FileUpload
                                accept=".csv" // MIME type text/csv
                                label="Upload CSV List"
                                onUpload={handleCsvUpload}
                                buttonText="Import Contacts"
                            />
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Guidelines</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2 text-muted-foreground">
                                <p>• File must be .csv format</p>
                                <p>• <strong>Supported Columns:</strong></p>
                                <ul className="list-disc pl-5 mt-1">
                                    <li><strong>email</strong> (Required)</li>
                                    <li><strong>name</strong> (Candidate Name)</li>
                                    <li><strong>title</strong> (Job Title / Role)</li>
                                    <li><strong>company</strong> (Organization Name)</li>
                                </ul>
                                <p className="mt-2">• Headers are case-insensitive</p>
                            </CardContent>
                        </Card>

                        {stats && (
                            <Card className="bg-slate-50 dark:bg-slate-900 border-indigo-200 dark:border-indigo-900">
                                <CardHeader>
                                    <CardTitle className="text-indigo-600">Import Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-1">
                                    <div className="flex justify-between">
                                        <span>Total Rows:</span>
                                        <span className="font-bold">{stats.totalInFile}</span>
                                    </div>
                                    <div className="flex justify-between text-green-600">
                                        <span>Added New:</span>
                                        <span className="font-bold">{stats.added}</span>
                                    </div>
                                    <div className="flex justify-between text-yellow-600">
                                        <span>Duplicates Skipped:</span>
                                        <span className="font-bold">{stats.duplicates}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Invalid/Ignored:</span>
                                        <span className="font-bold">{stats.ignored}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "resume" && (
                <div className="max-w-xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Resume</CardTitle>
                            <CardDescription>Upload your PDF resume to attach to emails.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FileUpload
                                accept=".pdf" // application/pdf
                                label="Upload Resume (PDF)"
                                onUpload={handleResumeUpload}
                                buttonText="Save Resume"
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
