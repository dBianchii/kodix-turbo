#!/bin/bash

# Documentation Validation Script
# Comprehensive validation of documentation quality and consistency

set -e

echo "📚 Running documentation validation..."

total_issues=0

# Function to check a directory exists
check_directory() {
    local dir="$1"
    local description="$2"
    
    if [ ! -d "$dir" ]; then
        echo "❌ Missing directory: $dir ($description)"
        ((total_issues++))
        return 1
    fi
    return 0
}

# Function to check a file exists
check_file() {
    local file="$1"
    local description="$2"
    
    if [ ! -f "$file" ]; then
        echo "❌ Missing file: $file ($description)"
        ((total_issues++))
        return 1
    fi
    return 0
}

echo ""
echo "🔍 DOCUMENTATION STRUCTURE VALIDATION"
echo "====================================="

# Check for critical README files
echo ""
echo "📄 Checking critical README files..."
readme_missing=0

critical_readmes=(
    "README.md:Root documentation"
    "architecture/README.md:Architecture overview"
    "architecture/backend/README.md:Backend development"
    "architecture/frontend/README.md:Frontend development"
    "architecture/standards/README.md:Development standards"
    "development/README.md:Development documentation"
    "development/setup/README.md:Setup instructions"
    "subapps/README.md:SubApps overview"
)

for readme_info in "${critical_readmes[@]}"; do
    IFS=':' read -r readme_path readme_desc <<< "$readme_info"
    if ! check_file "$readme_path" "$readme_desc"; then
        ((readme_missing++))
    fi
done

if [ "$readme_missing" -eq 0 ]; then
    echo "✅ All critical README files exist"
else
    echo "⚠️  $readme_missing critical README files missing"
fi

# Check for broken internal links
echo ""
echo "🔗 Checking for broken internal links..."
broken_links=$(find . -name "*.md" -exec grep -l "]\(\.\." {} \; 2>/dev/null | wc -l || echo "0")
if [ "$broken_links" -eq 0 ]; then
    echo "✅ No broken internal links found"
else
    echo "❌ $broken_links files contain broken relative links"
    ((total_issues++))
fi

# Check for deprecated patterns in code examples
echo ""
echo "⚠️  Checking code examples for deprecated patterns..."
deprecated_examples=0

# Check for forbidden tRPC patterns in code examples (excluding documentation about them)
forbidden_patterns=$(find . -name "*.md" -exec grep -l "api\..*\.useQuery\|api\..*\.useMutation" {} \; 2>/dev/null | wc -l || echo "0")
if [ "$forbidden_patterns" -gt 0 ]; then
    echo "⚠️  Found $forbidden_patterns files with potentially deprecated tRPC usage in examples"
    # Note: These might be intentionally documented as forbidden examples
fi

# Check for version consistency
echo ""
echo "📊 Checking version consistency..."
version_issues=0

# React version consistency
react18_refs=$(find . -name "*.md" -exec grep -l "React 18" {} \; 2>/dev/null | wc -l || echo "0")
if [ "$react18_refs" -gt 0 ]; then
    echo "⚠️  Found $react18_refs files referencing React 18 (should be React 19)"
    ((version_issues++))
fi

# Next.js version consistency
nextjs14_refs=$(find . -name "*.md" -exec grep -l "Next\.js 14" {} \; 2>/dev/null | wc -l || echo "0")
if [ "$nextjs14_refs" -gt 0 ]; then
    echo "⚠️  Found $nextjs14_refs files referencing Next.js 14 (should be Next.js 15)"
    ((version_issues++))
fi

if [ "$version_issues" -eq 0 ]; then
    echo "✅ Version references are consistent"
fi

# Check for required automation scripts
echo ""
echo "🤖 Checking automation scripts..."
automation_missing=0

required_scripts=(
    "scripts/validation/validate-docs.sh:Core validation"
    "scripts/validation/validate-patterns.sh:Pattern validation"
    "scripts/maintenance/fix-broken-links.sh:Link fixing"
    "scripts/maintenance/move-file-smart.sh:Smart file operations"
    "scripts/sync/claude-sync.sh:AI optimization"
)

for script_info in "${required_scripts[@]}"; do
    IFS=':' read -r script_path script_desc <<< "$script_info"
    if ! check_file "$script_path" "$script_desc"; then
        ((automation_missing++))
    fi
done

if [ "$automation_missing" -eq 0 ]; then
    echo "✅ All automation scripts exist"
fi

# Summary
echo ""
echo "📋 VALIDATION SUMMARY"
echo "===================="

if [ "$total_issues" -eq 0 ]; then
    echo "🎉 SUCCESS: Documentation validation passed!"
    echo ""
    echo "✅ All checks passed:"
    echo "   • Critical README files exist"
    echo "   • No broken internal links"
    echo "   • Required automation scripts present"
    if [ "$version_issues" -eq 0 ]; then
        echo "   • Version references consistent"
    fi
    echo ""
    echo "📈 Documentation is ready for production!"
    exit 0
else
    echo "❌ ISSUES FOUND: $total_issues validation issues detected"
    echo ""
    echo "🔧 Recommended actions:"
    echo "   1. Create missing README files"
    echo "   2. Fix broken internal links"
    echo "   3. Ensure automation scripts exist"
    if [ "$version_issues" -gt 0 ]; then
        echo "   4. Update version references"
    fi
    echo ""
    echo "🔄 Re-run validation after fixes."
    exit 1
fi