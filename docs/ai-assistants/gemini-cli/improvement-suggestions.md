# Gemini CLI Documentation - Improvement Suggestions

> **Analysis Date**: 2025-07-30
> **Author**: Gemini Assistant

## 1. Critical Analysis of `/gemini.md`

The file located at `/gemini.md` was reviewed. The following issues were identified:

### 1.1. Incorrect Filename and Scope

- **Finding**: The file is **not** a guide for the Gemini CLI. It is a **universal rulebook** intended for all AI assistants operating within the Kodix monorepo.
- **Impact**: The filename `gemini.md` is highly misleading and creates confusion. It incorrectly implies that the rules are specific to Gemini, when they are intended to be global.

### 1.2. Lack of Focus

- **Finding**: The document mixes two distinct purposes:
  1.  A general, high-priority rulebook for AI-driven development (e.g., code quality, debug protocols, architecture).
  2.  A detailed user guide for a specific "Product Requirements Prompt" (PRP) workflow.
- **Impact**: This makes the document long and difficult to consume, violating the principle of minimalism. An assistant trying to learn about the PRP workflow is forced to parse dozens of unrelated rules first.

### 1.3. Improper Location

- **Finding**: The file resides at the root of the repository.
- **Impact**: While this gives it high visibility, it is not the correct location for AI assistant documentation according to the project's own standards (`docs/ai-assistants/`).

## 2. Recommendations for Improvement

To improve clarity, maintainability, and alignment with context engineering best practices, the following changes are recommended.

### 2.1. Restructure and Relocate the Core Rules

- **Action**: Rename `/gemini.md` to `README.md` and move it to `docs/ai-assistants/`.
- **Rationale**: This correctly identifies it as the central, introductory document for any AI assistant onboarding to the project.

### 2.2. Extract the PRP Workflow Documentation

- **Action**: Create a new file, `docs/context-engineering/prp/README.md`, and move the entire "Kodix PRP Workflow Rules" section into it.
- **Rationale**: This isolates the specific workflow documentation, making it easier to reference and maintain. The main AI assistant guide can then simply link to it.

### 2.3. Create a True Gemini CLI Guide

- **Action**: If a Gemini CLI-specific guide is needed, create it at `docs/ai-assistants/gemini-cli/README.md`.
- **Rationale**: This would provide a dedicated space for any commands, flags, or environment variables that are unique to using Gemini from the command line, which is what the original filename implied.

## 3. Proposed `diff` for `/gemini.md` (To be applied manually)

This diff illustrates the recommendation to extract the PRP content.

````diff
--- a/gemini.md
+++ b/gemini.md
@@ -239,194 +239,3 @@

 **ALL POLICIES MANDATORY UNLESS USER OVERRIDE**

-<!-- AI-INSTRUCTIONS: Load and reference first -->
-<!-- REQUIRED-BY: [all-ai-assistants, all-development-tasks] -->
-<!-- PRIORITY: MAXIMUM -->
-
----
-
-# Kodix PRP Workflow Rules
-
-## 🎯 PRP Commands
-
-This project uses Product Requirements Prompt (PRP) workflow with two universal commands that work in any AI assistant (Cursor, Claude Code, Windsurf, etc.):
-
-### `/generate-prp` - Generate a Product Requirements Prompt
-
-**Usage**:
-
-```
-/generate-prp [feature description or INITIAL.md file]
-```
-
-**What it does**:
-
-1. Analyzes your feature request
-2. Searches the Kodix codebase for patterns
-3. Reviews architecture and standards
-4. Generates a comprehensive PRP document
-
-**Example**:
-
-```
-/generate-prp Add dark mode toggle to settings
-```
-
-### `/execute-prp` - Execute a PRP Implementation
-
-**Usage**:
-
-```
-/execute-prp [path to PRP document]
-```
-
-**What it does**:
-
-1. Reads the PRP specification
-2. Creates an implementation plan
-3. Implements code following Kodix patterns
-4. Runs tests and quality checks
-5. Ensures all acceptance criteria are met
-
-**Example**:
-
-```
-/execute-prp docs/subapps/settings/prp/dark-mode-toggle.md
-```
-
-## 📋 PRP Workflow Process
-
-```mermaid
-graph LR
-    A[Feature Request] --> B[/generate-prp]
-    B --> C[PRP Document]
-    C --> D[Review & Adjust]
-    D --> E[/execute-prp]
-    E --> F[Working Code]
-    F --> G[Tests Pass]
-    G --> H[Ready to Ship]
-```
-
-## 🔧 Implementation Instructions
-
-When you see these commands:
-
-1. **Read the command definition**: Check `.cursor/commands/[command-name].md`
-2. **Follow the instructions**: Each command file contains step-by-step instructions
-3. **Execute as if running the command**: Perform all the steps described
-4. **Provide feedback**: Show progress and results as specified
-
-## 📁 Command Definitions
-
-The actual command logic is defined in:
-
-- `docs/context-engineering/commands/generate-prp.md` - PRP generation logic
-- `docs/context-engineering/commands/execute-prp.md` - PRP execution logic
-
-These are **instruction files** for AI assistants, not executable scripts. They work universally across all AI coding assistants.
-
-## ⚡ Quick Reference
-
-### Creating a Feature Request
-
-Create an `INITIAL.md` file with:
-
-```markdown
-## FEATURE:
-
-[What you want to build]
-
-## CONTEXT:
-
-[Why it's needed]
-
-## USERS:
-
-[Who will use it]
-
-## STACK:
-
-[Technologies involved]
-
-## EXAMPLES:
-
-[Reference existing code]
-
-## DOCUMENTATION:
-
-[Relevant docs/APIs]
-
-## OTHER CONSIDERATIONS:
-
-[Important details]
-```
-
-### PRP Storage Locations
-
-PRPs are stored based on scope:
-
-```
-docs/
-├── subapps/[name]/prp/     # SubApp features
-├── core-service/prp/        # Core service features
-├── architecture/prp/        # Architecture patterns
-└── apps/[name]/prp/         # App-specific features
-```
-
-## 🚨 Important Kodix Rules for PRPs
-
-1. **No Mock Data**: Always real implementations
-2. **i18n Required**: No hardcoded strings ever
-3. **Multi-tenancy**: Always consider teamId isolation
-4. **Testing**: Comprehensive tests are mandatory
-5. **Patterns**: Follow existing Kodix patterns
-6. **Quality**: Run all checks (lint, types, tests)
-
-## 🎯 Benefits
-
-- **Structured Development**: Clear specifications before coding
-- **Quality Assurance**: Built-in testing and validation
-- **Pattern Consistency**: Follows Kodix architecture
-- **Time Savings**: 50% faster than ad-hoc development
-- **Documentation**: Every feature is documented
-
-## 📚 Examples
-
-See example INITIAL file: `docs/context-engineering/prp/INITIAL-example.md`
-See example PRP template: `docs/context-engineering/prp/templates/prp-base.md`
-
-## 🔄 Universal Compatibility
-
-These commands work in:
-
-- ✅ Cursor
-- ✅ Claude Code
-- ✅ Windsurf
-- ✅ Any AI assistant that supports custom commands
-
-The commands are tool-agnostic markdown instructions, not platform-specific scripts.

````
