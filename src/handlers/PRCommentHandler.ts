import { GitHubService } from '../services/GitHubService';
import { OpenAIService } from '../services/OpenAIService';
import { createPRCommentResponsePrompt } from '../utils/prompts';
import { PRMetadata, File, PRCommentEvent } from '../utils/types'; 
import parseDiff from 'parse-diff';

export class PRCommentHandler {
    constructor(
        private gitHubService: GitHubService,
        private aiService: OpenAIService,
        private appConfig: {
            OPENAI_API_MODEL: string;
        }
    ) {}

    async handleCommentEvent(eventPayload: any): Promise<void> {
        // Fetch PR metadata
        const prDetails: PRMetadata = await this.gitHubService.getPRMetadata(eventPayload);
        const comment: PRCommentEvent = eventPayload.comment;

        // TODO: remove
        await this.gitHubService.addReactionToComment(prDetails.owner, prDetails.repo, comment.id, 'laugh');
        
        // Check if Dexter is mentioned in the comment, if not then skip
        if (!comment.body?.includes('dexter')) {
            console.log('Dexter not mentioned, skipping response...');
            return;

        }
        
        if (!comment.user) {
            console.log('Comment user is undefined, skipping response...');
            return;
        }
        
        // Add reaction to the comment
        await this.gitHubService.addReactionToComment(prDetails.owner, prDetails.repo, comment.id, 'eyes');
        
        // Fetch PR diff
        const prDiff = await this.gitHubService.getDiff(prDetails.owner, prDetails.repo, prDetails.pull_number);
        const discussionThread = await this.gitHubService.getPRComments(prDetails.owner, prDetails.repo, prDetails.pull_number);

        // Parse the diff to get file and chunk info
        const diffFiles: File[] = parseDiff(prDiff).map((file) => ({
            to: file.to ?? "",
            chunks: file.chunks ?? [],
        }));

        const prompt = createPRCommentResponsePrompt(prDetails, discussionThread, comment.body, comment.user.login, diffFiles)

        // Get AI response for the comment
        const aiResponse = await this.aiService.getAIPullRequestCommentResponse(prompt, this.appConfig.OPENAI_API_MODEL);

        // Process AI response and create a comment reply
        const replyMessage = aiResponse || `Sorry, can't help you with that, ${comment.user?.login} (blame OpenAI!) 😭`;

        // Reply to the comment in the PR
        await this.gitHubService.createReviewCommentReply(prDetails.owner, prDetails.repo, prDetails.pull_number, comment.id, replyMessage);
    }
}
