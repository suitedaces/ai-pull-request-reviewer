import { readFileSync } from "fs";
import { GitHubService } from "./services/GithubService";
import { OpenAIService } from "./services/OpenAIService";
import { createPrompt } from "./utils/utils";
import { getConfig } from "./config/config";
import { PRComment } from "./utils/types";
import { minimatch } from "minimatch";
import parseDiff from "parse-diff";


async function main() {
  const appConfig = getConfig();
  const githubService = new GitHubService(appConfig.GITHUB_TOKEN);
  const aiService = new OpenAIService(appConfig.OPENAI_API_KEY);

  try {
    const prDetails = await fetchPRMetadata(githubService);
    const prDiff = await fetchPRDiff(githubService, prDetails);
    if (!prDiff) {
      console.log("No changes detected in the pull request.");
      return;
    }

    const diffFiles = parseDiff(prDiff);
    const filteredFiles = filterFiles(diffFiles, appConfig.EXCLUDE_PATTERNS);
    const reviewComments = await analyzeDiffAndGenerateComments(filteredFiles, prDetails, aiService, appConfig);

    if (reviewComments.length > 0) {
      await githubService.createReviewComment(prDetails.owner, prDetails.repo, prDetails.pull_number, reviewComments);
      console.log(`Posted ${reviewComments.length} comments on the pull request.`);
    } else {
      console.log("No review comments to post.");
    }
  } catch (error) {
    console.error("Error processing the pull request:", error);
    process.exit(1);
  }
}

async function fetchPRMetadata(githubService: GitHubService) {
    const eventPath = process.env.GITHUB_EVENT_PATH ?? "";
    if (!eventPath) {
      throw new Error("GitHub event path is not available.");
    }
    return await githubService.getPRMetadata(eventPath);
}

async function fetchPRDiff(githubService: GitHubService, prDetails) {
    return await githubService.getDiff(prDetails.owner, prDetails.repo, prDetails.pull_number);
}

function filterFiles(files, excludePatterns: string) {
  // Split into an array of patterns
  const patterns = excludePatterns.split(",").map(pattern => pattern.trim());

  // Return files that do not match any of the patterns
  return files.filter(file => {
    return !patterns.some(pattern => minimatch(file.path ?? "", pattern));
  });
}

// Might need to make this faster and handle rate limiting errors
async function analyzeDiffAndGenerateComments(files, prDetails, aiService: OpenAIService, appConfig) {
    const comments = [];
    for (const file of files) {
        if (file.path === "/dev/null") continue; // Ignore deleted files

        for (const chunk of file.chunks) {
            const comments: PRComment[] = [];
            const prompt = createPrompt(file, chunk, prDetails);
            const aiResponse = await aiService.getAIResponse(prompt, appConfig.OPENAI_API_MODEL);

            if (aiResponse && aiResponse.length > 0) {
                const fileComments: PRComment[] = aiResponse.map(({ lineNumber, reviewComment }) => ({
                    body: reviewComment,
                    path: file.path,
                    line: Number(lineNumber)
                }));
                comments.push(...fileComments);
            }
        }
    }
    return comments;
}

