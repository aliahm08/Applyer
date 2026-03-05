"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Globe, CheckSquare, Square, Building2, MapPin } from "lucide-react"

const mockJobs = [
    { id: 1, title: "Forward Deployed Engineer", company: "Palantir", location: "New York, NY", source: "LinkedIn", posted: "2d ago" },
    { id: 2, title: "AI Full Stack Developer", company: "Anthropic", location: "San Francisco, CA", source: "Greenhouse", posted: "5h ago" },
    { id: 3, title: "Software Engineer, Machine Learning", company: "OpenAI", location: "Remote", source: "Lever", posted: "1d ago" },
    { id: 4, title: "Frontend Engineer, Design Systems", company: "Vercel", location: "Remote", source: "Company Site", posted: "3d ago" },
]

export function JobScrubber() {
    const [selectedJobs, setSelectedJobs] = useState<number[]>([])
    const [isSearching, setIsSearching] = useState(false)

    const toggleJob = (id: number) => {
        setSelectedJobs(prev =>
            prev.includes(id) ? prev.filter(j => j !== id) : [...prev, id]
        )
    }

    const toggleAll = () => {
        if (selectedJobs.length === mockJobs.length) {
            setSelectedJobs([])
        } else {
            setSelectedJobs(mockJobs.map(j => j.id))
        }
    }

    return (
        <Card className="h-[800px] flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Job Board Scrubber</CardTitle>
                        <CardDescription>Search across multiple platforms instantly.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Globe className="h-4 w-4" />
                            Sources (4)
                        </Button>
                    </div>
                </div>

                <div className="flex gap-4 mt-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Job title, keywords, or company..." className="pl-9" />
                    </div>
                    <Input placeholder="Location" className="w-[200px]" />
                    <Button
                        className="w-[120px]"
                        onClick={() => {
                            setIsSearching(true)
                            setTimeout(() => setIsSearching(false), 1000)
                        }}
                        disabled={isSearching}
                    >
                        {isSearching ? "Scrubbing..." : "Search"}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto">
                <div className="rounded-md border border-border">
                    {/* Table Header */}
                    <div className="flex items-center p-4 bg-muted/50 border-b border-border">
                        <button onClick={toggleAll} className="mr-4 text-muted-foreground hover:text-white transition-colors">
                            {selectedJobs.length === mockJobs.length ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                        </button>
                        <div className="flex-1 grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
                            <div className="col-span-5">Job Title</div>
                            <div className="col-span-3">Company</div>
                            <div className="col-span-2">Location</div>
                            <div className="col-span-2">Source</div>
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-border">
                        {mockJobs.map((job) => {
                            const isSelected = selectedJobs.includes(job.id)
                            return (
                                <div
                                    key={job.id}
                                    className={`flex items-center p-4 transition-colors hover:bg-accent/50 ${isSelected ? 'bg-primary/5' : ''}`}
                                >
                                    <button onClick={() => toggleJob(job.id)} className={`mr-4 transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}>
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
                                            <span className="text-[10px] text-muted-foreground">{job.posted}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="border-t border-border p-6 flex justify-between items-center bg-muted/20">
                <span className="text-sm text-muted-foreground">
                    {selectedJobs.length} job{selectedJobs.length !== 1 ? 's' : ''} selected
                </span>
                <Button disabled={selectedJobs.length === 0} size="lg" className="gap-2">
                    Batch Apply ({selectedJobs.length})
                </Button>
            </CardFooter>
        </Card>
    )
}
