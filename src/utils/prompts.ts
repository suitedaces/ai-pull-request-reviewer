import { PRMetadata, File, Chunk } from "./types";

// Base Prompt with PR Context
export function createBasePrompt(prDetails: PRMetadata): string {
    const prContext = `PR Title: ${prDetails.title}\nPR Description: ${prDetails.description}\nRepository Name: ${prDetails.repo}\n\n`;
    return `You are Dexter AI, a sophisticated GitHub Actions bot designed to assist with codebase management, including reviewing pull requests, responding to comments, and suggesting improvements. 
    Your responses should be informative, contextually relevant, and adhere to best practices in software development.                           
    Provide constructive feedback after reviewing the code for security vulnerabilities and adherence to coding best practices. 
    Make recommendations to improve code security, performance, and maintainability. Avoid unnecessary comments.\n\n${prContext}`;
}

// Pull Request Review Prompt
export function createPRReviewPrompt(file: File, chunk: Chunk, prDetails: PRMetadata): string {
    const basePrompt = createBasePrompt(prDetails);
    const instructions = `Your current task is to give high quality comments on the Pull Request based on the instructions given. Respond in JSON format: {"reviews": [{"lineNumber": <line_number>, "reviewComment": "<review comment>"}]}. \n\n`;
    const codeDiff = `Code to Review (File: ${file.path}): \n\`\`\`\ndiff ${chunk.content} ${chunk.changes.map(c => `${c.ln ? c.ln : c.ln2} ${c.content}`).join("\n")}\n\`\`\`\n\n`;
    const prompt = `${basePrompt}${instructions}${codeDiff}`;
    console.log("Prompt: \n", prompt);
    return prompt;
}

// Pull Request Comment Response Prompt
export function createPRCommentResponsePrompt(prDetails: PRMetadata, discussionThread: string, triggeringComment: string, commenterName: string, codeDiffs: File[]): string {
    const basePrompt = createBasePrompt(prDetails);
    let codeDiffContext = '';
    
    for (const file of codeDiffs) {
        for (const chunk of file.chunks) {
            const codeDiff = `Code to Review (File: ${file.path}): \n\`\`\`\ndiff ${chunk.content} ${chunk.changes.map(c => `${c.ln || c.ln2}: ${c.content}`).join("\n")}\n\`\`\`\n`;
            codeDiffContext += codeDiff + '\n';
        }
    }

    const prompt = `${basePrompt}
        Task: Respond to a comment in a pull request adhering to the instructions given to you.

        Code diff in the pull request:
        ${codeDiffContext}

        Discussion Thread:
        ${discussionThread}

        Reply to Comment by ${commenterName}: "${triggeringComment}"

        Based on the provided discussion context and the specific query in the triggering comment, generate a suitable response that addresses ${commenterName}'s concerns or questions in JSON format.
    `;

    console.log("Prompt: ", prompt);
    return prompt;
}