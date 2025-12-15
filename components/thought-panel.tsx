"use client";

import { useState } from "react";
import { FileCode, Brain, ChevronUp, Copy, Download, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ThoughtPanelProps {
  thought: string;
  className?: string;
  onToggleCollapse?: () => void;
}

// Simple code block detection and highlighting
const detectCodeBlocks = (text: string): Array<{ type: "text" | "code"; content: string; language?: string }> => {
  const parts: Array<{ type: "text" | "code"; content: string; language?: string }> = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.substring(lastIndex, match.index) });
    }
    // Add code block
    parts.push({
      type: "code",
      content: match[2],
      language: match[1] || "text",
    });
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.substring(lastIndex) });
  }

  // If no code blocks found, return entire text as text
  if (parts.length === 0) {
    parts.push({ type: "text", content: text });
  }

  return parts;
};

// Simple syntax highlighting for common patterns
const highlightCode = (code: string, language?: string): string => {
  let highlighted = code;

  // Basic keyword highlighting
  const keywords = /\b(const|let|var|function|if|else|for|while|return|class|import|export|async|await|try|catch|finally|throw|new|this|super|extends|implements|interface|type|enum|namespace|module|declare|public|private|protected|static|readonly|abstract|override|get|set)\b/g;
  highlighted = highlighted.replace(keywords, '<span class="text-[#7aa2f7]">$&</span>');

  // String highlighting
  highlighted = highlighted.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, '<span class="text-[#9ece6a]">$&</span>');

  // Number highlighting
  highlighted = highlighted.replace(/\b\d+\.?\d*\b/g, '<span class="text-[#ff9e64]">$&</span>');

  // Comment highlighting
  highlighted = highlighted.replace(/\/\/.*$/gm, '<span class="text-foreground-muted/60">$&</span>');
  highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, '<span class="text-foreground-muted/60">$&</span>');

  // Function/class name highlighting
  highlighted = highlighted.replace(/\b([A-Z][a-zA-Z0-9]*)\b/g, '<span class="text-[#bb9af7]">$1</span>');

  return highlighted;
};

