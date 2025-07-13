#!/bin/bash

# Validate tRPC patterns in documentation
# Distinguishes between properly documented forbidden examples and actual violations

set -e

echo "🔍 Analyzing tRPC pattern documentation..."

# Find files that contain deprecated patterns
files_with_patterns=$(find . -name "*.md" -exec grep -l "import.*{ api }.*from.*trpc" {} \; 2>/dev/null)

echo ""
echo "📊 TRPC PATTERN ANALYSIS"
echo "======================="

violation_count=0
documented_count=0

if [ -z "$files_with_patterns" ]; then
    echo "✅ No tRPC import patterns found in documentation"
else
    echo ""
    echo "Files containing 'import { api } from trpc' patterns:"
    echo ""
    
    for file in $files_with_patterns; do
        echo "📄 Analyzing: $file"
        
        # Check if file contains forbidden pattern markers anywhere in the file
        if grep -q "❌.*NUNCA\|❌.*INCORRETO\|❌.*FORBIDDEN\|❌.*ANTES\|❌.*Errado\|❌.*PROÍBE\|❌.*Remove\|❌.*ERRO" "$file" 2>/dev/null; then
            echo "   ✅ DOCUMENTED: Contains proper forbidden example markers"
            ((documented_count++))
        else
            echo "   ❌ VIOLATION: Contains unmarked deprecated pattern"
            ((violation_count++))
            # Show the specific lines for context
            echo "      Lines:"
            grep -n "import.*{ api }.*from.*trpc" "$file" | head -3 | sed 's/^/      /'
        fi
        echo ""
    done
fi

echo "📋 SUMMARY"
echo "=========="
echo "Total files analyzed: $(echo "$files_with_patterns" | wc -w)"
echo "Properly documented examples: $documented_count"
echo "Actual violations: $violation_count"

if [ "$violation_count" -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS: All tRPC patterns are properly documented!"
    echo "   All deprecated examples are correctly marked as forbidden (❌)"
    exit 0
else
    echo ""
    echo "⚠️  WARNING: $violation_count files contain unmarked deprecated patterns"
    echo "   These should be marked as forbidden examples with ❌ symbol"
    exit 1
fi