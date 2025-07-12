<!-- AI-METADATA:
category: guide
stack: universal
complexity: intermediate
dependencies: [setup-patterns.md, universal-principles.md]
-->

# AI Assistant Rules Integration Guide

## 🎯 Quick Summary

This document provides the standard procedure for integrating a new AI assistant with the Kodix repository's universal rules system. Following this guide ensures that all assistants operate under the same core principles, maintaining consistency and preventing configuration errors.

## 📋 Core Principle: Single Source of Truth

The fundamental principle of our rules system is that there is only **one source of truth** for all AI assistant policies:

- **`docs/rules/README.md`**: This file contains all universal project rules, policies, and guidelines.

We **do not** create separate, tool-specific rule files within the `docs/rules/` directory. Instead, the universal rules are _distributed_ to the specific configuration files required by each AI assistant.

## 🔧 The Role of `scripts/sync-rules.sh`

The `scripts/sync-rules.sh` script is the mechanism responsible for this distribution. Its job is to:

1.  Read the content from `docs/rules/README.md`.
2.  Copy this content to the location(s) where different AI assistants expect to find their rules.

This ensures that whenever we update the universal rules, a single script execution propagates those changes to all integrated assistants.

## 🚀 How to Integrate a New Assistant's Rules

When adding a new AI assistant, follow these steps to integrate it with our rules system.

### Step 1: Identify the Assistant's Rules File

First, determine where the new assistant looks for its system prompt or context rules. This might be a specific file in a `.config` directory, or a file in the project root.

- **Cursor**: Uses `.cursor/rules/README.md`
- **Gemini CLI**: Uses `GEMINI.md` in the project root.

### Step 2: Update the `sync-rules.sh` Script

Modify `scripts/sync-rules.sh` to add the new assistant's configuration file as a destination.

1.  **Define a new destination variable**: Add a variable at the top of the script for the new file path.
2.  **Add a copy command**: Add a new `cp` command to copy the source (`docs/rules/README.md`) to your new destination.

#### Example: Adding Gemini CLI Support

Here is the `diff` of the changes that were made to `scripts/sync-rules.sh` to add support for Gemini CLI:

```diff
--- a/scripts/sync-rules.sh
+++ b/scripts/sync-rules.sh
@@ -16,6 +16,7 @@
 SOURCE_README="docs/rules/README.md"
 DEST_DIR=".cursor/rules"
 DEST_README="$DEST_DIR/README.md"
+DEST_GEMINI_RULES="GEMINI.md" # Gemini CLI rules file in root

 # 0. Ensure the destination directory is writable before cleaning it.
 #    The script makes it read-only on completion, so this is required to run it again.
@@ -39,6 +40,10 @@
 echo "Copying consolidated rules from '$SOURCE_README' to '$DEST_README'..."
 cp "$SOURCE_README" "$DEST_README"

+# 4a. Copy the universal rules to the GEMINI.md file for Gemini CLI.
+echo "Copying universal rules from '$SOURCE_README' to '$DEST_GEMINI_RULES'..."
+cp "$SOURCE_README" "$DEST_GEMINI_RULES"
+
 # 5. Make the destination directory and its contents read-only to prevent accidental edits.
 echo "Setting read-only permissions on '$DEST_DIR'..."
 chmod -R a-w "$DEST_DIR"

```

### Step 3: Run the Script

After modifying the script, run it from the project root to perform the synchronization.

```bash
sh ./scripts/sync-rules.sh
```

### Step 4: Verify the Changes

Ensure that the new configuration file for your assistant has been created in the correct location and contains the content from `docs/rules/README.md`. Also, add the new file to `.gitignore` if it's in the root directory.

## 🚨 What to Avoid

- **DO NOT** create files like `docs/rules/gemini.md` or `docs/rules/some-other-assistant.md`. The rules are universal and belong in `docs/rules/README.md` only.
- **DO NOT** manually create or edit the rules files in their destination (e.g., `GEMINI.md`). Always update the source file (`docs/rules/README.md`) and run the sync script. This prevents configuration drift.

<!-- AI-RELATED: [setup-patterns.md, universal-principles.md] -->
<!-- DEPENDS-ON: [setup-patterns.md] -->
<!-- REQUIRED-BY: [all-ai-assistant-integrations] -->
<!-- SEE-ALSO: [../README.md] -->
