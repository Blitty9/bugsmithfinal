"use client";

import { useEffect, useState } from "react";
import { Activity, Zap, Clock, DollarSign, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricsPanelProps {
  startTime?: string;
  endTime?: string;
  status: "idle" | "running" | "completed" | "error";
  className?: string;
}

export function MetricsPanel({ startTime, endTime, status, className }: MetricsPanelProps) {
  const [elapsedTime, setElapsedTime] = useState<string>("0s");
  const [processingSpeed, setProcessingSpeed] = useState<number>(0);

  // Calculate elapsed time
  useEffect(() => {
    if (!startTime) {
      setElapsedTime("0s");
      return;
    }

    const updateElapsed = () => {
      const start = new Date(startTime);
      const end = endTime ? new Date(endTime) : new Date();
      const diff = Math.floor((end.getTime() - start.getTime()) / 1000);

      if (diff < 60) {
        setElapsedTime(`${diff}s`);
      } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        const seconds = diff % 60;
        setElapsedTime(`${minutes}m ${seconds}s`);
      } else {
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        setElapsedTime(`${hours}h ${minutes}m`);
      }

      // Calculate processing speed (steps per minute)
      if (status === "running" && diff > 0) {
        // Estimate based on typical step duration
        const estimatedSteps = Math.max(1, Math.floor(diff / 30)); // ~30s per step
        setProcessingSpeed(estimatedSteps);
      }
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [startTime, endTime, status]);

  // Estimate metrics (in a real app, these would come from the API)
  const estimatedTokens = status === "running" ? Math.floor(Date.now() / 1000) * 50 : 0;
  const estimatedApiCalls = status === "running" ? Math.floor(Date.now() / 1000) / 10 : 0;
  
  // Cost estimation (rough estimate: $0.002 per 1K tokens for GPT-4)
  const estimatedCost = (estimatedTokens / 1000) * 0.002;

  if (status === "idle") {
    return null;
  }

  return (
    <div className={cn("bg-card rounded-lg border border-border p-3 space-y-2", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Activity className="h-3.5 w-3.5 text-[#7aa2f7]" />
        <span className="text-xs font-semibold text-foreground">Metrics</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {/* Elapsed Time */}
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-foreground-muted shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-foreground-muted">Time</div>
            <div className="text-xs font-mono text-foreground truncate">{elapsedTime}</div>
          </div>
        </div>

        {/* Processing Speed */}
        {status === "running" && processingSpeed > 0 && (
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-foreground-muted shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-foreground-muted">Speed</div>
              <div className="text-xs font-mono text-foreground truncate">
                ~{processingSpeed} steps/min
              </div>
            </div>
          </div>
        )}

        {/* Estimated Tokens */}
        {status === "running" && (
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-foreground-muted shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-foreground-muted">Tokens</div>
              <div className="text-xs font-mono text-foreground truncate">
                ~{estimatedTokens.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* API Calls */}
        {status === "running" && (
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-foreground-muted shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-foreground-muted">API Calls</div>
              <div className="text-xs font-mono text-foreground truncate">
                ~{Math.floor(estimatedApiCalls)}
              </div>
            </div>
          </div>
        )}

        {/* Estimated Cost */}
        {status === "running" && estimatedCost > 0 && (
          <div className="flex items-center gap-2 col-span-2">
            <DollarSign className="h-3.5 w-3.5 text-foreground-muted shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-foreground-muted">Est. Cost</div>
              <div className="text-xs font-mono text-foreground truncate">
                ${estimatedCost.toFixed(4)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

