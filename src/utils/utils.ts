import { minimatch } from "minimatch";
import { File } from "./types";

export function filterFiles(files: File[], excludePatterns: string) {
  // Split into an array of patterns
  const patterns = excludePatterns.split(",").map((pattern) => pattern.trim());

  // Return files that do not match any of the patterns
  return files.filter((file) => {
    return !patterns.some((pattern) =>
      minimatch(file.path ?? "", pattern)
    );
  });
}

