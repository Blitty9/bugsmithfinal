"use client";

import { StatusChip } from "@/components/status-chip";
import { AlertCircle, Clock, ExternalLink, User } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export interface Issue {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  status: "open" | "in-progress" | "resolved";
  createdAt: string;
  labels?: string[];
  number?: number;
  html_url?: string;
  body?: string;
  user?: string;
}

interface IssueCardProps {
  issue: Issue;
  onClick?: () => void;
  className?: string;
}

const difficultyStyles = {
  easy: "text-success bg-success/10 border-success/20",
  medium: "text-warning bg-warning/10 border-warning/20",
  hard: "text-destructive bg-destructive/10 border-destructive/20",
};

export function IssueCard({ issue, onClick, className }: IssueCardProps) {
  return (
    <div
      className={cn(
        "group rounded-lg border border-border bg-background p-4 transition-all duration-300",
        onClick && "cursor-pointer hover:border-primary/40 hover:bg-card hover-lift",
        className
      )}
      onClick={onClick}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <AlertCircle className="h-4 w-4 text-primary" />
          </div>
          <div>
            <span className="text-xs font-medium text-foreground-muted">
              #{issue.number || issue.id}
            </span>
          </div>
        </div>
        <StatusChip
          status={
            issue.status === "open"
              ? "idle"
              : issue.status === "in-progress"
              ? "running"
              : "completed"
          }
        />
      </div>
      
      {/* Title */}
      <h3 className="mt-3 text-sm font-medium text-foreground leading-snug">
        {issue.title}
      </h3>
      
      {/* Body Preview */}
      {issue.body && (
        <p className="mt-2 text-xs text-foreground-muted line-clamp-2 leading-relaxed">
          {issue.body}
        </p>
      )}
      
      {/* Meta Row */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
            <Clock className="h-3.5 w-3.5" />
            {formatDate(issue.createdAt)}
          </div>
          {issue.user && (
            <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
              <User className="h-3.5 w-3.5" />
              {issue.user}
            </div>
          )}
          <span
            className={cn(
              "rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
              difficultyStyles[issue.difficulty]
            )}
          >
            {issue.difficulty}
          </span>
        </div>
        {issue.html_url && (
          <a 
            href={issue.html_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-foreground-muted hover:text-primary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
      
      {/* Labels */}
      {issue.labels && issue.labels.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {issue.labels.map((label) => (
            <span
              key={label}
              className="rounded-md bg-muted px-2 py-0.5 text-xs text-foreground-muted"
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
