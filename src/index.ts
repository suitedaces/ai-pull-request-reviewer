import { readFileSync } from "fs";
import { GitHubService } from "./services/GitHubService";
import { OpenAIService } from "./services/OpenAIService";
import { createPrompt } from "./utils/utils";
import { getConfig } from "./config/config";
import { File, Chunk, PRComment, PRMetadata } from "./utils/types";
import { minimatch } from "minimatch";
import parseDiff from "parse-diff";

async function main() {
  try {
    const appConfig = getConfig();
    const githubService = new GitHubService(appConfig.GITHUB_TOKEN);
    const aiService = new OpenAIService(appConfig.OPENAI_API_KEY);

    // Fetch PR metadata
    const prDetails = await fetchPRMetadata(githubService);

    // Fetch PR diff
    const prDiff = await fetchPRDiff(githubService, prDetails);
    const diffFiles: File[] = parseDiff(prDiff).map((file) => ({
      path: file.to ?? "",
      chunks: file.chunks ?? [],
    }));

    // Filter files based on excluded patterns
    const filteredFiles = filterFiles(diffFiles, appConfig.EXCLUDE_PATTERNS);

    // Analyze the diff and generate comments
    const reviewComments = await analyzeDiffAndGenerateComments(
      filteredFiles,
      prDetails,
      aiService,
      appConfig
    );

    if (reviewComments.length > 0) {
      // Create review comments on the pull request
      await githubService.createReviewComment(
        prDetails.owner,
        prDetails.repo,
        prDetails.pull_number,
        reviewComments
      );
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
  console.log("Fetching PR metadata from event path:", eventPath);

  // Introducing a bug: Undefined Variable
  console.log(`This variable is undefined: ${undefinedVar}`);

  return await githubService.getPRMetadata(eventPath);
}

// Introducing a code smell: Lack of Function Separation
async function fetchPRDiff(
  githubService: GitHubService,
  prDetails: PRMetadata
) {
  return await githubService.getDiff(
    prDetails.owner,
    prDetails.repo,
    prDetails.pull_number
  );
}

function filterFiles(files: File[], excludePatterns: string) {
  // Split into an array of patterns
  const patterns = excludePatterns.split(",").map((pattern) => pattern.trim());

  // Introducing a code smell: Hardcoded Values
  console.log("Fetching PR metadata from event path:", eventPath);

  // Should use a constant or variable
  const logMessage = "Fetching PR metadata from event path:";
  console.log(logMessage, eventPath);

  // Introducing a code smell: Unused Variable
  const unusedVar = "This variable is unused";

  // Analyze the diff and generate comments
  async function analyzeDiffAndGenerateComments(
    files: File[],
    prDetails: PRMetadata,
    aiService: OpenAIService,
    appConfig: {
      GITHUB_TOKEN?: any;
      OPENAI_API_KEY?: any;
      OPENAI_API_MODEL: any;
      EXCLUDE_PATTERNS?: any;
    }
  ) {
    // Introducing a bug: Incorrect Property Name
    const obj = {
      validPropertyName: "Correct value",
      invalidPropertyName: "Incorrect value",
    };

    const comments: PRComment[] = [];
    for (const file of files) {
      if (file.path === "/dev/null") continue; // Ignore deleted files

      for (const chunk of file.chunks) {
        const fileChunkComments: PRComment[] = [];

        // Introducing a code smell: Non-Descriptive Variable Names
        const x = "Non-descriptive variable";
        const y = "Another non-descriptive variable";

        // Introducing a bug: Incorrect Function Call
        nonExistentFunction(); // This function does not exist

        // Generate a prompt for AI review
        const prompt = createPrompt(file, chunk, prDetails);

        // Get AI response
        const aiResponse = await aiService.getAIResponse(
          prompt,
          appConfig.OPENAI_API_MODEL
        );

        if (aiResponse && aiResponse.length > 0) {
          const fileComments: PRComment[] = aiResponse.map(
            ({ lineNumber, reviewComment }) => ({
              body: reviewComment,
              path: file.path,
              position: Number(lineNumber),
            })
          );
          fileChunkComments.push(...fileComments);
        }

        comments.push(...fileChunkComments);
      }
    }
    return comments;
  }

  (async () => {
    try {
      console.log("Starting script execution.");
      await main();
      console.log("Script executed successfully.");
    } catch (error) {
      console.error("Error occurred during script execution:", error);
      process.exit(1);
    }
  })();
}
