# Claude Code Setup for Kodix
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="medium" -->
<!-- AI-METADATA:
category: setup
stack: general
complexity: basic
dependencies: [../universal-principles.md]
assistant: claude-code
-->

## 🎯 Quick Summary

Step-by-step setup guide for integrating Claude Code with the Kodix monorepo. For universal AI assistant principles, see **[Universal AI Assistant Principles](../universal-principles.md)**.

## 📋 Prerequisites

- **Claude Code installed**: Follow <!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[Anthropic's installation guide](https://claude.ai/code)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->
- **API Access**: Anthropic API key with sufficient credits
- **Git configured**: For version control integration
- **Node.js & pnpm**: For Kodix development workflow

## 📦 🚀 Installation Steps

### 1. Install Claude Code

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Install via npm (recommended for Kodix)
npm install -g @anthropic-ai/claude-code

# Or download binary from Anthropic
curl -L https://claude.ai/code/download/latest -o claude-code
chmod +x claude-code
sudo mv claude-code /usr/local/bin/claude
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 2. Configure API Access

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Set up Anthropic API key
export ANTHROPIC_API_KEY="your-api-key-here"

# Add to your shell profile for persistence
echo 'export ANTHROPIC_API_KEY="your-api-key-here"' >> ~/.zshrc
# or ~/.bashrc depending on your shell
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 3. Initialize Claude Code in Kodix

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Navigate to Kodix project root
cd /path/to/kodix-turbo

# Initialize Claude Code
claude init

# This creates:
# - .claude/ directory
# - Basic configuration files
# - Initial CLAUDE.md template
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🔧 Claude Code-Specific Configuration

### 1. Replace Default CLAUDE.md

The centralized `/docs/CLAUDE.md` serves as the primary reference. Claude Code will automatically discover and use it.

### 2. Configure Permissions

Set up appropriate tool permissions for Kodix development:

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Start Claude Code and configure permissions
claude

# In Claude Code, run:
/permissions

# Add these common Kodix tools:
# - Edit (for file editing)
# - Bash(pnpm:*) (for package management)
# - Bash(git:*) (for version control)
# - Bash(npm:*) (for occasional npm commands)
# - Browser (for testing web apps)
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 3. Claude Code-Specific Features

**Terminal Integration**:

- Direct command execution
- File system navigation
- Git integration
- Package management

**Documentation Ingestion**:

- Automatic `CLAUDE.md` discovery
- `@file` reference resolution
- Hierarchical context loading

## 🎯 Claude Code vs Universal Features

| Feature               | Universal        | Claude Code-Specific     |
| --------------------- | ---------------- | ------------------------ |
| Documentation Context | ✅ All tools     | `CLAUDE.md` discovery    |
| Reference Resolution  | ✅ All tools     | `@file` syntax           |
| Context Assembly      | ✅ All tools     | Hierarchical loading     |
| Tool Permissions      | ❌ Tool-specific | Permission system        |
| Terminal Integration  | ❌ Tool-specific | Direct command execution |

## 🚀 Optimization Tips

### 1. Leverage Claude Code's Documentation System

- Use the centralized `/docs/CLAUDE.md` for primary context
- Claude Code automatically discovers and loads it
- No need for subdirectory `CLAUDE.md` files

### 2. Optimize Permissions

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Minimal permissions for Kodix development
/permissions add edit
/permissions add bash:pnpm:*
/permissions add bash:git:*
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 3. Use Reference Resolution

Claude Code understands the `@file` syntax in documentation:

```markdown
- **Architecture**: @docs/architecture/README.md
- **SubApps**: @docs/subapps/chat/chat-architecture.md
```

## 📚 Related Resources

- **[Universal AI Assistant Principles](../universal-principles.md)** - Core concepts
- **[Documentation Ingestion](./documentation-ingestion.md)** - How Claude Code processes docs
- **[Context Engineering](../../context-engineering/)** - Advanced strategies

<!-- AI-RELATED: [../universal-principles.md, ./documentation-ingestion.md] -->
<!-- DEPENDS-ON: [../universal-principles.md] -->
<!-- REQUIRED-BY: [claude-code-integration] -->
<!-- SEE-ALSO: [../../context-engineering/README.md] -->
