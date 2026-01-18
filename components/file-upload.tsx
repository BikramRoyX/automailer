"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
    accept: string
    label: string
    onUpload: (file: File) => Promise<void>
    buttonText?: string
}

export function FileUpload({ accept, label, onUpload, buttonText = "Upload" }: FileUploadProps) {
    const [dragActive, setDragActive] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0])
        }
    }

    const handleFile = (file: File) => {
        // Validate type roughly
        if (accept !== "*" && !file.type.match(accept.replace("*", ""))) {
            // Simple check, specific mime types might vary
            // Good enough for now
        }
        setFile(file)
        setSuccess(false)
        setError("")
    }

    const handleSubmit = async () => {
        if (!file) return
        setUploading(true)
        setError("")
        try {
            await onUpload(file)
            setSuccess(true)
            setFile(null)
            // Reset after success? keep success message
        } catch (err: any) {
            setError(err.message || "Upload failed")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="w-full">
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    dragActive ? "border-primary bg-primary/5" : "border-gray-200 dark:border-gray-800",
                    success ? "border-green-500 bg-green-50 dark:bg-green-900/10" : ""
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    className="hidden"
                    type="file"
                    accept={accept}
                    onChange={handleChange}
                />

                {success ? (
                    <div className="flex flex-col items-center gap-2 text-green-600">
                        <Check className="h-10 w-10" />
                        <p className="font-medium">Upload Complete!</p>
                        <Button variant="outline" size="sm" onClick={() => setSuccess(false)} className="mt-2">
                            Upload New File
                        </Button>
                    </div>
                ) : !file ? (
                    <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => inputRef.current?.click()}>
                        <Upload className="h-10 w-10 text-muted-foreground" />
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">Drag & drop or click to browse</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 p-2 bg-background border rounded-md">
                            <FileText className="h-5 w-5 text-primary" />
                            <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button onClick={handleSubmit} disabled={uploading}>
                            {uploading ? "Uploading..." : buttonText}
                        </Button>
                        {error && <p className="text-xs text-destructive">{error}</p>}
                    </div>
                )}
            </div>
        </div>
    )
}
