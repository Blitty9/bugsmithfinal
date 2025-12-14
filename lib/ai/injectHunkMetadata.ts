import fs from "fs";
import path from "path";

/**
 * Injects real line-number metadata into @@ hunk headers
 * so Git can anchor the patch correctly.
 *
 * Converts:
 *    @@
 * Into:
 *    @@ -start,len +start,len @@
 */
export function injectHunkMetadata(patch: string, repoPath: string): string {
  const lines = patch.split("\n");

  let currentFile: string | null = null;
  let result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track current file
    if (line.startsWith("--- a/")) {
      currentFile = line.replace("--- a/", "").trim();
      result.push(line);
      continue;
    }

    if (line.startsWith("+++ b/")) {
      result.push(line);
      continue;
    }

    // Detect `@@` header
    if (line.trim() === "@@" && currentFile) {
      const filePath = path.join(repoPath, currentFile);

      const fileText = fs.readFileSync(filePath, "utf8");
      const fileLines = fileText.split("\n");

      // Look ahead to find first context line for anchoring
      let contextStartIndex = -1;

      for (let j = i + 1; j < lines.length; j++) {
        const hLine = lines[j];

        // Skip headers / empty
        if (
          hLine.startsWith("+++") ||
          hLine.startsWith("---") ||
          hLine.startsWith("@@") ||
          hLine.trim() === ""
        ) continue;

        // Only anchor using context (not + or -)
        if (hLine.startsWith("+") || hLine.startsWith("-")) continue;

        const context = hLine.replace(/^ /, "");

        // Find exact match in real file
        contextStartIndex = fileLines.findIndex(fl => fl === context);
        break;
      }

      if (contextStartIndex === -1) {
        console.warn("Could not infer context for hunk header:", line);
        result.push(line);
        continue;
      }

      // Compute lengths of old/new blocks
      let oldLen = 0;
      let newLen = 0;

      for (let j = i + 1; j < lines.length; j++) {
        const hLine = lines[j];
        if (hLine.startsWith("@@")) break;

        if (hLine.startsWith("-")) oldLen++;
        else if (hLine.startsWith("+")) newLen++;
        else {
          oldLen++;
          newLen++;
        }
      }

      const oldStart = contextStartIndex + 1;
      const newStart = oldStart;

      const newHeader = `@@ -${oldStart},${oldLen} +${newStart},${newLen} @@`;
      result.push(newHeader);
      continue;
    }

    result.push(line);
  }

  return result.join("\n");
}

