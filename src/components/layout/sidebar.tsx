"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { AuthStatus } from "@/components/auth-status"
import { Briefcase, FileText, Send, Users } from "lucide-react"

const navigation = [
    { name: "Resumes", href: "/", icon: FileText },
    { name: "Scrubber", href: "/scrubber", icon: Briefcase },
    { name: "Batch Apply", href: "/apply", icon: Send },
    { name: "Networking", href: "/networking", icon: Users },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-full w-64 flex-col border-r border-border bg-card">
            <div className="flex h-16 items-center px-6 border-b border-border">
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <div className="w-6 h-6 bg-white rounded-sm" />
                    applyer
                </span>
            </div>

            <div className="flex-1 overflow-y-auto py-6">
                <nav className="space-y-1 px-4">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-accent text-white"
                                        : "text-muted-foreground hover:bg-accent hover:text-white"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "mr-3 flex-shrink-0 h-5 w-5",
                                        isActive ? "text-white" : "text-muted-foreground group-hover:text-white"
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-border">
                <AuthStatus />
            </div>
        </div>
    )
}
