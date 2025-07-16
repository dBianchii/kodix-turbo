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
