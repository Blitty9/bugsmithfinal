"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface LogViewerProps {
  logs: string[];
  className?: string;
  autoScroll?: boolean;
}

export function LogViewer({ logs, className, autoScroll = true }: LogViewerProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  return (
    <div
      className={cn(
        "h-full overflow-y-auto rounded-md border border-[#21262D] bg-[#0D1117] p-4 font-mono text-sm",
        className
      )}
    >
      <div className="space-y-1">
        {logs.map((log, index) => (
          <div
            key={index}
            className={cn(
              "whitespace-pre-wrap break-words",
              log.includes("ERROR") || log.includes("error")
                ? "text-red-400"
                : log.includes("WARN") || log.includes("warn")
                ? "text-yellow-400"
                : log.includes("INFO") || log.includes("info")
                ? "text-blue-400"
                : log.includes("SUCCESS") || log.includes("success")
                ? "text-green-400"
                : "text-[#8B949E]"
            )}
          >
            {log}
          </div>
        ))}
      </div>
      <div ref={logEndRef} />
    </div>
  );
}

