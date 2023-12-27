// src/handlers/PRHandler.ts

import { GitHubService } from '../services/GitHubService';
import { OpenAIService } from '../services/OpenAIService';
import { PRMetadata, File, PRCommentRequest } from '../utils/types';
import { filterFiles } from '../utils/utils';
import { createPRReviewPrompt } from '../utils/prompts';
import parseDiff from 'parse-diff';

export class PRHandler {
  constructor(
    private githubService: GitHubService, 
    private aiService: OpenAIService,
    private appConfig: { 
      OPENAI_API_MODEL: string; 
      EXCLUDE_PATTERNS: string; 
    }
  ) {}

  async handlePullRequest(eventPath: string): Promise<void> {
    // Fetch PR metadata
    const prDetails = await this.githubService.getPRMetadata(eventPath);

    // Fetch PR diff
    const prDiff = await this.githubService.getDiff(prDetails.owner, prDetails.repo, prDetails.pull_number);

    const diffFiles: File[] = parseDiff(prDiff).map((file) => ({
      to: file.to ?? "",
      chunks: file.chunks ?? [],
    }));

    // Filter files based on excluded patterns
    const filteredFiles = filterFiles(diffFiles, this.appConfig.EXCLUDE_PATTERNS);

    // Analyze the diff and generate comments
    const reviewComments = await this.analyzeDiffAndGenerateComments(filteredFiles, prDetails);

    if (reviewComments.length > 0) {
      // Create review comments on the pull request
      await this.githubService.createReviewComment(
        prDetails.owner,
        prDetails.repo,
        prDetails.pull_number,
        reviewComments
      );
      console.log(`Posted ${reviewComments.length} comments on the pull request.`);
    } else {
      console.log("No review comments to post.");
    }
  }

  // TODO: Make this faster
  private async analyzeDiffAndGenerateComments(files: File[], prDetails: PRMetadata): Promise<PRCommentRequest[]> {
    const comments: PRCommentRequest[] = [];
    for (const file of files) {
      if (file.to === "/dev/null") continue; // Ignore deleted files

      for (const chunk of file.chunks) {
        const fileChunkComments: PRCommentRequest[] = [];

        // Generate a prompt for AI review
        const prompt = createPRReviewPrompt(file, chunk, prDetails);

        // Get AI response
        const aiResponse = await this.aiService.getAIPullRequestResponse(
          prompt,
          this.appConfig.OPENAI_API_MODEL
        );

        if (aiResponse && aiResponse.length > 0) {
          const fileComments: PRCommentRequest[] = aiResponse.map(
            ({ lineNumber, reviewComment }) => ({
              body: reviewComment,
              path: file.to,
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
}
