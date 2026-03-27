import { NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import mammoth from "mammoth"

const GREENHOUSE_API = "https://boards-api.greenhouse.io/v1/boards/moveworks/jobs?content=true"

function calculateScore(resumeText: string, jobContent: string): number {
    const resumeLow = resumeText.toLowerCase()
    const jobLow = jobContent.toLowerCase()
    
    // Extract keywords from resume heuristically (just taking common tech ones for now, plus any word > 4 chars)
    const techKeywords = ["typescript", "python", "machine learning", "analytics", "next.js", "react", "node", "ai", "hardware", "computer vision", "lidar", "agile", "sql", "data", "sharepoint"]
    
    let matchCount = 0
    let totalKeywords = techKeywords.length
    
    for (const kw of techKeywords) {
        if (resumeLow.includes(kw) && jobLow.includes(kw)) {
            matchCount++
        }
    }
    
    // Also do a simple word match score
    const resumeWords = new Set(resumeLow.split(/\W+/).filter(w => w.length > 5))
    const jobWords = new Set(jobLow.split(/\W+/).filter(w => w.length > 5))
    
    let overlap = 0
    for (const rw of Array.from(resumeWords)) {
        if (jobWords.has(rw)) overlap++
    }
    
    const overlapScore = Math.min(100, Math.round((overlap / 20) * 50)) // 20 good words = 50 pts
    const kwScore = Math.min(100, Math.round((matchCount / totalKeywords) * 50)) // High kw match = 50 pts
    
    return Math.min(100, overlapScore + kwScore)
}

function stripHtml(value: string) {
    return value
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
}

export async function GET() {
    try {
        const resumePath = path.join(process.cwd(), "Ali_Ahmed_Resume.docx")
        const resumeBuffer = fs.readFileSync(resumePath)
        const { value: resumeText } = await mammoth.extractRawText({ buffer: resumeBuffer })

        const response = await fetch(GREENHOUSE_API)
        if (!response.ok) {
            throw new Error(`Failed to fetch Moveworks jobs`)
        }

        const data = await response.json()
        const jobs = data.jobs || []

        const scoredJobs = jobs.map((job: any) => {
            const content = job.content ? stripHtml(job.content) : ""
            const score = calculateScore(resumeText, content)
            
            return {
                id: job.id.toString(),
                title: job.title,
                company: "Moveworks",
                companyLogo: null,
                source: "Moveworks Careers",
                location: job.location?.name || "Unknown",
                excerpt: content.substring(0, 150) + "...",
                description: content,
                employmentType: "Full Time",
                categories: [],
                postedAt: job.updated_at || new Date().toISOString(),
                jobUrl: job.absolute_url,
                score: score
            }
        }).sort((a: any, b: any) => b.score - a.score)

        return NextResponse.json({ jobs: scoredJobs })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return NextResponse.json({ error: "Failed to fetch and score moveworks jobs", details: message }, { status: 500 })
    }
}
