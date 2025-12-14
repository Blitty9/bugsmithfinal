"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/stepper";
import { LogStream } from "@/components/log-stream";
import { ThoughtPanel } from "@/components/thought-panel";
import { IssueCard } from "@/components/issue-card";
import { PatchPreview } from "@/components/patch-preview";
import { MetricsPanel } from "@/components/metrics-panel";
import { Play, Square, RotateCcw, GitBranch, FolderGit2, Terminal, AlertCircle, Info, ArrowUpDown, X, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { useAgent } from "@/contexts/agent-context";
import { useToast } from "@/contexts/toast-context";
import { cn } from "@/lib/utils";

const COLLAPSE_PREFS_KEY = "bugsmith_panel_collapse_prefs";

export default function AgentRunPage() {
  const { state, runAgent, resetAgent, isRunning, setCurrentIssue, toggleIgnoreIssue, sortIssues, approvePatch, rejectPatch } = useAgent();
  const { showSuccess, showError, showInfo, showWarning } = useToast();
  const [sortBy, setSortBy] = useState<"difficulty" | "date" | "priority">("difficulty");
  const [collapsedPanels, setCollapsedPanels] = useState<{
    pipeline: boolean;
    logs: boolean;
    thoughts: boolean;
  }>(() => {
    // Load from localStorage
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(COLLAPSE_PREFS_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (error) {
        console.error("Failed to load collapse preferences:", error);
      }
    }
    return { pipeline: false, logs: false, thoughts: false };
  });

  // Save preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_PREFS_KEY, JSON.stringify(collapsedPanels));
    } catch (error) {
      console.error("Failed to save collapse preferences:", error);
    }
  }, [collapsedPanels]);

  const togglePanel = (panel: "pipeline" | "logs" | "thoughts") => {
    setCollapsedPanels((prev) => ({
      ...prev,
      [panel]: !prev[panel],
    }));
  };

  // Get all logs from all steps
  const allLogs = state.steps.flatMap((step) => step.logs);

  // Get current step's thought
  const currentThought = state.currentStepIndex >= 0 
    ? state.steps[state.currentStepIndex]?.thought || ""
    : "";

  // Convert agent steps to stepper format
  const stepperSteps = state.steps.map((step) => ({
    id: step.id,
    label: step.title,
    description: step.description,
    status: step.status,
    logs: step.logs,
    expectedLogs: step.expectedLogs,
    retryAttempts: state.retryState?.attempt || 0,
    startedAt: step.startedAt,
    completedAt: step.completedAt,
    thought: step.thought,
    patch: state.pendingPatch?.stepIndex === state.steps.indexOf(step) ? state.pendingPatch.patch : undefined,
    modifiedFiles: state.pendingPatch?.stepIndex === state.steps.indexOf(step) ? state.pendingPatch.modifiedFiles : undefined,
  }));

  // Jump to logs in the log stream
  const handleJumpToLogs = (stepIndex: number) => {
    const step = state.steps[stepIndex];
    if (step && step.logs.length > 0) {
      // Scroll to log stream and highlight
      const logStream = document.querySelector('[data-log-stream]');
      if (logStream) {
        logStream.scrollIntoView({ behavior: "smooth", block: "start" });
        // Could add highlighting logic here
      }
      showInfo(`Viewing logs for: ${step.title}`);
    }
  };

  const handleRunAgent = async () => {
    if (isRunning) {
      // Immediately stop and reset
      resetAgent();
      showInfo("Agent stopped");
    } else {
      if (!state.currentIssue) {
        showWarning("Please select an issue first");
        return;
      }
      showInfo("Starting agent...");
      await runAgent();
    }
  };

  // Show toasts on status changes
  useEffect(() => {
    if (state.status === "completed") {
      showSuccess("Agent run completed successfully!");
    } else if (state.status === "error" && state.errorMessage) {
      showError(state.errorMessage);
    }
  }, [state.status, state.errorMessage, showSuccess, showError]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Compact Header */}
      <div className="shrink-0 bg-card/50 border-b border-border backdrop-blur-sm fade-in-down">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7aa2f7]/10 border border-[#7aa2f7]/20 scale-in">
                <Terminal className="h-5 w-5 text-[#7aa2f7]" />
              </div>
              <div>
                <h1 className="text-xl font-light tracking-tight text-foreground">Agent Run</h1>
              </div>
              
              {/* Current Issue - Inline */}
              {state.currentIssue && (
                <div className="flex items-center gap-2 ml-6 pl-6 border-l border-border fade-in">
                  <AlertCircle className="h-4 w-4 text-[#7aa2f7]" />
                  <span className="text-sm text-foreground-muted">Issue</span>
                  <span className="font-mono text-sm text-foreground">#{state.currentIssue.number || state.currentIssue.id}</span>
                  <span className="text-sm text-foreground-muted truncate max-w-[300px]">{state.currentIssue.title}</span>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {state.currentRepo && (
                <div className="flex items-center gap-4 mr-3 fade-in-right">
                  <div className="flex items-center gap-1.5">
                    <FolderGit2 className="h-3.5 w-3.5 text-foreground-muted" />
                    <span className="font-mono text-xs text-foreground">{state.currentRepo}</span>
                  </div>
                  {state.branchName && (
                    <div className="flex items-center gap-1.5">
                      <GitBranch className="h-3.5 w-3.5 text-foreground-muted" />
                      <span className="font-mono text-xs text-foreground">{state.branchName}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Metrics Panel */}
              {(state.status === "running" || state.status === "completed" || state.status === "error") && (
                <MetricsPanel
                  startTime={state.startTime}
                  endTime={state.endTime}
                  status={state.status}
                  className="mr-2"
                />
              )}
              
              {!isRunning ? (
                <Button size="sm" onClick={handleRunAgent} className="gap-1.5 hover-scale font-medium h-8">
                  <Play className="h-3.5 w-3.5" />
                  Start
                </Button>
              ) : (
                <Button size="sm" variant="destructive" onClick={handleRunAgent} className="gap-1.5 hover-scale font-medium h-8">
                  <Square className="h-3.5 w-3.5" />
                  Stop
                </Button>
              )}
              {/* Show reset button when completed, or when patch is rejected/accepted */}
              {(state.status === "completed" || 
                (state.status === "error" && state.errorMessage && (
                  state.errorMessage.includes("Patch was rejected") || 
                  state.errorMessage.includes("rejected by user")
                )) ||
                (state.status === "running" && !state.pendingPatch && state.currentStepIndex >= 4 && state.steps[4]?.status === "completed")) && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    resetAgent();
                    showInfo("Agent reset");
                  }} 
                  className="gap-1.5 hover-scale font-medium h-8"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message Banner */}
      {state.errorMessage && (
        <div className="shrink-0 px-6 py-3 bg-[#ff9e64]/10 border-b border-[#ff9e64]/20 fade-in">
          <div className="flex items-center gap-2.5">
            <Info className="h-4 w-4 text-[#ff9e64] shrink-0" />
            <p className="text-sm text-foreground">{state.errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Content - Fills remaining space exactly */}
      <div className="flex-1 min-h-0 p-4 flex flex-col">
        {/* Show Issue Selection when idle and no issues selected, or when idle with issues available */}
        {state.status === "idle" && state.issues.length > 0 && (
          <div className="fade-in mb-4">
            <div className="bg-card rounded-xl border border-border shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-section-label mb-1">Select Issue</h2>
                  <p className="text-sm text-foreground-muted">
                    Choose an issue to fix. {state.currentIssue && "Click another issue to change selection."}
                  </p>
                </div>
                {state.currentIssue && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      Selected: #{state.currentIssue.number || state.currentIssue.id}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Sort and Filter Controls */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-foreground-muted" />
                  <span className="text-xs text-foreground-muted">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      const newSort = e.target.value as "difficulty" | "date" | "priority";
                      setSortBy(newSort);
                      sortIssues(newSort);
                    }}
                    className="text-xs bg-background border border-border rounded-md px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="difficulty">Difficulty</option>
                    <option value="date">Date (Newest)</option>
                    <option value="priority">Priority Order</option>
                  </select>
                </div>
                {state.ignoredIssues && state.ignoredIssues.length > 0 && (
                  <div className="text-xs text-foreground-muted">
                    {state.ignoredIssues.length} issue{state.ignoredIssues.length !== 1 ? "s" : ""} ignored
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto scrollbar-thin">
                {state.issues
                  .filter((issue) => !state.ignoredIssues?.includes(issue.id))
                  .map((issue) => {
                    const isSelected = state.currentIssue?.id === issue.id;
                    const isIgnored = state.ignoredIssues?.includes(issue.id);
                    
                    if (isIgnored) return null;
                    
                    return (
                      <div
                        key={issue.id}
                        className={cn(
                          "relative",
                          isSelected ? "ring-2 ring-primary rounded-lg" : ""
                        )}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleIgnoreIssue(issue.id);
                          }}
                          className="absolute top-2 right-2 z-10 h-6 w-6 flex items-center justify-center rounded-md bg-background/80 border border-border hover:bg-destructive/10 hover:border-destructive/30 transition-colors"
                          title="Skip this issue"
                        >
                          <X className="h-3.5 w-3.5 text-foreground-muted hover:text-destructive" />
                        </button>
                        <IssueCard
                          issue={issue}
                          onClick={() => setCurrentIssue(issue)}
                          className={isSelected ? "border-primary/40 bg-primary/5" : ""}
                        />
                      </div>
                    );
                  })}
              </div>
              
              {/* Show ignored issues section if any */}
              {state.ignoredIssues && state.ignoredIssues.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-foreground-muted">Ignored Issues</span>
                    <button
                      onClick={() => {
                        state.ignoredIssues?.forEach((id) => toggleIgnoreIssue(id));
                      }}
                      className="text-xs text-foreground-muted hover:text-foreground transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {state.issues
                      .filter((issue) => state.ignoredIssues?.includes(issue.id))
                      .map((issue) => (
                        <button
                          key={issue.id}
                          onClick={() => toggleIgnoreIssue(issue.id)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted hover:bg-muted/80 border border-border text-xs text-foreground-muted hover:text-foreground transition-colors"
                        >
                          <span>#{issue.number || issue.id}</span>
                          <CheckCircle2 className="h-3 w-3" />
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Show "No Issues" message when idle and no issues */}
        {state.status === "idle" && state.issues.length === 0 && (
          <div className="flex-1 flex items-center justify-center fade-in">
            <div className="text-center max-w-md">
              <AlertCircle className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Issues Available</h3>
              <p className="text-sm text-foreground-muted mb-4">
                Go to the Issues page to fetch issues from a repository, then return here to run the agent.
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.href = "/issues"}
                className="gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Go to Issues Page
              </Button>
            </div>
          </div>
        )}

        {/* Show Pipeline/Logs/Thoughts when running or completed */}
        {(state.status === "running" || state.status === "completed" || state.status === "error") && (
          <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[280px_1fr_260px] gap-4">
            {/* Left Panel - Pipeline Steps */}
            <div className={cn(
              "fade-in h-full flex flex-col transition-all duration-300",
              collapsedPanels.pipeline && "xl:col-span-1"
            )} style={{ animationDelay: "0.05s" }}>
              <div className="h-full bg-card rounded-xl border border-border shadow-sm flex flex-col">
                <div className="px-5 pt-4 pb-3.5 border-b border-border shrink-0 flex items-center justify-between">
                  <h2 className="text-section-label">
                    Pipeline
                  </h2>
                  <button
                    onClick={() => togglePanel("pipeline")}
                    className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
                    title={collapsedPanels.pipeline ? "Expand" : "Collapse"}
                  >
                    {collapsedPanels.pipeline ? (
                      <ChevronDown className="h-4 w-4 text-foreground-muted" />
                    ) : (
                      <ChevronUp className="h-4 w-4 text-foreground-muted" />
                    )}
                  </button>
                </div>
                {!collapsedPanels.pipeline && (
                  <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 scrollbar-thin">
                    <Stepper 
                      steps={stepperSteps} 
                      activeStepIndex={state.currentStepIndex}
                      onJumpToLogs={handleJumpToLogs}
                    />
                  </div>
                )}
                {collapsedPanels.pipeline && (
                  <div className="flex-1 flex items-center justify-center">
                    <button
                      onClick={() => togglePanel("pipeline")}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <ChevronDown className="h-4 w-4 text-foreground-muted" />
                      <span className="text-sm text-foreground-muted">Expand Pipeline</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Middle Panel - Terminal Output (Dominant) */}
            <div className={cn(
              "fade-in h-full flex flex-col transition-all duration-300",
              collapsedPanels.logs && "xl:col-span-1"
            )} style={{ animationDelay: "0.1s" }}>
              {collapsedPanels.logs ? (
                <div className="h-full bg-card rounded-xl border border-border shadow-sm flex items-center justify-center">
                  <button
                    onClick={() => togglePanel("logs")}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ChevronDown className="h-4 w-4 text-foreground-muted" />
                    <span className="text-sm text-foreground-muted">Expand Output</span>
                  </button>
                </div>
              ) : (
                <LogStream logs={allLogs} className="h-full" onToggleCollapse={() => togglePanel("logs")} />
              )}
            </div>

            {/* Right Panel - Agent Thoughts */}
            <div className={cn(
              "fade-in h-full flex flex-col transition-all duration-300",
              collapsedPanels.thoughts && "xl:col-span-1"
            )} style={{ animationDelay: "0.15s" }}>
              {collapsedPanels.thoughts ? (
                <div className="h-full bg-card rounded-xl border border-border shadow-sm flex items-center justify-center">
                  <button
                    onClick={() => togglePanel("thoughts")}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ChevronDown className="h-4 w-4 text-foreground-muted" />
                    <span className="text-sm text-foreground-muted">Expand Reasoning</span>
                  </button>
                </div>
              ) : (
                <ThoughtPanel thought={currentThought} className="h-full flex-1 min-h-0" onToggleCollapse={() => togglePanel("thoughts")} />
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Patch Preview Dialog */}
      {state.pendingPatch && (
        <PatchPreview
          patch={state.pendingPatch.patch}
          modifiedFiles={state.pendingPatch.modifiedFiles}
          onApprove={approvePatch}
          onReject={rejectPatch}
          open={!!state.pendingPatch}
        />
      )}
    </div>
  );
}
