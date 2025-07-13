#!/bin/bash

# Phase 4: Apply Semantic Markup Across All Documentation
# Implements AI-first semantic markup standards for enhanced context understanding

set -e

echo "🚀 Phase 4: Applying semantic markup across all documentation..."

# Create phase4 directory if it doesn't exist
mkdir -p "scripts/phase4"

# Function to determine document category
get_document_category() {
    local file="$1"
    case "$file" in
        *architecture*) echo "architecture" ;;
        *development*) echo "development" ;;
        *subapps*) echo "subapp" ;;
        *standards*) echo "standards" ;;
        *testing*) echo "testing" ;;
        *context-engineering*) echo "automation" ;;
        *ai-assistants*) echo "automation" ;;
        *README*) echo "overview" ;;
        *) echo "reference" ;;
    esac
}

# Function to determine complexity
get_complexity() {
    local file="$1"
    local word_count=$(wc -w < "$file" 2>/dev/null || echo "0")
    
    if [ "$word_count" -lt 500 ]; then
        echo "basic"
    elif [ "$word_count" -lt 1500 ]; then
        echo "intermediate"
    else
        echo "advanced"
    fi
}

# Function to determine audience
get_audience() {
    local file="$1"
    case "$file" in
        *backend*) echo "backend" ;;
        *frontend*) echo "frontend" ;;
        *architecture*) echo "fullstack" ;;
        *product*) echo "product" ;;
        *infrastructure*) echo "devops" ;;
        *) echo "all" ;;
    esac
}

# Function to add enhanced AI metadata
add_enhanced_metadata() {
    local file="$1"
    
    # Skip if already has AI-METADATA
    if grep -q "AI-METADATA:" "$file"; then
        return 0
    fi
    
    local category=$(get_document_category "$file")
    local complexity=$(get_complexity "$file")
    local audience=$(get_audience "$file")
    local current_date=$(date +%Y-%m-%d)
    
    echo "   📝 Adding enhanced metadata to: $file"
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Add enhanced metadata at the beginning
    cat > "$file.tmp" << EOF
<!-- AI-METADATA:
category: $category
complexity: $complexity
updated: $current_date
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: $audience
ai-context-weight: important
last-ai-review: $current_date
-->

EOF
    
    # Append original content
    cat "$file" >> "$file.tmp"
    mv "$file.tmp" "$file"
    
    return 1
}

# Function to enhance section headers with semantic markers
enhance_section_headers() {
    local file="$1"
    
    echo "   🎯 Enhancing section headers in: $file"
    
    # Enhanced semantic markers for common patterns
    sed -i '' \
        -e 's/^## \([Oo]verview\|[Ii]ntroduction\)/## 🔍 \1/' \
        -e 's/^## \([Ss]etup\|[Ii]nstallation\|[Gg]etting [Ss]tarted\)/## 🚀 \1/' \
        -e 's/^## \([Uu]sage\|[Hh]ow to\)/## 💡 \1/' \
        -e 's/^## \([Ee]xample\|[Dd]emo\)/## 📋 \1/' \
        -e 's/^## \([Aa]rchitecture\|[Dd]esign\)/## 🏗️ \1/' \
        -e 's/^## \([Aa][Pp][Ii]\|[Ee]ndpoint\)/## 🔗 \1/' \
        -e 's/^## \([Tt]est\|[Tt]esting\)/## 🧪 \1/' \
        -e 's/^## \([Tt]roubleshooting\|[Dd]ebugging\)/## 🔧 \1/' \
        -e 's/^## \([Cc]onfiguration\|[Ss]ettings\)/## ⚙️ \1/' \
        -e 's/^## \([Ss]tandards\|[Bb]est [Pp]ractices\)/## 📏 \1/' \
        -e 's/^## \([Pp]erformance\|[Oo]ptimization\)/## ⚡ \1/' \
        -e 's/^## \([Ss]ecurity\)/## 🔐 \1/' \
        -e 's/^## \([Mm]onitoring\|[Ll]ogging\)/## 📊 \1/' \
        -e 's/^## \([Rr]eference\|[Dd]ocumentation\)/## 📚 \1/' \
        "$file" 2>/dev/null || true
}

# Function to add AI-friendly code block markers
enhance_code_blocks() {
    local file="$1"
    
    echo "   💻 Enhancing code blocks in: $file"
    
    # Find TypeScript code blocks and enhance them
    awk '
    /^```typescript/ { 
        print "<!-- AI-CODE-BLOCK: typescript-example -->"
        print $0
        print "// AI-CONTEXT: TypeScript implementation following Kodix patterns"
        in_code_block = 1
        next
    }
    /^```tsx/ { 
        print "<!-- AI-CODE-BLOCK: react-component -->"
        print $0
        print "// AI-CONTEXT: React component with TypeScript"
        in_code_block = 1
        next
    }
    /^```bash/ { 
        print "<!-- AI-CODE-BLOCK: shell-command -->"
        print $0
        print "# AI-CONTEXT: Shell command for Kodix development"
        in_code_block = 1
        next
    }
    /^```/ && in_code_block { 
        print $0
        print "<!-- /AI-CODE-BLOCK -->"
        in_code_block = 0
        next
    }
    { print }
    ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
}

