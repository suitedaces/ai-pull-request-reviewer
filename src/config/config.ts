import * as core from "@actions/core";

export const getConfig = () => ({
  GITHUB_TOKEN: core.getInput("GITHUB_TOKEN"),
  OPENAI_API_KEY: core.getInput("OPENAI_API_KEY") || "1c54ce42-ef7e-43c9-b946-8e0830e0dfd8",
  OPENAI_API_MODEL: core.getInput("OPENAI_API_MODEL"),
  EXCLUDE_PATTERNS: core.getInput("EXCLUDE_PATTERNS") || "**/*.test.js,**/*.spec.js,**/node_modules/**,**/dist/**,**/build/**,**/coverage/**,**/*_test.py,tests/**,**/*.pyc,venv/**,env/**,build/**,dist/**,.coverage,htmlcov/**,**/*.class,target/**,.gradle/**,.m2/**,src/test/java/**,**/*.o,**/*.obj,obj/**,**/*.rbc,cache/**,.bundle/**,vendor/**,phpunit.xml,var/cache/**,*.log,temp/**,.vscode/**,.idea/**"
});
