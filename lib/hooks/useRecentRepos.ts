import { useState, useEffect } from "react";

const STORAGE_KEY = "bugsmith_recent_repos";
const MAX_RECENT_REPOS = 5;

export function useRecentRepos() {
  const [recentRepos, setRecentRepos] = useState<string[]>([]);

  // Load recent repos from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const repos = JSON.parse(stored);
        setRecentRepos(Array.isArray(repos) ? repos : []);
      }
    } catch (error) {
      console.error("Failed to load recent repos:", error);
    }
  }, []);

  // Add a repo to recent list
  const addRecentRepo = (repo: string) => {
    if (!repo || !repo.trim()) return;

    const trimmedRepo = repo.trim();
    
    setRecentRepos((prev) => {
      // Remove if already exists, then add to front
      const filtered = prev.filter((r) => r !== trimmedRepo);
      const updated = [trimmedRepo, ...filtered].slice(0, MAX_RECENT_REPOS);
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save recent repos:", error);
      }
      
      return updated;
    });
  };

  // Clear recent repos
  const clearRecentRepos = () => {
    setRecentRepos([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear recent repos:", error);
    }
  };

  return {
    recentRepos,
    addRecentRepo,
    clearRecentRepos,
  };
}

