"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusChip } from "@/components/status-chip";
import { GitBranch, GitMerge, GitPullRequest } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export interface PullRequest {
  id: string;
  title: string;
  branch: string;
  baseBranch: string;
  status: "open" | "merged" | "closed";
  summary: string;
  createdAt: string;
  author: string;
}

interface PRCardProps {
  pr: PullRequest;
  onClick?: () => void;
  className?: string;
}

export function PRCard({ pr, onClick, className }: PRCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 hover:border-primary/40 hover-lift",
        className
      )}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {pr.status === "merged" ? (
              <GitMerge className="h-5 w-5 text-purple-500" />
            ) : (
              <GitPullRequest className="h-5 w-5 text-[#3B82F6]" />
            )}
            <CardTitle className="text-lg">#{pr.id}</CardTitle>
          </div>
          <StatusChip
            status={
              pr.status === "open"
                ? "running"
                : pr.status === "merged"
                ? "completed"
                : "error"
            }
          />
        </div>
        <CardDescription className="mt-2 text-base text-white">
          {pr.title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-[#8B949E]">
              <GitBranch className="h-4 w-4" />
              <span>
                {pr.branch} → {pr.baseBranch}
              </span>
            </div>
          </div>
          <p className="text-sm text-[#8B949E]">{pr.summary}</p>
          <div className="flex items-center justify-between text-xs text-[#8B949E]">
            <span>By {pr.author}</span>
            <span>{formatDate(pr.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

