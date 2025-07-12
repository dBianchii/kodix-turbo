#!/bin/bash
#
# This script synchronizes the official project rules from /docs/rules
# to the .cursor/rules directory, which is used by the AI assistant.
#
# --- WHY ---
# It establishes a single source of truth for all project policies (/docs/rules)
# while providing the AI with a direct, consolidated context file.
# This version consolidates all rules into a single README.md for the AI.
#
# --- USAGE ---
# Run this script from the repository root:
# ./scripts/sync-rules.sh
#

# Exit immediately if a command exits with a non-zero status.
set -e

# Define source and destination files
SOURCE_README="docs/rules/README.md"
DEST_DIR=".cursor/rules"
DEST_README="$DEST_DIR/README.md"
DEST_GEMINI_RULES="GEMINI.md" # Gemini CLI rules file in root

# 0. Ensure the destination directory is writable before cleaning it.
#    The script makes it read-only on completion, so this is required to run it again.
if [ -d "$DEST_DIR" ]; then
  echo "Temporarily making '$DEST_DIR' writable..."
  chmod -R u+w "$DEST_DIR"
fi

# 1. Verify that the source README exists.
if [ ! -f "$SOURCE_README" ]; then
  echo "Error: Source README '$SOURCE_README' not found."
  exit 1
fi

# 2. Ensure the destination directory exists, creating it if necessary.
echo "Ensuring destination directory '$DEST_DIR' exists..."
mkdir -p "$DEST_DIR"

# 3. Remove all contents from the destination directory to ensure a clean sync.
echo "Cleaning destination directory..."
rm -rf "$DEST_DIR"/*

# 4. Consolidate the source README into the destination README for the AI.
echo "Copying consolidated rules from '$SOURCE_README' to '$DEST_README'..."
cp "$SOURCE_README" "$DEST_README"

# 4a. Copy the universal rules to the GEMINI.md file for Gemini CLI.
echo "Copying universal rules from '$SOURCE_README' to '$DEST_GEMINI_RULES'..."
cp "$SOURCE_README" "$DEST_GEMINI_RULES"

# 5. Make the destination directory and its contents read-only to prevent accidental edits.
echo "Setting read-only permissions on '$DEST_DIR'..."
chmod -R a-w "$DEST_DIR"

# 6. Validate coherence with entry point files.
echo "Validating entry point..."
VALIDATION_PASSED=true

# Check .cursorrules for the entry point
if ! grep -q "$DEST_DIR" ".cursorrules"; then
    echo "  - ⚠️ WARNING: '.cursorrules' does not seem to reference the AI entrypoint at '$DEST_DIR'."
    VALIDATION_PASSED=false
fi

if [ "$VALIDATION_PASSED" = true ]; then
  echo "  - ✅ Entry point appears coherent."
fi

echo "✅ Rules synchronized successfully!" 