import { JobScrubber } from "@/components/JobScrubber"

export default function ScrubberPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Job Scrubber</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Search the live jobs feed, review results, and queue them for batch application.
                </p>
            </div>

            <JobScrubber />
        </div>
    )
}
