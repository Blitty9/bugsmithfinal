import "@/lib/loadEnv";

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const repo = searchParams.get("repo");

    if (!repo) {
      return NextResponse.json(
        { error: "Repository parameter is required. Use ?repo=owner/repo" },
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

    // Fetch pull requests from GitHub API
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/pulls?state=open&per_page=30`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "BugSmith",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Repository not found. Please check the repository name." },
          { status: 404 }
        );
      }
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { error: "GitHub authentication failed. Please check your GITHUB_TOKEN." },
          { status: 401 }
        );
      }
      const errorText = await response.text();
      return NextResponse.json(
        { error: `GitHub API error: ${errorText}` },
        { status: response.status }
      );
    }

    const prs = await response.json();

    // Transform GitHub PRs to simplified format
    const formattedPRs = prs.map((pr: any) => ({
      number: pr.number,
      title: pr.title,
      state: pr.state,
      html_url: pr.html_url,
      user: pr.user?.login,
      created_at: pr.created_at,
      head: pr.head?.ref,
      base: pr.base?.ref,
      body: pr.body,
    }));

    return NextResponse.json(formattedPRs);
  } catch (error) {
    console.error("Error fetching GitHub PRs:", error);
    return NextResponse.json(
      { error: "Failed to fetch pull requests. Please try again later." },
      { status: 500 }
    );
  }
}

