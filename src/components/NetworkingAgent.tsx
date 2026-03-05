"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Phone, Mail, Linkedin, ExternalLink, Network } from "lucide-react"

const mockConnections = [
    { id: 1, name: "Sarah Chen", role: "Engineering Manager", company: "Palantir", similarity: "94%", location: "New York" },
    { id: 2, name: "Marcus Johnson", role: "Senior Recruiter", company: "Palantir", similarity: "88%", location: "Remote" },
    { id: 3, name: "Elena Rodriguez", role: "Staff AI Engineer", company: "Anthropic", similarity: "91%", location: "San Francisco" },
]

export function NetworkingAgent() {
    return (
        <Card className="flex flex-col h-[700px]">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Network className="h-5 w-5 text-primary" />
                            Networking Agent
                        </CardTitle>
                        <CardDescription>AI-discovered connections for your recent applications.</CardDescription>
                    </div>
                    <div className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full font-medium border border-primary/20">
                        3 High-Value Targets Found
                    </div>
                </div>
                <div className="relative mt-4">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Filter connections by company or role..." className="pl-9" />
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto space-y-4">
                {mockConnections.map((contact) => (
                    <div key={contact.id} className="p-5 rounded-lg border border-border bg-background/50 hover:bg-accent/30 transition-all flex flex-col md:flex-row gap-4 md:items-center justify-between group">

                        <div className="flex items-start md:items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-muted-foreground border border-border">
                                {contact.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground flex items-center gap-2">
                                    {contact.name}
                                    <span className="text-[10px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded border border-green-500/20">
                                        {contact.similarity} Match
                                    </span>
                                </h4>
                                <p className="text-sm text-foreground/80 mt-0.5">{contact.role} at {contact.company}</p>
                                <p className="text-xs text-muted-foreground mt-1">{contact.location}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="h-9 w-9 p-0 rounded-full hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors">
                                <Linkedin className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-9 w-9 p-0 rounded-full hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors">
                                <Mail className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-9 w-9 p-0 rounded-full hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors">
                                <Phone className="h-4 w-4" />
                            </Button>

                            <div className="w-px h-6 bg-border mx-1" />

                            <Button size="sm" className="gap-2 shrink-0">
                                <ExternalLink className="h-3 w-3" />
                                Draft Msg
                            </Button>
                        </div>

                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
