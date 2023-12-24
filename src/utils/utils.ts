import { File, Chunk, PRMetadata } from "./types";

export function createPrompt(file: File, chunk: Chunk, prDetails: PRMetadata): string {
  // Instructions for AI Review Process
  const instructions = `Respond in JSON format: {"reviews": [{"lineNumber": <line_number>, "reviewComment": "<review comment>"}]}. 
                        DO NOT return a lineNumber that's blank in the diff, instead choose the line number that's closest to the code that needs to be reviewed.
                        Provide only constructive feedback in the reviewComment after reviewing the code for security vulnerabilities and adherence to coding best practices for the given language.
                        Make recommendations to make code more secure,faster easier to maintain, reduce redundancy.
                        If no improvements are necessary, keep the "reviews" array empty. 
                        Use GitHub Markdown format for comments. 
                        Focus your review solely on the provided code, considering the PR context for holistic understanding. 
                        Avoid suggesting the addition of code comments.`;

  const prContext = `Review Context: Pull Request Title - '${prDetails.title}'. Description: ${prDetails.description}`;

  const codeDiff = `Code to Review (File: ${file.path}): \`\`\`diff ${chunk.content} ${chunk.changes.map(c => `${c.start_line ? c.start_line : c.end_line} ${c.content}`).join("\n")} \`\`\``;

  const prompt = `Review Task: ${instructions} Context: ${prContext} \n Code Diff: ${codeDiff}`;

  return prompt;
}

