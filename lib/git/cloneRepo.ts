import { exec } from "child_process";
import { promisify } from "util";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { platform } from "os";

const execAsync = promisify(exec);

/**
 * Clones or updates a GitHub repository to a local temp directory
 * @param repo - Repository in format "owner/repo"
 * @returns Absolute path to the cloned repository
 */
export async function cloneRepo(repo: string): Promise<string> {
  try {
    // Validate repo format
    const repoParts = repo.split("/");
    if (repoParts.length !== 2 || !repoParts[0] || !repoParts[1]) {
      throw new Error(`Invalid repository format: ${repo}. Expected format: owner/repo`);
    }

    const [owner, repoName] = repoParts;

    // Determine temp directory based on OS
    const tempBase = platform() === "win32" 
      ? process.env.TEMP || process.env.TMP || "C:\\temp"
      : "/tmp";

    // Create bugsmith directory if it doesn't exist
    const bugsmithDir = join(tempBase, "bugsmith");
    if (!existsSync(bugsmithDir)) {
      mkdirSync(bugsmithDir, { recursive: true });
    }

    // Target directory for the repo
    const targetDir = join(bugsmithDir, `${owner}-${repoName}`);

    // Check if repo already exists
    if (existsSync(targetDir) && existsSync(join(targetDir, ".git"))) {
      // Repository exists, pull latest changes
      console.log(`Repository ${repo} already exists. Pulling latest changes...`);
      
      try {
        // Fetch and pull latest changes
        await execAsync("git fetch origin", { cwd: targetDir });
        await execAsync("git pull origin main", { cwd: targetDir });
        console.log(`Successfully updated repository ${repo}`);
      } catch (error: any) {
        // If pull fails, try to pull from current branch
        try {
          await execAsync("git pull", { cwd: targetDir });
          console.log(`Successfully updated repository ${repo} (current branch)`);
        } catch (pullError: any) {
          console.warn(`Warning: Could not pull latest changes: ${pullError.message}`);
          // Continue anyway - repo exists, we can work with it
        }
      }

      return targetDir;
    }

    // Clone the repository
    console.log(`Cloning repository ${repo}...`);
    const repoUrl = `https://github.com/${owner}/${repoName}.git`;
    
    try {
      const { stdout, stderr } = await execAsync(
        `git clone ${repoUrl} "${targetDir}"`,
        {
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large repos
        }
      );

      // Git often writes to stderr even on success, but check for actual errors
      if (stderr && !stderr.includes("Cloning into") && !stderr.includes("remote:")) {
        // Check if it's a real error (not just progress messages)
        const errorIndicators = ["fatal:", "error:", "Permission denied", "not found"];
        if (errorIndicators.some((indicator) => stderr.toLowerCase().includes(indicator.toLowerCase()))) {
          throw new Error(`Git clone error: ${stderr}`);
        }
      }
    } catch (error: any) {
      // Check if error is because git is not installed
      if (error.message?.includes("git") && error.message?.includes("not found")) {
        throw new Error("Git is not installed or not in PATH. Please install Git to use this feature.");
      }
      throw error;
    }

    console.log(`Successfully cloned repository ${repo} to ${targetDir}`);
    return targetDir;
  } catch (error: any) {
    console.error(`Error cloning repository ${repo}:`, error);
    throw new Error(
      `Failed to clone repository ${repo}: ${error.message || "Unknown error"}`
    );
  }
}

