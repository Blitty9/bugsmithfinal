"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Terminal, Circle, ChevronUp, Search, X, Copy, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogStreamProps {
  logs: string[];
  className?: string;
  autoScroll?: boolean;
  onToggleCollapse?: () => void;
}

type LogLevel = "all" | "error" | "warning" | "info" | "success";

export function LogStream({ logs, className, autoScroll = true, onToggleCollapse }: LogStreamProps) {
  const logEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<LogLevel>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [logs, autoScroll]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    if (showExportMenu) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showExportMenu]);

  const getLogLevel = (log: string): LogLevel => {
    const lowerLog = log.toLowerCase();
    if (lowerLog.includes("[error]") || lowerLog.includes("error") || lowerLog.includes("failed") || lowerLog.includes("✗")) {
      return "error";
    }
    if (lowerLog.includes("[warn]") || lowerLog.includes("warn")) {
      return "warning";
    }
    if (lowerLog.includes("[success]") || lowerLog.includes("success") || lowerLog.includes("✓") || lowerLog.includes("completed")) {
      return "success";
    }
    if (lowerLog.includes("[info]") || lowerLog.includes("info") || lowerLog.includes("→") || lowerLog.includes("running")) {
      return "info";
    }
    return "all";
  };

  const getLogStyles = (log: string) => {
    const level = getLogLevel(log);
    switch (level) {
      case "error":
        return { text: "text-[#f7768e]" };  /* Tokyo Night Red */
      case "warning":
        return { text: "text-[#ff9e64]" };  /* Tokyo Night Orange */
      case "success":
        return { text: "text-[#9ece6a]" };  /* Tokyo Night Green */
      case "info":
        return { text: "text-[#7aa2f7]" };  /* Tokyo Night Blue */
      default:
        return { text: "text-foreground-muted" };
    }
  };

  // Filter and search logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Level filter
      if (filterLevel !== "all") {
        const level = getLogLevel(log);
        if (level !== filterLevel) return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!log.toLowerCase().includes(query)) return false;
      }
      
      return true;
    });
  }, [logs, filterLevel, searchQuery]);

  // Count logs by level
  const logCounts = useMemo(() => {
    return {
      all: logs.length,
      error: logs.filter((log) => getLogLevel(log) === "error").length,
      warning: logs.filter((log) => getLogLevel(log) === "warning").length,
      info: logs.filter((log) => getLogLevel(log) === "info").length,
      success: logs.filter((log) => getLogLevel(log) === "success").length,
    };
  }, [logs]);

  const copyLogLine = async (log: string) => {
    try {
      await navigator.clipboard.writeText(log);
    } catch (error) {
      console.error("Failed to copy log:", error);
    }
  };

  const copyAllLogs = async () => {
    try {
      await navigator.clipboard.writeText(logs.join("\n"));
    } catch (error) {
      console.error("Failed to copy logs:", error);
    }
  };

  const exportLogs = (format: "text" | "json") => {
    const data = format === "json" 
      ? JSON.stringify(logs, null, 2)
      : logs.join("\n");
    
    const blob = new Blob([data], { type: format === "json" ? "application/json" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bugsmith-logs-${new Date().toISOString()}.${format === "json" ? "json" : "txt"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      data-log-stream
      className={cn(
        "rounded-xl border border-border overflow-hidden flex flex-col shadow-sm h-full",
        className
      )}
      style={{ backgroundColor: "hsl(225 27% 8%)" }}
    >
      {/* Header Bar */}
      <div className="border-b border-border bg-card shrink-0">
        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Terminal className="h-4 w-4 text-[#7aa2f7]" />
            <span className="text-section-label">Output</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-foreground-muted">
              {filteredLogs.length} / {logs.length} lines
            </span>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#f7768e]/60" title={`${logCounts.error} errors`} />
              <div className="h-2.5 w-2.5 rounded-full bg-[#ff9e64]/60" title={`${logCounts.warning} warnings`} />
              <div className="h-2.5 w-2.5 rounded-full bg-[#9ece6a]/60" title={`${logCounts.success} successes`} />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-7 px-2 flex items-center gap-1.5 rounded-md hover:bg-muted transition-colors text-xs",
                showFilters && "bg-muted"
              )}
              title="Toggle filters"
            >
              <Filter className="h-3.5 w-3.5 text-foreground-muted" />
            </button>
            <button
              onClick={copyAllLogs}
              className="h-7 px-2 flex items-center gap-1.5 rounded-md hover:bg-muted transition-colors text-xs"
              title="Copy all logs"
            >
              <Copy className="h-3.5 w-3.5 text-foreground-muted" />
            </button>
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExportMenu(!showExportMenu);
                }}
                className="h-7 px-2 flex items-center gap-1.5 rounded-md hover:bg-muted transition-colors text-xs"
                title="Export logs"
              >
                <Download className="h-3.5 w-3.5 text-foreground-muted" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-[140px]">
                  <button
                    onClick={() => {
                      exportLogs("text");
                      setShowExportMenu(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-muted transition-colors"
                  >
                    Export as TXT
                  </button>
                  <button
                    onClick={() => {
                      exportLogs("json");
                      setShowExportMenu(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-muted transition-colors border-t border-border"
                  >
                    Export as JSON
                  </button>
                </div>
              )}
            </div>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-muted transition-colors ml-2"
                title="Collapse"
              >
                <ChevronUp className="h-4 w-4 text-foreground-muted" />
              </button>
            )}
          </div>
        </div>
        
        {/* Filter Bar */}
        {showFilters && (
          <div className="px-5 py-2.5 border-t border-border bg-background-alt/50 flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="w-full pl-8 pr-8 py-1.5 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center rounded hover:bg-muted"
                >
                  <X className="h-3 w-3 text-foreground-muted" />
                </button>
              )}
            </div>
            
            {/* Level Filters */}
            <div className="flex items-center gap-1.5">
              {(["all", "error", "warning", "info", "success"] as LogLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setFilterLevel(level)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-md transition-colors capitalize",
                    filterLevel === level
                      ? level === "error"
                        ? "bg-[#f7768e]/20 text-[#f7768e] border border-[#f7768e]/30"
                        : level === "warning"
                        ? "bg-[#ff9e64]/20 text-[#ff9e64] border border-[#ff9e64]/30"
                        : level === "info"
                        ? "bg-[#7aa2f7]/20 text-[#7aa2f7] border border-[#7aa2f7]/30"
                        : level === "success"
                        ? "bg-[#9ece6a]/20 text-[#9ece6a] border border-[#9ece6a]/30"
                        : "bg-muted text-foreground border border-border"
                      : "hover:bg-muted text-foreground-muted border border-transparent"
                  )}
                >
                  {level === "all" ? "All" : level}
                  {level !== "all" && (
                    <span className="ml-1.5 text-[10px] opacity-70">({logCounts[level]})</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Log Area */}
      <div 
        ref={containerRef}
        className="flex-1 min-h-0 overflow-y-auto px-5 py-4 scrollbar-visible"
      >
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Circle className="h-5 w-5 text-foreground-muted" />
            </div>
            <p className="text-body-muted">Waiting for output...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-5 w-5 text-foreground-muted" />
            </div>
            <p className="text-body-muted">No logs match the current filters</p>
            {(filterLevel !== "all" || searchQuery) && (
              <button
                onClick={() => {
                  setFilterLevel("all");
                  setSearchQuery("");
                }}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredLogs.map((log, filteredIndex) => {
              const originalIndex = logs.indexOf(log);
              const styles = getLogStyles(log);
              const isHighlighted = searchQuery && log.toLowerCase().includes(searchQuery.toLowerCase());
              
              return (
                <div
                  key={`${originalIndex}-${filteredIndex}`}
                  className={cn(
                    "fade-in flex items-start gap-4 py-0.5 group hover:bg-muted/30 transition-colors",
                    isHighlighted && "bg-primary/5"
                  )}
                  style={{ 
                    animationDelay: `${Math.min(filteredIndex * 20, 300)}ms`,
                    opacity: 0
                  }}
                >
                  <span className="select-none font-mono text-xs w-8 text-right shrink-0 pt-0.5 tabular-nums" style={{ color: "rgba(122, 162, 247, 0.3)" }}>
                    {originalIndex + 1}
                  </span>
                  <span className={cn("text-terminal whitespace-pre-wrap break-all flex-1", styles.text)}>
                    {searchQuery ? (
                      <span>
                        {log.split(new RegExp(`(${searchQuery})`, "gi")).map((part, i) => 
                          part.toLowerCase() === searchQuery.toLowerCase() ? (
                            <mark key={i} className="bg-primary/30 text-foreground px-0.5 rounded">
                              {part}
                            </mark>
                          ) : (
                            part
                          )
                        )}
                      </span>
                    ) : (
                      log
                    )}
                  </span>
                  <button
                    onClick={() => copyLogLine(log)}
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded hover:bg-muted transition-all shrink-0"
                    title="Copy line"
                  >
                    <Copy className="h-3 w-3 text-foreground-muted" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <div ref={logEndRef} className="h-4" />
      </div>
    </div>
  );
}