export function ThoughtPanel({ thought, className, onToggleCollapse }: ThoughtPanelProps) {
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [copiedSection, setCopiedSection] = useState<number | null>(null);

  const copyThought = async () => {
    try {
      await navigator.clipboard.writeText(thought);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const copySection = async (sectionIndex: number, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedSection(sectionIndex);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      console.error("Failed to copy section:", error);
    }
  };

  const exportAsMarkdown = () => {
    const markdown = `# Agent Reasoning\n\n${thought}\n\n---\n\n*Exported from BugSmith Agent Run*`;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bugsmith-reasoning-${new Date().toISOString()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Split thought into sections (by double newlines or specific markers)
  const sections = thought
    ? thought.split(/\n\n+/).filter((s) => s.trim().length > 0)
    : [];

  const codeParts = thought ? detectCodeBlocks(thought) : [];

  return (
    <div className={cn("bg-card rounded-xl border border-border shadow-sm flex flex-col", className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#bb9af7]/10 border border-[#bb9af7]/20">
              <FileCode className="h-4 w-4 text-[#bb9af7]" />
            </div>
            <span className="text-section-label">Reasoning</span>
          </div>
          <div className="flex items-center gap-1.5">
            {thought && (
              <>
                <button
                  onClick={copyThought}
                  className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
                  title="Copy all"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-[#9ece6a]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-foreground-muted" />
                  )}
                </button>
                <button
                  onClick={exportAsMarkdown}
                  className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
                  title="Export as Markdown"
                >
                  <Download className="h-3.5 w-3.5 text-foreground-muted" />
                </button>
              </>
            )}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
                title="Collapse"
              >
                <ChevronUp className="h-4 w-4 text-foreground-muted" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          {thought ? (
          <div className="fade-in space-y-3">
            {codeParts.length > 1 ? (
              // Render with code blocks
              codeParts.map((part, index) => {
                if (part.type === "code") {
                  return (
                    <div key={index} className="relative group">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono text-foreground-muted uppercase">
                          {part.language || "code"}
                        </span>
                        <button
                          onClick={() => copySection(index, part.content)}
                          className="opacity-0 group-hover:opacity-100 h-5 w-5 flex items-center justify-center rounded hover:bg-muted transition-all"
                          title="Copy code"
                        >
                          {copiedSection === index ? (
                            <Check className="h-3 w-3 text-[#9ece6a]" />
                          ) : (
                            <Copy className="h-3 w-3 text-foreground-muted" />
                          )}
                        </button>
                      </div>
                      <pre className="bg-background-alt rounded-md border border-border p-3 overflow-x-auto">
                        <code
                          className="text-xs font-mono leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: highlightCode(part.content, part.language) }}
                        />
                      </pre>
                    </div>
                  );
                } else {
                  // Regular text - split into collapsible sections
                  const textSections = part.content.split(/\n\n+/).filter((s) => s.trim().length > 0);
                  return (
                    <div key={index} className="space-y-2">
                      {textSections.map((section, sectionIndex) => {
                        const globalIndex = index * 100 + sectionIndex;
                        const isExpanded = expandedSections.has(globalIndex);
                        const shouldCollapse = section.length > 200; // Collapse long sections

                        return (
                          <div key={sectionIndex} className="relative group">
                            {shouldCollapse ? (
                              <>
                                <button
                                  onClick={() => toggleSection(globalIndex)}
                                  className="w-full flex items-center gap-2 text-left text-sm leading-relaxed text-foreground-muted hover:text-foreground transition-colors"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                  ) : (
                                    <ChevronDown className="h-3.5 w-3.5 shrink-0 mt-0.5 rotate-[-90deg]" />
                                  )}
                                  <span className="flex-1">
                                    {isExpanded ? section : `${section.substring(0, 200)}...`}
                                  </span>
                                </button>
                                <button
                                  onClick={() => copySection(globalIndex, section)}
                                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 h-5 w-5 flex items-center justify-center rounded hover:bg-muted transition-all"
                                  title="Copy section"
                                >
                                  {copiedSection === globalIndex ? (
                                    <Check className="h-3 w-3 text-[#9ece6a]" />
                                  ) : (
                                    <Copy className="h-3 w-3 text-foreground-muted" />
                                  )}
                                </button>
                              </>
                            ) : (
                              <div className="relative group">
                                <p className="text-sm leading-relaxed text-foreground-muted">{section}</p>
                                <button
                                  onClick={() => copySection(globalIndex, section)}
                                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 h-5 w-5 flex items-center justify-center rounded hover:bg-muted transition-all"
                                  title="Copy section"
                                >
                                  {copiedSection === globalIndex ? (
                                    <Check className="h-3 w-3 text-[#9ece6a]" />
                                  ) : (
                                    <Copy className="h-3 w-3 text-foreground-muted" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                }
              })
            ) : (
              // Simple text rendering with collapsible sections
              sections.map((section, index) => {
                const isExpanded = expandedSections.has(index);
                const shouldCollapse = section.length > 200;

                return (
                  <div key={index} className="relative group">
                    {shouldCollapse ? (
                      <>
                        <button
                          onClick={() => toggleSection(index)}
                          className="w-full flex items-center gap-2 text-left text-sm leading-relaxed text-foreground-muted hover:text-foreground transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 shrink-0 mt-0.5 rotate-[-90deg]" />
                          )}
                          <span className="flex-1">
                            {isExpanded ? section : `${section.substring(0, 200)}...`}
                          </span>
                        </button>
                        <button
                          onClick={() => copySection(index, section)}
                          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 h-5 w-5 flex items-center justify-center rounded hover:bg-muted transition-all"
                          title="Copy section"
                        >
                          {copiedSection === index ? (
                            <Check className="h-3 w-3 text-[#9ece6a]" />
                          ) : (
                            <Copy className="h-3 w-3 text-foreground-muted" />
                          )}
                        </button>
                      </>
                    ) : (
                      <div className="relative group">
                        <p className="text-sm leading-relaxed text-foreground-muted">{section}</p>
                        <button
                          onClick={() => copySection(index, section)}
                          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 h-5 w-5 flex items-center justify-center rounded hover:bg-muted transition-all"
                          title="Copy section"
                        >
                          {copiedSection === index ? (
                            <Check className="h-3 w-3 text-[#9ece6a]" />
                          ) : (
                            <Copy className="h-3 w-3 text-foreground-muted" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            </div>
          ) : (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <div className="h-10 w-10 rounded-full bg-[#7aa2f7]/10 flex items-center justify-center mb-3">
              <Brain className="h-4 w-4 text-[#7aa2f7] animate-pulse" />
              </div>
            <p className="text-xs text-foreground-muted">
              Waiting for reasoning...
            </p>
            </div>
          )}
        </div>
    </div>
  );
}
