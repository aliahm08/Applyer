"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, RefreshCw, FileText, Loader2 } from "lucide-react"
import { generateCoverLetter } from "@/actions/generateCoverLetter"
import { useAuth } from "@/components/auth-provider"

type AppStatus = "pending" | "generating" | "queued" | "submitted"
type Application = {
  id: string
  company: string
  role: string
  source: string
  location: string | null
  status: AppStatus | "skipped"
  letter: string
}

export function CoverLetterQueue() {
  const { isAuthenticated, isReady } = useAuth()
  const [apps, setApps] = useState<Application[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentApp = apps[currentIndex]

  const loadQueue = useCallback(async () => {
    if (!isAuthenticated) {
      setApps([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/applications")

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string; details?: string }
        throw new Error(payload.details || payload.error || "Failed to load applications")
      }

      const data = (await response.json()) as {
        applications: Array<{
          id: string
          company: string
          role: string
          source: string
          location: string | null
          status: AppStatus | "skipped"
          letter: string | null
        }>
      }

      const normalized = data.applications
        .filter((app) => app.status !== "submitted" && app.status !== "skipped")
        .map((app) => ({ ...app, letter: app.letter ?? "" }))
      setApps(normalized)
      setCurrentIndex(0)
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load queue")
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    void loadQueue()
  }, [loadQueue])

  useEffect(() => {
    const handleQueueRefresh = () => {
      void loadQueue()
    }

    window.addEventListener("applications:changed", handleQueueRefresh)
    return () => window.removeEventListener("applications:changed", handleQueueRefresh)
  }, [loadQueue])

  const patchApplication = useCallback(async (applicationId: string, patch: Partial<Pick<Application, "status" | "letter">>) => {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patch),
      })

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string; details?: string }
        throw new Error(payload.details || payload.error || "Failed to update application")
      }
    }, [])

  useEffect(() => {
    async function markCurrentGenerating() {
      if (!currentApp || currentApp.status !== "queued") {
        return
      }

      setApps((prev) => prev.map((app, index) => (index === currentIndex ? { ...app, status: "generating" } : app)))

      try {
        await patchApplication(currentApp.id, { status: "generating" })
      } catch (patchError) {
        setError(patchError instanceof Error ? patchError.message : "Failed to update application")
      }
    }

    void markCurrentGenerating()
  }, [currentApp, currentIndex, patchApplication])

  useEffect(() => {
    async function fetchLetter() {
      if (currentApp && currentApp.status === "generating" && !currentApp.letter) {
        try {
          const result = await generateCoverLetter(currentApp.company, currentApp.role)
          setApps((prev) => prev.map((app, index) => (index === currentIndex ? { ...app, status: "pending", letter: result } : app)))
          await patchApplication(currentApp.id, { status: "pending", letter: result })
        } catch (generationError) {
          setError(generationError instanceof Error ? generationError.message : "Failed to generate cover letter")
        }
      }
    }
    void fetchLetter()
  }, [currentApp, currentIndex, patchApplication])

  const handleRegenerate = async () => {
    if (!currentApp) return

    try {
      setApps((prev) => prev.map((app, index) => (index === currentIndex ? { ...app, status: "generating", letter: "" } : app)))
      await patchApplication(currentApp.id, { status: "generating", letter: "" })
      const result = await generateCoverLetter(currentApp.company, currentApp.role)
      setApps((prev) => prev.map((app, index) => (index === currentIndex ? { ...app, status: "pending", letter: result } : app)))
      await patchApplication(currentApp.id, { status: "pending", letter: result })
    } catch (regenerateError) {
      setError(regenerateError instanceof Error ? regenerateError.message : "Failed to regenerate cover letter")
    }
  }

  const handleApprove = async () => {
    if (!currentApp) return

    try {
      await patchApplication(currentApp.id, { status: "submitted" })
      const remaining = apps.filter((app) => app.id !== currentApp.id)
      setApps(remaining)
      setCurrentIndex((index) => Math.max(0, Math.min(index, remaining.length - 1)))
    } catch (approveError) {
      setError(approveError instanceof Error ? approveError.message : "Failed to submit application")
    }
  }

  const handleSkip = async () => {
    if (!currentApp) return

    try {
      await patchApplication(currentApp.id, { status: "skipped" })
      const remaining = apps.filter((app) => app.id !== currentApp.id)
      setApps(remaining)
      setCurrentIndex((index) => Math.max(0, Math.min(index, remaining.length - 1)))
    } catch (skipError) {
      setError(skipError instanceof Error ? skipError.message : "Failed to skip application")
    }
  }

  const progressLabel = useMemo(() => (apps.length === 0 ? "0 of 0 Remaining" : `${currentIndex + 1} of ${apps.length} Remaining`), [apps.length, currentIndex])

  if (!isReady) {
    return <p className="text-sm text-muted-foreground">Checking Supabase session...</p>
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Review Applications</CardTitle>
          <CardDescription>Sign in with Google to load your Supabase queue.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading applications from Supabase...</p>
  }

  if (error && apps.length === 0) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  if (!currentApp) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Queue is empty</CardTitle>
          <CardDescription>Add jobs from the Scrubber tab to start generating cover letters.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Review Applications</h2>
          <p className="text-muted-foreground mt-1 text-sm">Review and approve AI-generated cover letters before submitting.</p>
        </div>
        <div className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1.5 rounded-full border border-border">{progressLabel}</div>
      </div>

      <Card className="min-h-[500px] flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

        <CardHeader className="border-b border-border/50 pb-6 relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {currentApp.company}
              </CardTitle>
              <CardDescription className="mt-1 text-base">{currentApp.role}</CardDescription>
              <p className="text-xs text-muted-foreground mt-2">{currentApp.source}{currentApp.location ? ` • ${currentApp.location}` : ""}</p>
            </div>
            {currentApp.status === "generating" && (
              <span className="inline-flex items-center gap-2 text-xs font-medium text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                <Loader2 className="h-3 w-3 animate-spin" />
                Agent Writing...
              </span>
            )}
            {currentApp.status === "queued" && <span className="inline-flex items-center text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-full border border-border">Queued</span>}
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
          <Button variant="outline" onClick={() => void handleSkip()} className="gap-2 text-muted-foreground hover:text-destructive hover:border-destructive">
            <X className="h-4 w-4" />
            Skip Job
          </Button>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => void handleRegenerate()} disabled={currentApp.status !== "pending"} className="gap-2 group">
              <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
              Regenerate
            </Button>
            <Button onClick={() => void handleApprove()} disabled={currentApp.status !== "pending"} className="gap-2 px-8">
              <Check className="h-4 w-4" />
              Approve & Submit
            </Button>
          </div>
        </CardFooter>
      </Card>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
