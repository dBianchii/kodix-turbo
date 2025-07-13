#!/bin/bash

# Fix Broken Links - Batch Script
# This script fixes common broken link patterns found in documentation

set -e

echo "🔧 Starting batch fix of broken links..."

# Function to fix links in a file
fix_links_in_file() {
    local file="$1"
    echo "  📝 Fixing links in: $file"
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Fix various broken link patterns
    sed -i '' \
        -e 's|\.\./rules/universal-ai-rules\.md|/docs/rules/universal-ai-rules.md|g' \
        -e 's|\.\./rules/claude-rules\.md|/docs/rules/claude-rules.md|g' \
        -e 's|\.\./rules/cursor-rules\.md|/docs/rules/cursor-rules.md|g' \
        -e 's|\.\./rules/gemini-rules\.md|/docs/rules/gemini-rules.md|g' \
        -e 's|\.\./rules/README\.md|/docs/rules/README.md|g' \
        -e 's|\.\./context-engineering/|/docs/context-engineering/|g' \
        -e 's|\.\./architecture/README\.md|/docs/architecture/README.md|g' \
        -e 's|\.\./architecture/standards/architecture-standards\.md|/docs/architecture/standards/architecture-standards.md|g' \
        -e 's|\.\./development/setup/|/docs/development/setup/|g' \
        -e 's|\.\./development/testing/|/docs/development/testing/|g' \
        -e 's|\.\./core/api-reference/|/docs/core/api-reference/|g' \
        -e 's|\.\./universal-principles\.md|/docs/ai-assistants/universal-principles.md|g' \
        -e 's|\.\.\/\.\.\/database/planning/platform-config-repository-plan\.md|/docs/database/planning/platform-config-repository-plan.md|g' \
        -e 's|backend-guide\.md|/docs/architecture/backend/backend-guide.md|g' \
        -e 's|frontend-guide\.md|/docs/architecture/frontend/frontend-guide.md|g' \
        -e 's|development-setup\.md|/docs/development/setup/development-setup.md|g' \
        -e 's|service-layer-patterns\.md|/docs/architecture/backend/service-layer-patterns.md|g' \
        "$file"
}

# Find and fix all markdown files with relative links
echo "🔍 Finding files with broken relative links..."

# Fix files in ai-assistants directory
if [ -d "ai-assistants" ]; then
    find ai-assistants -name "*.md" -type f | while read -r file; do
        if grep -q "\]\(\.\.\/" "$file" 2>/dev/null; then
            fix_links_in_file "$file"
        fi
    done
fi

# Fix files in applications directory
if [ -d "applications" ]; then
    find applications -name "*.md" -type f | while read -r file; do
        if grep -q "\]\(\.\.\/" "$file" 2>/dev/null; then
            fix_links_in_file "$file"
        fi
    done
fi

# Fix files in core-service directory
if [ -d "core-service" ]; then
    find core-service -name "*.md" -type f | while read -r file; do
        if grep -q "\]\(\.\.\/" "$file" 2>/dev/null; then
            fix_links_in_file "$file"
        fi
    done
fi

# Fix files in development directory
if [ -d "development" ]; then
    find development -name "*.md" -type f | while read -r file; do
        if grep -q "\]\(\.\.\/" "$file" 2>/dev/null; then
            fix_links_in_file "$file"
        fi
    done
fi

# Fix files in architecture directory
if [ -d "architecture" ]; then
    find architecture -name "*.md" -type f | while read -r file; do
        if grep -q "\]\(\.\.\/" "$file" 2>/dev/null; then
            fix_links_in_file "$file"
        fi
    done
fi

echo "✅ Batch fixing completed!"

# Verify fixes
echo "🔍 Verifying fixes..."
broken_count=$(find docs -name "*.md" -exec grep -l "\]\(\.\.\/" {} \; 2>/dev/null | wc -l || echo "0")
echo "📊 Remaining files with relative links: $broken_count"

echo "🎉 Batch link fixing process completed!"