import "@/lib/loadEnv";

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

interface MergePRRequest {
  repo: string;
  pullNumber: number;
  mergeMethod?: "merge" | "squash" | "rebase";
}

export async function POST(request: NextRequest) {
  try {
    const body: MergePRRequest = await request.json();
    const { repo, pullNumber, mergeMethod = "merge" } = body;

    // Validate required fields
    if (!repo || !pullNumber) {
      return NextResponse.json(
        { error: "Missing required fields: repo and pullNumber are required" },
        { status: 400 }
      );
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "GITHUB_TOKEN environment variable is not set" },
        { status: 500 }
      );
    }

    // Validate repo format (owner/repo)
    const repoParts = repo.split("/");
    if (repoParts.length !== 2 || !repoParts[0] || !repoParts[1]) {
      return NextResponse.json(
        { error: "Invalid repository format. Use owner/repo (e.g., vercel/next.js)" },
        { status: 400 }
      );
    }

    const [owner, repoName] = repoParts;

    // Merge pull request via GitHub API
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/pulls/${pullNumber}/merge`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "User-Agent": "BugSmith",
        },
        body: JSON.stringify({
          merge_method: mergeMethod,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 405) {
        // Method not allowed - PR might already be merged or not mergeable
        return NextResponse.json(
          { error: errorData.message || "Pull request is not mergeable. It may already be merged or have merge conflicts." },
          { status: 405 }
        );
      }
      
      if (response.status === 409) {
        // Conflict - PR cannot be merged
        return NextResponse.json(
          { error: errorData.message || "Pull request cannot be merged due to conflicts or other issues." },
          { status: 409 }
        );
      }
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Pull request not found. Please check the PR number." },
          { status: 404 }
        );
      }
      
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { error: "GitHub authentication failed or insufficient permissions. Please check your GITHUB_TOKEN." },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: errorData.message || `GitHub API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const mergeData = await response.json();

    // Return merge result
    return NextResponse.json({
      success: true,
      merged: mergeData.merged || true,
      message: mergeData.message || "Pull request merged successfully",
      sha: mergeData.sha,
    });
  } catch (error: any) {
    console.error("Error merging GitHub PR:", error);
    return NextResponse.json(
      { error: "Failed to merge pull request. Please try again later." },
      { status: 500 }
    );
  }
}

