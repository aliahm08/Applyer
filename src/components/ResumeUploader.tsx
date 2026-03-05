"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadCloud, FileType2 } from "lucide-react"

export function ResumeUploader() {
    const [isDragging, setIsDragging] = useState(false)

    return (
        <Card className="border-dashed border-2 bg-background/50 hover:bg-accent/50 transition-colors">
            <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                    <UploadCloud className="h-6 w-6 text-primary" />
                    Upload Resume
                </CardTitle>
                <CardDescription>Drag and drop your PDF resume here, or click to browse.</CardDescription>
            </CardHeader>
            <CardContent>
                <div
                    className={`flex flex-col items-center justify-center py-10 rounded-lg transition-all ${isDragging ? 'bg-primary/10 scale-[1.02]' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
                >
                    <FileType2 className="h-12 w-12 text-muted-foreground mb-4" />
                    <Button variant="outline" className="mt-4">
                        Select File
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">Supported formats: .pdf up to 5MB</p>
                </div>
            </CardContent>
        </Card>
    )
}
