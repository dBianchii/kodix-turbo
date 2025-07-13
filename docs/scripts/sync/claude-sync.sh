#!/bin/bash

# Claude Code Synchronization Script
# Ensures documentation is optimized for Claude Code AI assistant
# Location: /docs/scripts/sync/claude-sync.sh
# Usage: From /docs directory: ./scripts/sync/claude-sync.sh

set -e

echo "🤖 Synchronizing documentation for Claude Code compatibility..."

# Function to add AI metadata if missing
add_ai_metadata() {
    local file="$1"
    local category="$2"
    local complexity="$3"
    
    # Check if metadata already exists
    if grep -q "AI-METADATA:" "$file"; then
        return
    fi
    
    echo "   📝 Adding metadata to: $file"
    
    # Create temporary file with metadata
    cat > "$file.tmp" << EOF
<!-- AI-METADATA:
category: $category
complexity: $complexity
updated: $(date +%Y-%m-%d)
claude-ready: true
-->

EOF
    
    # Append original content
    cat "$file" >> "$file.tmp"
    mv "$file.tmp" "$file"
}

# Function to enhance semantic markers
enhance_semantic_markers() {
    local file="$1"
    
    echo "   🎯 Enhancing semantic markers in: $file"
    
    # Add semantic markers for common patterns
    sed -i '' \
        -e 's/^## \(.*Overview.*\)/## 🔍 \1/' \
        -e 's/^## \(.*Setup.*\)/## 🚀 \1/' \
        -e 's/^## \(.*Installation.*\)/## 📦 \1/' \
        -e 's/^## \(.*Usage.*\)/## 💡 \1/' \
        -e 's/^## \(.*Example.*\)/## 📋 \1/' \
        -e 's/^## \(.*Architecture.*\)/## 🏗️ \1/' \
        -e 's/^## \(.*API.*\)/## 🔗 \1/' \
        -e 's/^## \(.*Testing.*\)/## 🧪 \1/' \
        -e 's/^## \(.*Troubleshooting.*\)/## 🔧 \1/' \
        "$file" 2>/dev/null || true
}

# Function to validate Claude compatibility
validate_claude_compatibility() {
    local file="$1"
    local issues=0
    
    # Check for Claude-friendly elements
    if ! grep -q "AI-METADATA\|🎯\|📋\|🔧\|📊" "$file"; then
        echo "   ⚠️  Low Claude compatibility in: $file"
        ((issues++))
    fi
    
    # Check for clear structure
    if ! grep -q "^## " "$file"; then
        echo "   ⚠️  Missing clear section structure in: $file"
        ((issues++))
    fi
    
    return $issues
}

echo ""
echo "📊 CLAUDE CODE OPTIMIZATION"
echo "==========================="

# Process all markdown files
total_files=0
enhanced_files=0
compatible_files=0

find . -name "*.md" -type f | while read -r file; do
    ((total_files++))
    
    echo ""
    echo "🔍 Processing: $file"
    
    # Determine category and complexity
    category="reference"
    complexity="basic"
    
    case "$file" in
        *architecture*) category="architecture"; complexity="intermediate" ;;
        *development*) category="development"; complexity="intermediate" ;;
        *subapps*) category="subapp"; complexity="advanced" ;;
        *standards*) category="standards"; complexity="basic" ;;
        *testing*) category="testing"; complexity="intermediate" ;;
        *README*) category="overview"; complexity="basic" ;;
    esac
    
    # Add metadata if missing
    if ! grep -q "AI-METADATA:" "$file"; then
        add_ai_metadata "$file" "$category" "$complexity"
        ((enhanced_files++))
    fi
    
    # Enhance semantic markers
    enhance_semantic_markers "$file"
    
    # Validate compatibility
    if validate_claude_compatibility "$file"; then
        ((compatible_files++))
    fi
done

echo ""
echo "🤖 CLAUDE.md OPTIMIZATION"
echo "========================="

