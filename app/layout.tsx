import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";
import { AgentProvider } from "@/contexts/agent-context";
import { ToastProvider } from "@/contexts/toast-context";

const ibmPlexSans = IBM_Plex_Sans({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BugSmith - Developer Mission Control",
  description: "Autonomous AI agent for reading GitHub issues, fixing bugs, creating PRs, and deploying updates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} font-sans antialiased`}>
        <AgentProvider>
          <ToastProvider>
            <div className="flex h-screen overflow-hidden bg-background">
              <Sidebar />
              <div className="flex flex-1 flex-col overflow-hidden">
                <TopNav />
                <main className="flex-1 overflow-hidden bg-pattern">
                  <div className="relative z-10 h-full">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </ToastProvider>
        </AgentProvider>
      </body>
    </html>
  );
}
