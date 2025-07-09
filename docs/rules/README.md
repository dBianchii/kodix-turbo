# AI Assistant Rules

This directory is the single source of truth for all AI assistant rules in the Kodix repository.

## Structure

- **`universal-ai-rules.md`**: Core rules that apply to ALL AI assistants.
- **`gemini-rules.md`**: Rules specific to the Gemini CLI assistant.
- **`cursor-rules.md`**: Rules specific to the Cursor IDE assistant.

## Usage

All AI assistants should first load and process `universal-ai-rules.md`, and then their own specific rule file.