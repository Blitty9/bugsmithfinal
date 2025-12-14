"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Circle, Loader2, XCircle, ChevronDown, ChevronRight, Clock, FileCode, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepStatus } from "@/contexts/agent-context";

interface Step {
  id: string;
  label: string;
  description?: string;
  status: StepStatus;
  logs?: string[];
  expectedLogs?: number;
  retryAttempts?: number;
  startedAt?: string;
  completedAt?: string;
  thought?: string;
  patch?: string;
  modifiedFiles?: string[];
}

interface StepperProps {
  steps: Step[];
  className?: string;
  activeStepIndex?: number;
  onJumpToLogs?: (stepIndex: number) => void;
}

export function Stepper({ steps, className, activeStepIndex, onJumpToLogs }: StepperProps) {
  const activeStepRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  // Smooth scroll to active step
  useEffect(() => {
    if (activeStepRef.current && containerRef.current && activeStepIndex !== undefined) {
      const container = containerRef.current;
      const step = activeStepRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const stepRect = step.getBoundingClientRect();
      
      const stepTop = stepRect.top - containerRect.top + container.scrollTop;
      const containerHeight = containerRect.height;
      const stepHeight = stepRect.height;
      
      // Center the active step in the viewport
      const scrollTo = stepTop - (containerHeight / 2) + (stepHeight / 2);
      
      container.scrollTo({
        top: scrollTo,
        behavior: "smooth",
      });
    }
  }, [activeStepIndex]);

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const formatDuration = (startedAt?: string, completedAt?: string) => {
    if (!startedAt) return null;
    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const duration = Math.round((end.getTime() - start.getTime()) / 1000);
    
    if (duration < 60) return `${duration}s`;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds}s`;
  };

  const getPatchPreview = (patch?: string) => {
    if (!patch) return null;
    const lines = patch.split("\n").slice(0, 10); // First 10 lines
    return lines.join("\n");
  };
  if (steps.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <p className="text-sm text-foreground-muted">No steps yet</p>
      </div>
    );
  }

  return (
    <div className={cn("relative h-full flex flex-col", className)}>
      {/* Vertical connecting line - extends full height */}
      <div className="absolute left-[11px] top-0 bottom-0 w-px bg-border" />
      
      {/* Steps container - fills available space */}
      <div ref={containerRef} className="flex-1 flex flex-col justify-between py-1 overflow-y-auto scrollbar-thin">
        {steps.map((step, index) => {
          const isActive = step.status === "active";
          const isCompleted = step.status === "completed";
          const isError = step.status === "error";
          const isPending = step.status === "pending";
          const isFirst = index === 0;
          const isLast = index === steps.length - 1;

          return (
            <div
              key={step.id}
              ref={activeStepIndex === index ? activeStepRef : null}
              className={cn(
                "relative pl-8 fade-in flex-shrink-0 transition-all duration-300",
                isFirst && "pt-0",
                isLast && "pb-0",
                isActive && "scale-[1.02]"
              )}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              {/* Circle Icon Node */}
              <div
                className={cn(
                  "absolute left-0 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 bg-card transition-all duration-300 z-10",
                  isFirst ? "top-0" : "top-0",
                  isCompleted && "border-[#9ece6a] bg-[#9ece6a]",
                  isActive && "border-[#7aa2f7] bg-[#7aa2f7] ring-4 ring-[#7aa2f7]/20",
                  isError && "border-[#f7768e] bg-[#f7768e]",
                  isPending && "border-border bg-card"
                )}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3 text-[#1a1b26]" strokeWidth={3} />
                ) : isActive ? (
                  <Loader2 className="h-3 w-3 text-[#1a1b26] animate-spin" />
                ) : isError ? (
                  <XCircle className="h-3 w-3 text-[#1a1b26]" />
                ) : (
                  <Circle className="h-2.5 w-2.5 text-foreground-muted" />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div
                      className={cn(
                        "text-sm font-semibold transition-colors duration-200 leading-tight",
                        isActive && "text-foreground",
                        isCompleted && "text-[#9ece6a]",
                        isError && "text-[#f7768e]",
                        isPending && "text-foreground-muted"
                      )}
                    >
                      {step.label}
                    </div>
                    {step.description && (
                      <div className="mt-1.5 text-xs text-foreground-muted leading-relaxed">
                        {step.description}
                      </div>
                    )}
                    
                    {/* Time and Actions */}
                    <div className="mt-2 flex items-center gap-3 flex-wrap">
                      {/* Duration */}
                      {formatDuration(step.startedAt, step.completedAt) && (
                        <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                          <Clock className="h-3 w-3" />
                          <span className="font-mono">{formatDuration(step.startedAt, step.completedAt)}</span>
                        </div>
                      )}
                      
                      {/* Jump to Logs */}
                      {step.logs && step.logs.length > 0 && onJumpToLogs && (
                        <button
                          onClick={() => onJumpToLogs(index)}
                          className="flex items-center gap-1.5 text-xs text-[#7aa2f7] hover:text-[#7aa2f7]/80 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>View logs ({step.logs.length})</span>
                        </button>
                      )}
                      
                      {/* Expand/Collapse */}
                      {(step.logs && step.logs.length > 0) || step.thought || step.patch ? (
                        <button
                          onClick={() => toggleStep(step.id)}
                          className="flex items-center gap-1 text-xs text-foreground-muted hover:text-foreground transition-colors"
                        >
                          {expandedSteps.has(step.id) ? (
                            <>
                              <ChevronDown className="h-3 w-3" />
                              <span>Less</span>
                            </>
                          ) : (
                            <>
                              <ChevronRight className="h-3 w-3" />
                              <span>More</span>
                            </>
                          )}
                        </button>
                      ) : null}
                    </div>
                    
                    {/* Retry Indicator */}
                    {step.retryAttempts && step.retryAttempts > 0 && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-warning">
                        <div className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
                        <span>Retry attempt {step.retryAttempts}</span>
                      </div>
                    )}
                    
                    {/* Progress Bar - Only show for active steps */}
                    {isActive && step.expectedLogs && step.expectedLogs > 0 && (
                      <div className="mt-3">
                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#7aa2f7] rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${Math.min(
                                ((step.logs?.length || 0) / step.expectedLogs) * 100,
                                100
                              )}%`
                            }}
                          />
                        </div>
                        <div className="mt-1.5 text-[10px] text-foreground-muted font-mono">
                          {step.logs?.length || 0} / {step.expectedLogs}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Expanded Details */}
                {expandedSteps.has(step.id) && (
                  <div className="mt-3 pt-3 border-t border-border space-y-3 animate-in slide-in-from-top-2 duration-200">
                    {/* Thought/Reasoning */}
                    {step.thought && (
                      <div>
                        <div className="text-xs font-medium text-foreground-muted mb-1.5">Reasoning</div>
                        <div className="text-xs text-foreground-muted leading-relaxed bg-muted/30 rounded-md p-2">
                          {step.thought}
                        </div>
                      </div>
                    )}
                    
                    {/* Patch Preview */}
                    {step.patch && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="text-xs font-medium text-foreground-muted flex items-center gap-1.5">
                            <FileCode className="h-3 w-3" />
                            Patch Preview
                          </div>
                          {step.modifiedFiles && step.modifiedFiles.length > 0 && (
                            <div className="text-[10px] text-foreground-muted">
                              {step.modifiedFiles.length} file{step.modifiedFiles.length !== 1 ? "s" : ""}
                            </div>
                          )}
                        </div>
                        <div className="bg-background-alt rounded-md border border-border p-2 max-h-48 overflow-y-auto max-h-48 overflow-auto">
                          <pre className="text-[10px] font-mono leading-relaxed text-foreground-muted">
                            {getPatchPreview(step.patch)}
                            {step.patch.split("\n").length > 10 && (
                              <span className="text-foreground-muted/50">\n... ({step.patch.split("\n").length - 10} more lines)</span>
                            )}
                          </pre>
                        </div>
                        {step.modifiedFiles && step.modifiedFiles.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {step.modifiedFiles.map((file, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded text-foreground-muted"
                              >
                                {file}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Recent Logs */}
                    {step.logs && step.logs.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-foreground-muted mb-1.5">
                          Recent Logs ({step.logs.length} total)
                        </div>
                        <div className="space-y-0.5 max-h-32 overflow-y-auto scrollbar-thin">
                          {step.logs.slice(-5).map((log, logIdx) => {
                            const isError = log.toLowerCase().includes("error") || log.toLowerCase().includes("failed");
                            const isSuccess = log.toLowerCase().includes("success");
                            const isWarning = log.toLowerCase().includes("warn");
                            return (
                              <div
                                key={logIdx}
                                className={cn(
                                  "text-[10px] font-mono px-2 py-0.5 rounded",
                                  isError && "text-[#f7768e] bg-[#f7768e]/10",
                                  isSuccess && "text-[#9ece6a] bg-[#9ece6a]/10",
                                  isWarning && "text-[#ff9e64] bg-[#ff9e64]/10",
                                  !isError && !isSuccess && !isWarning && "text-foreground-muted"
                                )}
                              >
                                {log}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