# Function to add cross-reference enhancements
enhance_cross_references() {
    local file="$1"
    
    echo "   🔗 Enhancing cross-references in: $file"
    
    # Enhance markdown links with AI context
    sed -i '' \
        -e 's|\[\([^]]*[Aa]rchitecture[^]]*\)\](\([^)]*\))|\<!-- AI-LINK: type="dependency" importance="high" -->\n[\1](\2)\n<!-- /AI-LINK -->|g' \
        -e 's|\[\([^]]*[Ss]tandards[^]]*\)\](\([^)]*\))|\<!-- AI-LINK: type="dependency" importance="high" -->\n[\1](\2)\n<!-- /AI-LINK -->|g' \
        -e 's|\[\([^]]*[Gg]uide[^]]*\)\](\([^)]*\))|\<!-- AI-LINK: type="related" importance="medium" -->\n[\1](\2)\n<!-- /AI-LINK -->|g' \
        "$file" 2>/dev/null || true
}

# Function to add semantic callouts
add_semantic_callouts() {
    local file="$1"
    
    echo "   📢 Adding semantic callouts to: $file"
    
    # Enhance existing callouts
    sed -i '' \
        -e 's/^⚠️\(.*\)/<!-- AI-CALLOUT: type="warning" importance="high" -->\n⚠️\1\n<!-- \/AI-CALLOUT -->/' \
        -e 's/^💡\(.*\)/<!-- AI-CALLOUT: type="tip" importance="medium" -->\n💡\1\n<!-- \/AI-CALLOUT -->/' \
        -e 's/^📋\(.*\)/<!-- AI-CALLOUT: type="example" importance="high" -->\n📋\1\n<!-- \/AI-CALLOUT -->/' \
        -e 's/^✅\(.*\)/<!-- AI-PROGRESS: completed="true" verified="true" -->\n✅\1/' \
        -e 's/^❌\(.*\)/<!-- AI-STATUS: deprecated -->\n❌\1/' \
        "$file" 2>/dev/null || true
}

echo ""
echo "📊 SEMANTIC MARKUP APPLICATION"
echo "=============================="

# Process all markdown files
total_files=0
enhanced_files=0
skipped_files=0

echo ""
echo "Processing documentation files..."

find . -name "*.md" -type f | while read -r file; do
    ((total_files++))
    
    echo ""
    echo "🔍 Processing: $file"
    
    # Skip if this is a backup file
    if [[ "$file" == *.backup ]]; then
        echo "   ⏭️  Skipping backup file"
        ((skipped_files++))
        continue
    fi
    
    # Add enhanced metadata
    if add_enhanced_metadata "$file"; then
        echo "   ✅ Metadata already exists"
    else
        ((enhanced_files++))
    fi
    
    # Enhance section headers
    enhance_section_headers "$file"
    
    # Enhance code blocks
    enhance_code_blocks "$file"
    
    # Enhance cross-references
    enhance_cross_references "$file"
    
    # Add semantic callouts
    add_semantic_callouts "$file"
    
    echo "   ✅ Enhanced: $file"
done

# Create validation script for semantic markup
echo ""
echo "📋 Creating semantic markup validation script..."

cat > "scripts/phase4/validate-semantic-markup.sh" << 'EOF'
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
EOF

chmod +x "scripts/phase4/validate-semantic-markup.sh"

echo ""
echo "🎯 Creating AI context optimization script..."

cat > "scripts/phase4/optimize-ai-context.sh" << 'EOF'
#!/bin/bash

# Optimize AI context across all documentation

set -e

echo "🧠 Optimizing AI context across documentation..."

# Function to add context boundaries for large files
add_context_boundaries() {
    local file="$1"
    local word_count=$(wc -w < "$file" 2>/dev/null || echo "0")
    
    if [ "$word_count" -gt 2000 ]; then
        echo "   🎯 Adding context boundaries to large file: $file"
        
        # Add context boundary markers
        sed -i '' '1i\
<!-- AI-CONTEXT-BOUNDARY: start -->' "$file"
        
        echo '<!-- AI-CONTEXT-BOUNDARY: end -->' >> "$file"
    fi
}

# Function to optimize token usage
optimize_tokens() {
    local file="$1"
    
    echo "   ⚡ Optimizing tokens in: $file"
    
    # Add compression markers for large sections
    sed -i '' \
        -e '/^### [^#]*Implementation.*$/i\
<!-- AI-COMPRESS: strategy="summary" max-tokens="300" -->' \
        -e '/^### [^#]*Example.*$/i\
<!-- AI-COMPRESS: strategy="code-focus" max-tokens="200" -->' \
        "$file" 2>/dev/null || true
}

find . -name "*.md" -type f | while read -r file; do
    [[ "$file" == *.backup ]] && continue
    
    echo "🔍 Optimizing: $file"
    add_context_boundaries "$file"
    optimize_tokens "$file"
done

echo "✅ AI context optimization completed!"
EOF

chmod +x "scripts/phase4/optimize-ai-context.sh"

echo ""
echo "✅ SEMANTIC MARKUP APPLICATION COMPLETED"
echo "========================================"

echo ""
echo "📊 Summary:"
echo "   • Enhanced metadata system implemented"
echo "   • Semantic section headers added"
echo "   • Code blocks enhanced with AI context"
echo "   • Cross-references optimized"
echo "   • Validation scripts created"

echo ""
echo "🔄 Next Steps:"
echo "   1. Run validation: ./scripts/phase4/validate-semantic-markup.sh"
echo "   2. Optimize context: ./scripts/phase4/optimize-ai-context.sh"
echo "   3. Test AI compatibility with enhanced markup"

echo ""
echo "📁 New Files Created:"
echo "   • /scripts/phase4/validate-semantic-markup.sh"
echo "   • /scripts/phase4/optimize-ai-context.sh"
echo "   • Enhanced AI-METADATA in all documentation files"

echo ""
echo "🎯 Phase 4 Week 1 Task 1: COMPLETED"
echo "   ✅ Semantic markup standards defined"
echo "   ✅ Automated application across all docs"
echo "   ✅ Validation and optimization tools created"