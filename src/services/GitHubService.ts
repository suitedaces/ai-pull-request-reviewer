import { Octokit } from "@octokit/rest";
import { PRMetadata } from "../utils/types";
import { readFileSync } from "fs";

export class GitHubService {
  private octokit: Octokit;

  constructor(private token: string) {
    if (!token) {
      throw new Error("GitHub token is required for GitHubService.");
    }
    this.octokit = new Octokit({ auth: token });
  }

  async getPRMetadata(eventPath: string): Promise<PRMetadata> {
    try {
      const event = JSON.parse(readFileSync(eventPath, "utf8"));
      console.log("\nEvent data:", event)
      const { repository, number } = event.pull_request ? event.pull_request : event;
      console.log("\nRepository:", repository)
      console.log("\nNumber:", number)
      if (!repository || !number) {
        throw new Error("Invalid event data. Repository or PR number is missing.");
      }

      const prResponse = await this.octokit.pulls.get({
        owner: repository.owner.login,
        repo: repository.name,
        pull_number: number,
      });

      return {
        owner: repository.owner.login,
        repo: repository.name,
        pull_number: number,
        title: prResponse.data.title ?? "",
        description: prResponse.data.body ?? "",
      };
    } catch (error) {
      console.error("Error fetching PR details:", error);
      throw error;
    }
  }

  async getDiff(owner: string, repo: string, pull_number: number): Promise<string | null> {
    try {
      const response = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number,
        mediaType: { format: "diff" },
      });
      return response.data as unknown as string;
    } catch (error) {
      console.error(`Error fetching diff for PR #${pull_number}:`, error);
      throw error;
    }
  }

  async createReviewComment(
    owner: string,
    repo: string,
    pull_number: number,
    comments: Array<{ body: string; path: string; line: number }>
  ): Promise<void> {
    try {
      await this.octokit.pulls.createReview({
        owner,
        repo,
        pull_number,
        comments,
        event: "COMMENT",
      });
    } catch (error) {
      console.error(`Error creating review comment for PR #${pull_number} for ${owner}/${repo}:`, error);
      throw error;
    }
  }

//   async labelPullRequest(owner: string, repo: string, pull_number: number, labels: string[]): Promise<void> {
//     try {
//       await this.octokit.issues.addLabels({
//         owner,
//         repo,
//         issue_number: pull_number,
//         labels,
//       });
//     } catch (error) {
//       console.error(`Error adding labels to PR #${pull_number}:`, error);
//       throw error;
//     }
//   }
}
