"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, RefreshCw, FileText, Send, Loader2 } from "lucide-react"

const mockApplications = [
    { id: 1, company: "Palantir", role: "Forward Deployed Engineer", status: "pending", letter: "Dear Hiring Team at Palantir...\n\nI am writing to express my strong interest in the Forward Deployed Engineer position. With a robust background in building scalable AI systems and deploying them in high-stakes environments, I am eager to bring my expertise to Palantir's mission-critical platforms." },
    { id: 2, company: "Anthropic", role: "AI Full Stack Developer", status: "generating", letter: "" },
    { id: 3, company: "OpenAI", role: "Software Engineer, Machine Learning", status: "queued", letter: "" },
]

export function CoverLetterQueue() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const currentApp = mockApplications[currentIndex]

    const handleNext = () => {
        if (currentIndex < mockApplications.length - 1) {
            setCurrentIndex(currentIndex + 1)
        }
    }

    const handleApprove = () => {
        // In real app, submit application
        handleNext()
    }

    if (!currentApp) return null

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Review Applications</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Review and approve AI-generated cover letters before submitting.
                    </p>
                </div>
                <div className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1.5 rounded-full border border-border">
                    {currentIndex + 1} of {mockApplications.length} Remaining
                </div>
            </div>

            <Card className="min-h-[500px] flex flex-col relative overflow-hidden">
                {/* Glow effect */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                <CardHeader className="border-b border-border/50 pb-6 relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                {currentApp.company}
                            </CardTitle>
                            <CardDescription className="mt-1 text-base">{currentApp.role}</CardDescription>
                        </div>
                        {currentApp.status === "generating" && (
                            <span className="inline-flex items-center gap-2 text-xs font-medium text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Agent Writing...
                            </span>
                        )}
                        {currentApp.status === "queued" && (
                            <span className="inline-flex items-center text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-full border border-border">
                                Queued
                            </span>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="flex-1 p-6 relative z-10">
                    {currentApp.status === "pending" ? (
                        <div className="h-full bg-background border border-border rounded-md p-6 font-mono text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap overflow-y-auto custom-scrollbar">
                            {currentApp.letter}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                            {currentApp.status === "generating" ? (
                                <>
                                    <div className="relative">
                                        <Loader2 className="h-12 w-12 animate-spin text-primary/50" />
                                        <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
                                    </div>
                                    <p className="mt-6 font-medium text-foreground">Analyzing job requirements...</p>
                                    <p className="text-sm mt-2 max-w-[250px] text-center">Cross-referencing your active resume with company profile.</p>
                                </>
                            ) : (
                                <>
                                    <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                    <p>Waiting for current generation to finish...</p>
                                </>
                            )}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="border-t border-border/50 p-6 flex justify-between bg-muted/10 relative z-10">
                    <Button variant="outline" className="gap-2 text-muted-foreground hover:text-destructive hover:border-destructive">
                        <X className="h-4 w-4" />
                        Skip Job
                    </Button>

                    <div className="flex gap-3">
                        <Button variant="outline" disabled={currentApp.status !== "pending"} className="gap-2 group">
                            <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                            Regenerate
                        </Button>
                        <Button
                            onClick={handleApprove}
                            disabled={currentApp.status !== "pending"}
                            className="gap-2 px-8"
                        >
                            <Check className="h-4 w-4" />
                            Approve & Submit
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            {/* Progress timeline */}
            <div className="flex gap-2 mt-4">
                {mockApplications.map((app, idx) => (
                    <div
                        key={app.id}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${idx < currentIndex ? 'bg-primary' :
                                idx === currentIndex ? 'bg-primary/50 animate-pulse' :
                                    'bg-secondary'
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}
