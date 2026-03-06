import type { Metadata } from "next"
import { Sidebar } from "@/components/layout/sidebar"
import { AuthProvider } from "@/components/auth-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "applyer | Automated Job Applications",
  description: "AI-powered job board scrubbing, cover letter generation, and networking.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground min-h-screen">
        <AuthProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-background/50">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
