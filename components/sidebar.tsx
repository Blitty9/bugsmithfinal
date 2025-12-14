"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  AlertCircle, 
  Play, 
  GitPullRequest,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Issues", href: "/issues", icon: AlertCircle },
  { name: "Agent Run", href: "/agent-run", icon: Play },
  { name: "PRs", href: "/prs", icon: GitPullRequest },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex w-[260px] flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-24 items-center border-b border-border px-5">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0">
            <Image
              src="/assets/bugsmith-logo.png"
              alt="BugSmith"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-semibold tracking-tight text-foreground leading-none">BugSmith</span>
            <span className="text-[10px] font-medium tracking-wider text-foreground-muted uppercase mt-0.5">Agent</span>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  "fade-in",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-foreground-muted hover:bg-muted/50 hover:text-foreground"
                )}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <item.icon className={cn(
                  "h-[18px] w-[18px] transition-colors",
                  isActive ? "text-foreground" : "text-foreground-muted group-hover:text-foreground"
                )} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Status Footer */}
      <div className="border-t border-border p-4">
        <div className="rounded-lg bg-muted px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#9ece6a] animate-pulse" />
            <span className="text-xs text-foreground-muted">All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
