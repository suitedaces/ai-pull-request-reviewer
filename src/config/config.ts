import * as core from "@actions/core";

export const getConfig = () => ({
  GITHUB_TOKEN: core.getInput("GITHUB_TOKEN"),
  OPENAI_API_KEY: core.getInput("OPENAI_API_KEY"),
  OPENAI_API_MODEL: core.getInput("OPENAI_API_MODEL"),
  EXCLUDE_PATTERNS: core.getInput("EXCLUDE_PATTERNS") || "**/*.test.js,**/node_modules/**,**/dist/**,**/build/**,**/coverage/**"
});
