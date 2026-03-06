"use client"

import { useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadCloud, FileType2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export function ResumeUploader() {
    const { isAuthenticated, isReady } = useAuth()
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    const uploadFile = async (file: File) => {
        setIsUploading(true)
        setMessage(null)

        try {
            const formData = new FormData()
            formData.append("file", file)

            const response = await fetch("/api/resumes", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                const payload = (await response.json()) as { error?: string; details?: string }
                throw new Error(payload.details || payload.error || "Upload failed")
            }

            setMessage(`${file.name} uploaded to Supabase.`)
            window.dispatchEvent(new Event("resumes:changed"))
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Upload failed")
        } finally {
            setIsUploading(false)
        }
    }

    const handleSelectedFile = async (file: File | null) => {
        if (!file || !isAuthenticated) {
            return
        }

        await uploadFile(file)
    }

    return (
        <Card className="border-dashed border-2 bg-background/50 hover:bg-accent/50 transition-colors">
            <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                    <UploadCloud className="h-6 w-6 text-primary" />
                    Upload Resume
                </CardTitle>
                <CardDescription>Drag and drop your PDF resume here, or click to browse.</CardDescription>
            </CardHeader>
            <CardContent>
                <div
                    className={`flex flex-col items-center justify-center py-10 rounded-lg transition-all ${isDragging ? 'bg-primary/10 scale-[1.02]' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault()
                        setIsDragging(false)
                        void handleSelectedFile(e.dataTransfer.files[0] ?? null)
                    }}
                >
                    <FileType2 className="h-12 w-12 text-muted-foreground mb-4" />
                    <input
                        ref={inputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                            void handleSelectedFile(e.target.files?.[0] ?? null)
                            e.currentTarget.value = ""
                        }}
                    />
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => inputRef.current?.click()}
                        disabled={!isAuthenticated || !isReady || isUploading}
                    >
                        {isUploading ? "Uploading..." : "Select File"}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">
                        {isAuthenticated ? "Supported formats: .pdf up to 5MB" : "Sign in to store resumes in Supabase"}
                    </p>
                    {message && <p className="text-xs text-muted-foreground mt-2 text-center">{message}</p>}
                </div>
            </CardContent>
        </Card>
    )
}
