import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "applyer | Automated Job Applications",
  description: "AI-powered job board scrubbing, cover letter generation, and networking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className="antialiased bg-black text-white min-h-screen"
      >
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-background/50">
            {children}
          </main>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
