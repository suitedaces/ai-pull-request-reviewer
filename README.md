# 👨🏻‍🔧 Dexter AI: Empowering Development Teams

**For Developers, By Developers** 🛠️: Dexter AI enhances code reviews with an AI-powered approach, tailored to the needs of developers.

## Key Features of Dexter AI 🌟

- **AI-Powered PR Reviews** 🤖: Automated, insightful analysis to streamline code reviews.
- **Advanced Code Analysis** 🔍: Deep evaluation focusing on quality and best practices.
- **Multilingual Code Support** 🌐: Broad compatibility with various programming languages.
- **Seamless GitHub Integration** 🔗: Smooth integration into GitHub workflows.
- **Security Vulnerability Detection** 🔐: Proactively identifies potential security risks.

## Getting Started

### Prerequisites
- A GitHub account.
- An OpenAI API key.

### Installation
- Add Dexter AI as a GitHub Action in your repository.
- Configure the action with your OpenAI API key and other optional settings.

### Configuration
- `GITHUB_TOKEN`: Your GitHub access token.
- `OPENAI_API_KEY`: Your OpenAI API key.
- `OPENAI_API_MODEL`: The specific OpenAI model used for code analysis.
- `EXCLUDE_PATTERNS`: Patterns to exclude files from analysis.

## Usage
Once configured, Dexter AI runs automatically on each pull request, reviewing code changes and providing comments directly on the PR. Detailed instructions on usage and customization are available in the documentation.

## Example Workflow
```yaml
name: Dexter AI Code Review Workflow

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions: write-all

jobs:
  pr_review:  # Unique identifier for the job
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Code Review
        uses: suitedaces/dexter-ai@main
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          OPENAI_API_MODEL: "gpt-4"
```

## 🛣️ Future Development Roadmap

### Short-Term Goals
- **Enhanced Interactive Capabilities**: Implementing Dexter AI’s ability to respond to comments in PRs.
- **Advanced Code Analysis with RAG**: Introducing Retriever-Answer Generator for sophisticated code analysis.
- **Improved Issue and PR Labeling**: Advancing labeling features for better categorization.
- **Automated PR Creation for Bugs and Vulnerabilities**: Developing automated PR generation for identified issues.