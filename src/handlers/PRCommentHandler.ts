import { GitHubService } from '../services/GitHubService';
import { OpenAIService } from '../services/OpenAIService';
import { createPRCommentResponsePrompt } from '../utils/prompts';
import { PRMetadata, File } from '../utils/types'; 
import parseDiff from 'parse-diff';
import { readFileSync } from "fs";

export class PRCommentHandler {
    constructor(
        private gitHubService: GitHubService,
        private aiService: OpenAIService,
        private appConfig: {
            OPENAI_API_MODEL: string;
        }
    ) {}

    async handleCommentEvent(eventPath: string): Promise<void> {
        // Read event data
        const event = JSON.parse(readFileSync(eventPath, 'utf8'));
        const { pull_request: pr, comment } = event;

        // Add reaction to the comment
        await this.gitHubService.addReactionToComment(pr.base.repo.owner.login, pr.base.repo.name, comment.id, 'eyes');

        // Fetch PR metadata and diff
        const prDetails: PRMetadata = await this.gitHubService.getPRMetadata(eventPath);
        const prDiff = await this.gitHubService.getDiff(prDetails.owner, prDetails.repo, prDetails.pull_number);
        const discussionThread = await this.gitHubService.getPRComments(prDetails.owner, prDetails.repo, prDetails.pull_number);

        // Parse the diff to get file and chunk info
        const diffFiles: File[] = parseDiff(prDiff).map((file) => ({
            path: file.to ?? "",
            chunks: file.chunks ?? [],
        }));

        const prompt = createPRCommentResponsePrompt(prDetails, discussionThread, comment.body, comment.user.login, diffFiles)

        // Get AI response for the comment
        const aiResponse = await this.aiService.getAIPullRequestResponse(prompt, this.appConfig.OPENAI_API_MODEL);

        // Process AI response and create a comment reply
        const replyMessage = aiResponse?.[0]?.reviewComment || `Sorry, can't help you with that, ${comment.user.login}! 😭`;

        // Reply to the comment in the PR
        await this.gitHubService.createReviewCommentReply(prDetails.owner, prDetails.repo, prDetails.pull_number, comment.id, replyMessage);
    }
}
