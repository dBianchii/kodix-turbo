<!-- AI-METADATA:
category: setup
stack: general
complexity: basic
dependencies: [../universal-principles.md]
assistant: gemini-cli
-->

## 🎯 Quick Summary

Step-by-step setup guide for integrating Google's Gemini CLI with the Kodix monorepo. For universal AI assistant principles, see **[Universal AI Assistant Principles](../universal-principles.md)**.

## 📋 Prerequisites

- **Node.js**: Version 18 or higher.
- **Google Account**: For authentication and access to the free tier.
- **Terminal Access**: A standard command-line interface (bash, zsh, PowerShell, etc.).

## 🚀 Installation Steps

### 1. Install Gemini CLI

The Gemini CLI is an npm package. You can install it globally on your system.

```bash
# Install globally via npm
npm install -g @google/gemini-cli
```

### 2. Initial Run & Authentication

Run the `gemini` command for the first time to initiate the authentication process.

```bash
# Run the CLI
gemini

# This will prompt you to sign in with your Google account in a browser.
# Logging in with a personal Google account grants a free Gemini Code Assist license.
```

The free license provides access to Gemini 2.5 Pro with a 1 million token context window and has the following limits:

- **60 requests per minute**
- **1,000 requests per day**

## 🔧 Gemini CLI-Specific Configuration

### 1. Context File (`GEMINI.md`)

You can provide persistent context to Gemini CLI by creating `GEMINI.md` files in your project directories. The CLI will discover and load these files hierarchically, allowing you to define project-specific rules, personas, or style guides.

**Example `GEMINI.md`:**

```markdown
## Kodix Project Directives

- **Code Language**: All code, variables, and comments must be in English.
- **Frameworks**: This project uses Next.js for the frontend and tRPC for the API.
- **Database**: Use Drizzle ORM for all database interactions.
- **Package Manager**: Always use `pnpm`.
```

### 2. Configuration Files

For more advanced settings, you can create a `.gemini/settings.json` file in your project root. This is used to configure things like Model Context Protocol (MCP) servers.

**Example `.gemini/settings.json` for a GitHub MCP Server:**

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

### 3. API Key Authentication (Optional)

For professional use cases or to bypass the Google account login, you can use an API key from Google AI Studio or a Vertex AI key.

```bash
# Set up the API key as an environment variable
export GEMINI_API_KEY="your-api-key-here"

# Add it to your shell profile for persistence
echo 'export GEMINI_API_KEY="your-api-key-here"' >> ~/.zshrc
```

## 🎯 Gemini CLI vs Universal Features

| Feature                   | Universal        | Gemini CLI-Specific                                   |
| ------------------------- | ---------------- | ----------------------------------------------------- |
| **Documentation Context** | ✅ All tools     | `GEMINI.md` discovery and hierarchical loading.       |
| **Extensibility**         | ✅ All tools     | Native support for Model Context Protocol (MCP).      |
| **Core Engine**           | ✅ All tools     | Uses a Reason and Act (ReAct) loop for complex tasks. |
| **Tool Integration**      | ❌ Tool-specific | Built-in tools like `Google Search`, `grep`, `file`.  |
| **Authentication**        | ❌ Tool-specific | Google Account sign-in or API Key.                    |
| **Terminal Integration**  | ❌ Tool-specific | Shell passthrough with `!` prefix.                    |

## 🚀 Optimization Tips

### 1. Leverage `GEMINI.md` for Project Context

Use `GEMINI.md` files to provide stable, project-wide instructions. This is more effective than repeating instructions in every prompt. Place it at the root of the monorepo to apply rules globally and in sub-directories for more specific context.

### 2. Use Non-Interactive Mode for Scripting

You can call Gemini CLI from scripts using the `--prompt` flag for automation.

```bash
gemini --prompt "Refactor this file to use arrow functions: utils.js"
```

### 3. Use YOLO Mode for Speed

For trusted tasks, you can use the `--yolo` flag to automatically approve all actions, which can speed up workflows by not requiring manual confirmation.

```bash
# Use with caution
gemini --yolo "Generate unit tests for the entire api/src directory and apply them."
```

## 📚 Related Resources

- **[Universal AI Assistant Principles](../universal-principles.md)** - Core concepts for all AI tools in Kodix.
- **[Official Gemini CLI Blog Post](https://blog.google/technology/developers/introducing-gemini-cli-open-source-ai-agent/)** - Launch announcement.
- **[Official Documentation](https://cloud.google.com/gemini/docs/codeassist/gemini-cli)** - Google Cloud documentation.
- **[Open Source Repository](https://github.com/google-gemini/gemini-cli)** - The source code for the CLI.

<!-- AI-RELATED: [../universal-principles.md] -->
<!-- DEPENDS-ON: [../universal-principles.md] -->
<!-- REQUIRED-BY: [gemini-cli-integration] -->
<!-- SEE-ALSO: [../README.md] -->
