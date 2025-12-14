"use client";

import { Bell, Settings, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopNav() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="search"
            placeholder="Search issues, PRs, logs..."
            className="h-9 w-72 rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-foreground-muted transition-all duration-150 focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 text-foreground-muted hover:text-foreground hover:bg-muted"
        >
          <Bell className="h-[18px] w-[18px]" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 text-foreground-muted hover:text-foreground hover:bg-muted"
        >
          <Settings className="h-[18px] w-[18px]" />
        </Button>
      </div>
    </header>
  );
}
