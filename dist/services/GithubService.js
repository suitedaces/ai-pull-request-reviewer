"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubService = void 0;
const rest_1 = require("@octokit/rest");
const fs_1 = require("fs");
class GitHubService {
    token;
    octokit;
    constructor(token) {
        this.token = token;
        if (!token) {
            throw new Error("GitHub token is required for GitHubService.");
        }
        this.octokit = new rest_1.Octokit({ auth: token });
    }
    async getPRMetadata(eventPath) {
        try {
            const event = JSON.parse((0, fs_1.readFileSync)(eventPath, "utf8"));
            const { repository, number } = event.pull_request ? event.pull_request : event;
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
        }
        catch (error) {
            console.error("Error fetching PR details:", error);
            throw error;
        }
    }
    async getDiff(owner, repo, pull_number) {
        try {
            const response = await this.octokit.pulls.get({
                owner,
                repo,
                pull_number,
                mediaType: { format: "diff" },
            });
            return response.data;
        }
        catch (error) {
            console.error(`Error fetching diff for PR #${pull_number}:`, error);
            throw error;
        }
    }
    async createReviewComment(owner, repo, pull_number, comments) {
        try {
            await this.octokit.pulls.createReview({
                owner,
                repo,
                pull_number,
                comments,
                event: "COMMENT",
            });
        }
        catch (error) {
            console.error(`Error creating review comment for PR #${pull_number} for ${owner}/${repo}:`, error);
            throw error;
        }
    }
}
exports.GitHubService = GitHubService;