# Check if CLAUDE.md exists and is properly configured
if [ -f "../CLAUDE.md" ]; then
    echo "✅ CLAUDE.md exists"
    
    # Check for proper documentation references
    claude_refs=$(grep -c "@docs/" "../CLAUDE.md" 2>/dev/null || echo "0")
    if [ "$claude_refs" -ge 5 ]; then
        echo "✅ Good documentation references in CLAUDE.md: $claude_refs"
    else
        echo "⚠️  Limited documentation references in CLAUDE.md: $claude_refs"
        echo "   Consider adding more @docs/ references for better context"
    fi
else
    echo "⚠️  CLAUDE.md not found in project root"
    echo "   Creating basic CLAUDE.md template..."
    
    cat > "../CLAUDE.md" << 'EOF'
# Claude Code Context

## Essential Documentation

- **Project Overview**: @docs/README.md
- **Architecture**: @docs/architecture/README.md
- **Development Setup**: @docs/development/setup/development-setup.md
- **Standards**: @docs/architecture/standards/architecture-standards.md
- **SubApps**: @docs/subapps/README.md

## AI Assistant Integration

This project is optimized for AI-assisted development with Claude Code.
All documentation includes AI-METADATA for better context understanding.

## Quick References

- **Backend Development**: @docs/architecture/backend/backend-guide.md
- **Frontend Development**: @docs/architecture/frontend/frontend-guide.md
- **Testing**: @docs/development/testing/README.md
- **Troubleshooting**: @docs/development/debugging/troubleshooting-guide.md
EOF
fi

echo ""
echo "📊 AI CONTEXT VALIDATION"
echo "========================"

# Generate context summary for Claude
context_files=0
context_size=0

echo ""
echo "📈 Documentation context analysis:"

# Count files by category
architecture_files=$(find . -path "*/architecture/*" -name "*.md" | wc -l)
development_files=$(find . -path "*/development/*" -name "*.md" | wc -l)
subapp_files=$(find . -path "*/subapps/*" -name "*.md" | wc -l)

echo "   • Architecture docs: $architecture_files files"
echo "   • Development docs: $development_files files"
echo "   • SubApp docs: $subapp_files files"
echo "   • Total enhanced: $enhanced_files files"

# Check for AI-friendly patterns
ai_patterns=$(find . -name "*.md" -exec grep -l "🎯\|📋\|🔧\|📊\|⚠️\|✅\|❌" {} \; | wc -l)
metadata_files=$(find . -name "*.md" -exec grep -l "AI-METADATA" {} \; | wc -l)

echo "   • Files with semantic markers: $ai_patterns"
echo "   • Files with AI metadata: $metadata_files"

# Calculate Claude compatibility score
total_docs=$(find . -name "*.md" | wc -l)
compatibility_score=$((metadata_files * 100 / total_docs))

echo ""
echo "🤖 Claude Code Compatibility Score: $compatibility_score%"

if [ "$compatibility_score" -ge 80 ]; then
    echo "🎉 EXCELLENT: Documentation is highly optimized for Claude Code"
elif [ "$compatibility_score" -ge 60 ]; then
    echo "✅ GOOD: Documentation has good Claude Code compatibility"
elif [ "$compatibility_score" -ge 40 ]; then
    echo "⚠️  FAIR: Documentation could benefit from more AI optimization"
else
    echo "❌ POOR: Documentation needs significant AI optimization"
fi

echo ""
echo "💡 RECOMMENDATIONS"
echo "=================="

if [ "$compatibility_score" -lt 80 ]; then
    echo "To improve Claude Code compatibility:"
    echo "   1. Add AI-METADATA to more files"
    echo "   2. Use more semantic markers (🎯, 📋, 🔧, etc.)"
    echo "   3. Structure content with clear sections"
    echo "   4. Add more references in CLAUDE.md"
fi

echo ""
echo "✅ Claude Code synchronization completed!"
echo ""
echo "📊 Summary:"
echo "   • Total files processed: $total_docs"
echo "   • Files enhanced: $enhanced_files"
echo "   • AI metadata coverage: $compatibility_score%"
echo "   • Semantic marker usage: $ai_patterns files"
echo ""
echo "🚀 Next steps:"
echo "   1. Test with Claude Code to verify improved context understanding"
echo "   2. Run validation: ./scripts/validation/validate-docs.sh"
echo "   3. Update CLAUDE.md with additional references if needed"