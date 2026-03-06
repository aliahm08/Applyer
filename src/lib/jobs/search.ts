const JOBS_API_URL = "https://himalayas.app/jobs/api?limit=20"

type HimalayasJob = {
  guid: string
  title: string
  excerpt: string
  description: string
  companyName: string
  companyLogo: string | null
  employmentType: string | null
  locationRestrictions: string[]
  categories: string[]
  pubDate: number
  applicationLink: string
}

type HimalayasResponse = {
  jobs?: HimalayasJob[]
}

export type JobSearchResult = {
  id: string
  title: string
  company: string
  companyLogo: string | null
  source: string
  location: string
  excerpt: string
  description: string
  employmentType: string | null
  categories: string[]
  postedAt: string
  jobUrl: string
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function matchesFilter(value: string, query: string) {
  return !query || value.toLowerCase().includes(query)
}

function normalizeLocation(locationRestrictions: string[]) {
  if (!locationRestrictions.length) {
    return "Worldwide"
  }

  return locationRestrictions.join(", ")
}

export async function searchJobs(query: string, location: string) {
  const response = await fetch(JOBS_API_URL, {
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: 300,
    },
  })

  if (!response.ok) {
    throw new Error(`Jobs API request failed with ${response.status}`)
  }

  const payload = (await response.json()) as HimalayasResponse
  const queryFilter = query.trim().toLowerCase()
  const locationFilter = location.trim().toLowerCase()

  const results = (payload.jobs ?? [])
    .map(
      (job): JobSearchResult => ({
        id: job.guid,
        title: job.title,
        company: job.companyName,
        companyLogo: job.companyLogo,
        source: "Himalayas",
        location: normalizeLocation(job.locationRestrictions),
        excerpt: job.excerpt,
        description: stripHtml(job.description),
        employmentType: job.employmentType,
        categories: job.categories,
        postedAt: new Date(job.pubDate * 1000).toISOString(),
        jobUrl: job.applicationLink,
      }),
    )
    .filter((job) => {
      const haystack = `${job.title} ${job.company} ${job.excerpt} ${job.description} ${job.categories.join(" ")}`
      return matchesFilter(haystack, queryFilter) && matchesFilter(job.location, locationFilter)
    })

  return results
}
