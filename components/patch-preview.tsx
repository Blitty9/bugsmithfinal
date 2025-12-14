"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, FileCode, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatchPreviewProps {
  patch: string;
  modifiedFiles: string[];
  onApprove: () => void;
  onReject: () => void;
  open: boolean;
}

export function PatchPreview({ patch, modifiedFiles, onApprove, onReject, open }: PatchPreviewProps) {
  const patchLines = patch.split("\n");
  
  const getLineStyle = (line: string) => {
    if (line.startsWith("+++") || line.startsWith("---")) {
      return "text-[#7aa2f7]"; // Tokyo Night Blue
    }
    if (line.startsWith("@@")) {
      return "text-[#bb9af7]"; // Tokyo Night Purple
    }
    if (line.startsWith("+")) {
      return "text-[#9ece6a] bg-[#9ece6a]/10"; // Tokyo Night Green
    }
    if (line.startsWith("-")) {
      return "text-[#f7768e] bg-[#f7768e]/10"; // Tokyo Night Red
    }
    return "text-foreground-muted";
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        // When dialog is closed (X button or ESC), reject the patch
        if (!isOpen) {
          onReject();
        }
      }}
    >
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-[#7aa2f7]" />
            Patch Preview
          </DialogTitle>
          <DialogDescription>
            Review the changes before applying. You can approve or reject this patch.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 flex flex-col space-y-4">
          {/* Modified Files */}
          {modifiedFiles.length > 0 && (
            <div className="shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-foreground-muted" />
                <span className="text-sm font-medium text-foreground">Files to be modified:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {modifiedFiles.map((file) => (
                  <span
                    key={file}
                    className="px-2 py-1 rounded-md bg-muted text-xs font-mono text-foreground-muted"
                  >
                    {file}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Patch Diff */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <span className="text-xs font-medium text-foreground-muted">Unified Diff</span>
              <span className="text-xs text-foreground-muted">
                {patchLines.length} line{patchLines.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto bg-background-alt rounded-lg border border-border p-4 scrollbar-visible">
              <pre className="text-xs font-mono leading-relaxed">
                {patchLines.map((line, index) => (
                  <div
                    key={index}
                    className={cn(
                      "py-0.5 px-1 rounded",
                      getLineStyle(line),
                      line.startsWith("+") && "bg-[#9ece6a]/5",
                      line.startsWith("-") && "bg-[#f7768e]/5"
                    )}
                  >
                    <span className="select-none text-foreground-muted/30 mr-2 tabular-nums">
                      {String(index + 1).padStart(4, " ")}
                    </span>
                    {line}
                  </div>
                ))}
              </pre>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border shrink-0">
            <Button
              variant="outline"
              onClick={onReject}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={onApprove}
              className="gap-2 bg-[#9ece6a] hover:bg-[#9ece6a]/80 text-[#1a1b26]"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve & Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

