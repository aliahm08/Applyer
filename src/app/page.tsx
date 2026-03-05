import { ResumeUploader } from "@/components/ResumeUploader"
import { UploadHistory } from "@/components/UploadHistory"

export default function Home() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resume Management</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Upload and organize the base resumes you want the AI to use.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <ResumeUploader />
        </div>
        <div className="md:col-span-2">
          <UploadHistory />
        </div>
      </div>
    </div>
  )
}
