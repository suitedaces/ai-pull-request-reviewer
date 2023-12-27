import { GitHubService } from './services/GitHubService';
import { OpenAIService } from './services/OpenAIService';
import { PRHandler } from './handlers/PRHandler';
import { PRCommentHandler } from './handlers/PRCommentHandler';
import { getConfig } from './config/config';

const appConfig = getConfig();
const githubService = new GitHubService(appConfig.GITHUB_TOKEN);
const aiService = new OpenAIService(appConfig.OPENAI_API_KEY);

const prHandler = new PRHandler(githubService, aiService, appConfig);
const prCommentHandler = new PRCommentHandler(githubService, aiService, appConfig);

// Example event data structure
const event = {
  eventName: process.env.GITHUB_EVENT_NAME,
  payload: require(process.env.GITHUB_EVENT_PATH ?? ''),
};

(async () => {
    try {
        console.log("Starting event processing...");
        console.log("Event name:\n", event.eventName);
        console.log("Event payload:\n", event.payload);
        if (event.eventName === 'pull_request') {
            // Handle pull request events
            await prHandler.handlePullRequest(event.payload);
        } else if (event.eventName === 'issue_comment') {
           // Handle PR comment events
            await prCommentHandler.handleCommentEvent(event.payload);
        }

        console.log("Event processing completed successfully.");
    } catch (error) {
        console.error("Error occurred during event processing:", error);
        process.exit(1);
    }
})();
