#!/bin/bash

# Validate semantic markup implementation across documentation

set -e

echo "🔍 Validating semantic markup implementation..."

total_files=0
valid_files=0
issues_found=0

find . -name "*.md" -type f | while read -r file; do
    ((total_files++))
    
    # Check for AI-METADATA
    if ! grep -q "AI-METADATA:" "$file"; then
        echo "❌ Missing AI-METADATA in: $file"
        ((issues_found++))
    fi
    
    # Check for semantic headers
    semantic_headers=$(grep -c "^## [🔍🚀💡📋🏗️🔗🧪🔧⚙️📏⚡🔐📊📚]" "$file" 2>/dev/null || echo "0")
    if [ "$semantic_headers" -eq 0 ]; then
        echo "⚠️  No semantic headers in: $file"
    fi
    
    # Check for enhanced code blocks
    if grep -q "^```" "$file" && ! grep -q "AI-CODE-BLOCK" "$file"; then
        echo "⚠️  Code blocks without AI enhancement in: $file"
    fi
    
    # Check for AI-friendly cross-references
    if grep -q "\[.*\](.*)" "$file" && ! grep -q "AI-LINK" "$file"; then
        echo "💡 Could enhance cross-references in: $file"
    fi
    
    if [ "$issues_found" -eq 0 ]; then
        ((valid_files++))
    fi
done

echo ""
echo "📊 Validation Summary:"
echo "   Total files: $total_files"
echo "   Valid files: $valid_files"
echo "   Issues found: $issues_found"

if [ "$issues_found" -eq 0 ]; then
    echo "🎉 All files have proper semantic markup!"
    exit 0
else
    echo "🔧 Some files need semantic markup improvements."
    exit 1
fi
