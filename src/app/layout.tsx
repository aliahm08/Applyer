import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Sidebar } from "@/components/layout/sidebar";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-mono",
  subsets: ["latin"],
});

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
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased bg-black text-white min-h-screen`}
      >
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-background/50">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
