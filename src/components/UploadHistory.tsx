"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, MoreVertical, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

type Resume = {
    id: string
    file_name: string
    size_bytes: number
    created_at: string
    is_active: boolean
}

function formatFileSize(sizeBytes: number) {
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(isoDate: string) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    }).format(new Date(isoDate))
}

export function UploadHistory() {
    const { isAuthenticated, isReady } = useAuth()
    const [resumes, setResumes] = useState<Resume[]>([])
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    useEffect(() => {
        if (!isAuthenticated) {
            setResumes([])
            return
        }

        let cancelled = false

        const loadResumes = async () => {
            setLoading(true)
            setMessage(null)

            try {
                const response = await fetch("/api/resumes")
                if (!response.ok) {
                    const payload = (await response.json()) as { error?: string; details?: string }
                    throw new Error(payload.details || payload.error || "Failed to load resumes")
                }

                const data = (await response.json()) as { resumes: Resume[] }
                if (!cancelled) {
                    setResumes(data.resumes)
                }
            } catch (error) {
                if (!cancelled) {
                    setMessage(error instanceof Error ? error.message : "Failed to load resumes")
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        void loadResumes()

        const handleRefresh = () => {
            void loadResumes()
        }

        window.addEventListener("resumes:changed", handleRefresh)
        return () => {
            cancelled = true
            window.removeEventListener("resumes:changed", handleRefresh)
        }
    }, [isAuthenticated])

    const setActiveResume = async (resumeId: string) => {
        setMessage(null)

        try {
            const response = await fetch(`/api/resumes/${resumeId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action: "set-active" }),
            })

            if (!response.ok) {
                const payload = (await response.json()) as { error?: string; details?: string }
                throw new Error(payload.details || payload.error || "Failed to update resume")
            }

            const data = (await response.json()) as { resume: Resume }
            setResumes((prev) => prev.map((resume) => ({ ...resume, is_active: resume.id === data.resume.id })))
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Failed to update resume")
        }
    }

    if (!isReady) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Upload History</CardTitle>
                    <CardDescription>Checking Supabase session...</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    if (!isAuthenticated) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Upload History</CardTitle>
                    <CardDescription>Sign in to store and manage resumes in Supabase.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upload History</CardTitle>
                <CardDescription>Manage your Supabase-backed resume versions.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p className="text-sm text-muted-foreground">Loading resumes...</p>
                ) : resumes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No resumes uploaded yet.</p>
                ) : (
                <div className="space-y-4">
                    {resumes.map((resume) => (
                        <div key={resume.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-background/50 hover:bg-accent transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-md bg-secondary text-primary">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm flex items-center gap-2">
                                        {resume.file_name}
                                        {resume.is_active && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(resume.created_at)} • {formatFileSize(resume.size_bytes)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!resume.is_active && (
                                    <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => void setActiveResume(resume.id)}>
                                        Set Active
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon" disabled>
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                )}
                {message && <p className="text-xs text-muted-foreground mt-4">{message}</p>}
            </CardContent>
        </Card>
    )
}
