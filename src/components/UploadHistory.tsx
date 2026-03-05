import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, MoreVertical, CheckCircle2 } from "lucide-react"

const mockHistory = [
    { id: 1, name: "Ali_Resume_v4.pdf", date: "Oct 24, 2026", size: "2.1 MB", status: "active" },
    { id: 2, name: "Ali_Resume_Tech.pdf", date: "Sep 12, 2026", size: "1.8 MB", status: "inactive" },
    { id: 3, name: "Ali_Resume_OLD.pdf", date: "Jun 05, 2026", size: "1.9 MB", status: "inactive" },
]

export function UploadHistory() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Upload History</CardTitle>
                <CardDescription>Manage your previously uploaded resumes.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {mockHistory.map((resume) => (
                        <div key={resume.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-background/50 hover:bg-accent transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-md bg-secondary text-primary">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm flex items-center gap-2">
                                        {resume.name}
                                        {resume.status === 'active' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">{resume.date} • {resume.size}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {resume.status !== 'active' && (
                                    <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                                        Set Active
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
