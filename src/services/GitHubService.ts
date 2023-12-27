import { Octokit } from "@octokit/rest";
import { PRMetadata, PRCommentEvent, PRCommentRequest } from '../utils/types';
import { readFileSync } from "fs";

export class GitHubService {
  private octokit: Octokit;

  constructor(private token: string) {
    if (!token) {
      throw new Error("GitHub token is required for GitHubService.");
    }
    this.octokit = new Octokit({ auth: token });
  }

  async getPRMetadata(eventPayload: string): Promise<PRMetadata> {

    try {
      const event = JSON.parse(eventPayload);
      const repository = event.repository;
      const pullNumber = event.pull_request.number; // Renamed from 'number' to 'pullNumber'
  
      if (!repository || typeof pullNumber !== 'number') {
        throw new Error("Invalid event data. Repository or PR number is missing.");
      }
  
      // Fetch PR details
      const prResponse = await this.octokit.pulls.get({
        owner: repository.owner.login,
        repo: repository.name,
        pull_number: pullNumber,
      });
  
      // Fetch PR comments
      const commentsResponse = await this.octokit.issues.listComments({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: pullNumber,
      });
  
      // Map comments to PRComment format
      const comments: PRCommentEvent[] = commentsResponse.data.map(comment => ({
        body: comment.body ? comment.body : "",
        user: comment.user ? { login: comment.user.login, id: comment.user.id } : undefined,
        id: comment.id,
      }));
  
      return {
        owner: repository.owner.login,
        repo: repository.name,
        pull_number: pullNumber,
        title: prResponse.data.title ?? "",
        description: prResponse.data.body ?? "",
        comments: comments ? comments : [], 
      }
  
    } catch (error) {
      console.error("Error fetching PR details:", error);
      throw error;
    }
  }
  

  async getPRComments(owner: string, repo: string, pull_number: number): Promise<string> {
      try {
        const comments = await this.octokit.issues.listComments({
          owner,
          repo,
          issue_number: pull_number,
        });
        return comments.data.map(comment => `${comment.user?.login}: ${comment.body}`).join('\n');
      } catch (error) {
        console.error(`Error fetching comments for PR #${pull_number}:`, error);
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
    comments: PRCommentRequest[]
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
      console.error('Comments: ', comments)
      throw error;
    }
  }

  async createReviewCommentReply(
    owner: string, 
    repo: string, 
    pull_number: number, 
    comment_id: number, 
    body: string
): Promise<void> {
    try {
        await this.octokit.pulls.createReplyForReviewComment({
            owner,
            repo,
            pull_number,
            comment_id,
            body
        });
    } catch (error) {
        console.error(`Error replying to review comment ${comment_id} in PR #${pull_number}:`, error);
        throw error;
    }
}

async addReactionToComment(
  owner: string,
  repo: string,
  commentId: number, 
  reaction: string
    ): Promise<void> {
    try {
      await this.octokit.reactions.createForIssueComment({
        owner,
        repo,
        comment_id: commentId,
        content: reaction as "+1" | "-1" | "laugh" | "confused" | "heart" | "hooray" | "rocket" | "eyes"
      });
    } catch (error) {
      console.error(`Failed to add reaction to comment: ${error}`);
    }
  }

  async labelPullRequest(owner: string, repo: string, pull_number: number, labels: string[]): Promise<void> {
    try {
      await this.octokit.issues.addLabels({
        owner,
        repo,
        issue_number: pull_number,
        labels,
      });
    } catch (error) {
      console.error(`Error adding labels to PR #${pull_number}:`, error);
      throw error;
    }
  }
}
