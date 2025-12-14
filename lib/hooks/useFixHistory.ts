import { useState, useEffect, useCallback } from "react";
import type { Issue } from "@/components/issue-card";

const STORAGE_KEY = "bugsmith_fix_history";
const MAX_HISTORY = 50;

export interface FixHistoryEntry {
  id: string;
  issueId: string;
  issueTitle: string;
  repo: string;
  patch: string;
  approved: boolean;
  rejected: boolean;
  applied: boolean;
  timestamp: string;
  errorMessage?: string;
  retryAttempts?: number;
  modifiedFiles: string[];
}

interface FixHistory {
  entries: FixHistoryEntry[];
  patterns: {
    [key: string]: {
      approved: number;
      rejected: number;
      commonFiles: string[];
    };
  };
}

export function useFixHistory() {
  const [history, setHistory] = useState<FixHistory>({
    entries: [],
    patterns: {},
  });

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      }
    } catch (error) {
      console.error("Failed to load fix history:", error);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = useCallback((newHistory: FixHistory) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error("Failed to save fix history:", error);
    }
  }, []);

  // Add a fix entry
  const addFixEntry = useCallback((
    issue: Issue,
    repo: string,
    patch: string,
    approved: boolean,
    rejected: boolean,
    applied: boolean,
    modifiedFiles: string[],
    errorMessage?: string,
    retryAttempts?: number
  ) => {
    const entry: FixHistoryEntry = {
      id: `${Date.now()}-${issue.id}`,
      issueId: issue.id,
      issueTitle: issue.title,
      repo,
      patch,
      approved,
      rejected,
      applied,
      timestamp: new Date().toISOString(),
      errorMessage,
      retryAttempts,
      modifiedFiles,
    };

    setHistory((prev) => {
      const newEntries = [entry, ...prev.entries].slice(0, MAX_HISTORY);
      
      // Update patterns based on issue keywords and files
      const newPatterns = { ...prev.patterns };
      const keywords = extractKeywords(issue.title, issue.body || "");
      const patternKey = keywords.join("|");
      
      if (!newPatterns[patternKey]) {
        newPatterns[patternKey] = {
          approved: 0,
          rejected: 0,
          commonFiles: [],
        };
      }
      
      if (approved) {
        newPatterns[patternKey].approved++;
      }
      if (rejected) {
        newPatterns[patternKey].rejected++;
      }
      
      // Track common files
      modifiedFiles.forEach((file) => {
        if (!newPatterns[patternKey].commonFiles.includes(file)) {
          newPatterns[patternKey].commonFiles.push(file);
        }
      });
      
      const updated = {
        entries: newEntries,
        patterns: newPatterns,
      };
      
      saveHistory(updated);
      return updated;
    });
  }, [saveHistory]);

  // Find similar fixes
  const findSimilarFixes = useCallback((issue: Issue, repo: string): FixHistoryEntry[] => {
    const keywords = extractKeywords(issue.title, issue.body || "");
    const patternKey = keywords.join("|");
    
    return history.entries.filter((entry) => {
      // Same repo
      if (entry.repo !== repo) return false;
      
      // Similar keywords
      const entryKeywords = extractKeywords(entry.issueTitle, "");
      const similarity = calculateSimilarity(keywords, entryKeywords);
      
      return similarity > 0.3; // 30% similarity threshold
    }).slice(0, 5); // Return top 5 similar
  }, [history]);

  // Get suggestions based on history
  const getSuggestions = useCallback((issue: Issue, repo: string): {
    shouldApprove: boolean;
    confidence: number;
    reason: string;
    similarFixes: FixHistoryEntry[];
  } => {
    const similar = findSimilarFixes(issue, repo);
    const approved = similar.filter((f) => f.approved).length;
    const rejected = similar.filter((f) => f.rejected).length;
    const total = similar.length;
    
    if (total === 0) {
      return {
        shouldApprove: true,
        confidence: 0.5,
        reason: "No similar fixes found in history",
        similarFixes: [],
      };
    }
    
    const approvalRate = approved / total;
    const shouldApprove = approvalRate > 0.5;
    const confidence = Math.abs(approvalRate - 0.5) * 2; // 0 to 1 scale
    
    let reason = "";
    if (approvalRate > 0.7) {
      reason = `Similar fixes were approved ${Math.round(approvalRate * 100)}% of the time`;
    } else if (approvalRate < 0.3) {
      reason = `Similar fixes were rejected ${Math.round((1 - approvalRate) * 100)}% of the time`;
    } else {
      reason = `Mixed results for similar fixes (${approved} approved, ${rejected} rejected)`;
    }
    
    return {
      shouldApprove,
      confidence,
      reason,
      similarFixes: similar,
    };
  }, [findSimilarFixes]);

  // Clear history
  const clearHistory = useCallback(() => {
    const empty: FixHistory = { entries: [], patterns: {} };
    saveHistory(empty);
  }, [saveHistory]);

  return {
    history,
    addFixEntry,
    findSimilarFixes,
    getSuggestions,
    clearHistory,
  };
}

// Helper functions
function extractKeywords(title: string, body: string): string[] {
  const text = `${title} ${body}`.toLowerCase();
  const words = text
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .filter((w) => !["this", "that", "with", "from", "have", "been", "will", "would"].includes(w));
  
  // Get unique words
  return Array.from(new Set(words)).slice(0, 10);
}

function calculateSimilarity(arr1: string[], arr2: string[]): number {
  if (arr1.length === 0 || arr2.length === 0) return 0;
  
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

