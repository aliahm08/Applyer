"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"
import { Search, Globe, CheckSquare, Square, Building2, MapPin, ExternalLink } from "lucide-react"

type Job = {
  id: string
  title: string
  company: string
  source: string
  location: string
  postedAt: string
  excerpt: string
  jobUrl: string
  description: string
}

function formatRelativeTime(isoDate: string) {
  const diffInHours = Math.round((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60))
  if (diffInHours < 24) {
    return `${Math.max(diffInHours, 1)}h ago`
  }

  return `${Math.round(diffInHours / 24)}d ago`
}

export function JobScrubber() {
  const { isAuthenticated, isReady } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [query, setQuery] = useState("")
  const [location, setLocation] = useState("")
  const [selectedJobs, setSelectedJobs] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isQueueing, setIsQueueing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  const selectedRows = useMemo(() => jobs.filter((job) => selectedJobs.includes(job.id)), [jobs, selectedJobs])

  const loadJobs = async () => {
    setIsSearching(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (query.trim()) {
        params.set("query", query.trim())
      }
      if (location.trim()) {
        params.set("location", location.trim())
      }

      const response = await fetch(`/api/jobs/search?${params.toString()}`)
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string; details?: string }
        throw new Error(payload.details || payload.error || "Failed to search jobs")
      }

      const data = (await response.json()) as { jobs: Job[] }
      setJobs(data.jobs)
      setSelectedJobs([])
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Failed to search jobs")
      setJobs([])
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    void loadJobs()
    // Initial remote jobs feed load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleJob = (id: string) => {
    setSelectedJobs((prev) => (prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    if (selectedJobs.length === jobs.length) {
      setSelectedJobs([])
    } else {
      setSelectedJobs(jobs.map((job) => job.id))
    }
  }

  const sendToQueue = async () => {
    if (!isAuthenticated || selectedRows.length === 0) return

    setIsQueueing(true)
    setSyncMessage(null)

    try {
      const response = await fetch("/api/applications/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobs: selectedRows.map((job) => ({
            company: job.company,
            role: job.title,
            source: job.source,
            location: job.location,
            jobUrl: job.jobUrl,
            externalJobId: job.id,
            description: job.description,
          })),
        }),
      })

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string; details?: string }
        throw new Error(payload.details || payload.error || "Failed to sync jobs")
      }

      const data = (await response.json()) as { count: number }
      setSyncMessage(`Synced ${data.count} job${data.count === 1 ? "" : "s"} to Supabase queue.`)
      setSelectedJobs([])
      window.dispatchEvent(new Event("applications:changed"))
    } catch (error) {
      setSyncMessage(error instanceof Error ? error.message : "Failed to sync jobs")
    } finally {
      setIsQueueing(false)
    }
  }

  return (
    <Card className="h-[800px] flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Job Board Scrubber</CardTitle>
            <CardDescription>Search the live remote jobs feed and queue roles into Supabase.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Globe className="h-4 w-4" />
              Himalayas API
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Job title, keywords, or company..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Input placeholder="Location" className="w-[200px]" value={location} onChange={(e) => setLocation(e.target.value)} />
          <Button className="w-[120px]" onClick={() => void loadJobs()} disabled={isSearching}>
            {isSearching ? "Scrubbing..." : "Search"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Live remote job data is pulled from the latest Himalayas feed and filtered in-app.</p>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto">
        {error ? <p className="text-sm text-destructive mb-4">{error}</p> : null}
        <div className="rounded-md border border-border">
          <div className="flex items-center p-4 bg-muted/50 border-b border-border">
            <button onClick={toggleAll} className="mr-4 text-muted-foreground hover:text-white transition-colors">
              {jobs.length > 0 && selectedJobs.length === jobs.length ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
            </button>
            <div className="flex-1 grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
              <div className="col-span-5">Job Title</div>
              <div className="col-span-3">Company</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-2">Source</div>
            </div>
          </div>

          <div className="divide-y divide-border">
            {jobs.map((job) => {
              const isSelected = selectedJobs.includes(job.id)
              return (
                <div key={job.id} className={`flex items-center p-4 transition-colors hover:bg-accent/50 ${isSelected ? "bg-primary/5" : ""}`}>
                  <button onClick={() => toggleJob(job.id)} className={`mr-4 transition-colors ${isSelected ? "text-primary" : "text-muted-foreground hover:text-white"}`}>
                    {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                  </button>
                  <div className="flex-1 grid grid-cols-12 gap-4 text-sm items-center">
                    <div className="col-span-5 font-medium">{job.title}</div>
                    <div className="col-span-3 flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      {job.company}
                    </div>
                    <div className="col-span-2 flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </div>
                    <div className="col-span-2 flex flex-col items-start gap-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                        {job.source}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">{formatRelativeTime(job.postedAt)}</span>
                        <a href={job.jobUrl} target="_blank" rel="noreferrer" className="text-[10px] text-primary inline-flex items-center gap-1">
                          Open
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            {!isSearching && jobs.length === 0 && (
              <div className="p-6 text-sm text-muted-foreground">No jobs matched your current filters.</div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-border p-6 flex justify-between items-center bg-muted/20">
        <div>
          <span className="text-sm text-muted-foreground">
            {selectedJobs.length} job{selectedJobs.length !== 1 ? "s" : ""} selected
          </span>
          {syncMessage && <p className="text-xs text-muted-foreground mt-1">{syncMessage}</p>}
        </div>
        <Button disabled={selectedJobs.length === 0 || !isAuthenticated || !isReady || isQueueing} size="lg" className="gap-2" onClick={() => void sendToQueue()}>
          {isAuthenticated ? (isQueueing ? "Syncing..." : `Batch Apply (${selectedJobs.length})`) : "Sign in to Batch Apply"}
        </Button>
      </CardFooter>
    </Card>
  )
}
