#!/bin/bash

# Move File with Automatic Link Updates
# Moves a documentation file and updates all references to it across the entire docs directory

set -e

# Check arguments
if [ $# -ne 2 ]; then
    echo "Usage: $0 <source_file> <destination_file>"
    echo ""
    echo "Example:"
    echo "  $0 docs/old/backend.md docs/architecture/backend/backend-guide.md"
    echo ""
    echo "This script will:"
    echo "  1. Move the source file to destination"
    echo "  2. Find all references to the source file"
    echo "  3. Update those references to point to the new location"
    echo "  4. Create a temporary redirect file at the old location"
    echo "  5. Generate a report of all changes made"
    exit 1
fi

SOURCE_FILE="$1"
DEST_FILE="$2"

# Validate source file exists
if [ ! -f "$SOURCE_FILE" ]; then
    echo "❌ Error: Source file '$SOURCE_FILE' does not exist"
    exit 1
fi

# Create destination directory if needed
DEST_DIR=$(dirname "$DEST_FILE")
if [ ! -d "$DEST_DIR" ]; then
    echo "📁 Creating destination directory: $DEST_DIR"
    mkdir -p "$DEST_DIR"
fi

# Extract relative paths for link updates
SOURCE_RELATIVE=$(echo "$SOURCE_FILE" | sed 's|^./||' | sed 's|^docs/||')
DEST_RELATIVE=$(echo "$DEST_FILE" | sed 's|^./||' | sed 's|^docs/||')

echo "🔄 Moving file with automatic link updates..."
echo "   Source: $SOURCE_FILE"
echo "   Destination: $DEST_FILE"
echo ""

# Create backup directory
BACKUP_DIR="./backup/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📋 Step 1: Creating backup..."
cp "$SOURCE_FILE" "$BACKUP_DIR/"

echo "🔍 Step 2: Finding all references to the source file..."
# Find all markdown files that reference the source file
referencing_files=()
reference_count=0

# Search for various link patterns
patterns=(
    "$SOURCE_RELATIVE"
    "/$SOURCE_RELATIVE"
    "./$SOURCE_RELATIVE"
    "../$SOURCE_RELATIVE"
    "$(basename "$SOURCE_FILE")"
)

for pattern in "${patterns[@]}"; do
    while IFS= read -r -d '' file; do
        if grep -q "$pattern" "$file" 2>/dev/null; then
            referencing_files+=("$file")
            count=$(grep -c "$pattern" "$file" 2>/dev/null || echo "0")
            reference_count=$((reference_count + count))
            echo "   📄 Found $count references in: $file"
        fi
    done < <(find . -name "*.md" -type f -print0)
done

# Remove duplicates
referencing_files=($(printf "%s\n" "${referencing_files[@]}" | sort -u))

echo ""
echo "📊 Found ${#referencing_files[@]} files with $reference_count total references"

if [ ${#referencing_files[@]} -eq 0 ]; then
    echo "ℹ️  No references found - proceeding with simple move"
else
    echo ""
    echo "🔧 Step 3: Updating all references..."
    
    for file in "${referencing_files[@]}"; do
        echo "   📝 Updating: $file"
        
        # Create backup of file being modified
        cp "$file" "$BACKUP_DIR/"
        
        # Update various link patterns
        sed -i '' \
            -e "s|]($SOURCE_RELATIVE)|](/$DEST_RELATIVE)|g" \
            -e "s|](/$SOURCE_RELATIVE)|](/$DEST_RELATIVE)|g" \
            -e "s|](./$SOURCE_RELATIVE)|](/$DEST_RELATIVE)|g" \
            -e "s|](../*$SOURCE_RELATIVE)|](/$DEST_RELATIVE)|g" \
            "$file"
    done
fi

echo ""
echo "📁 Step 4: Moving the file..."
mv "$SOURCE_FILE" "$DEST_FILE"

echo "🔗 Step 5: Creating redirect file..."
# Create a redirect file at the old location
cat > "$SOURCE_FILE" << EOF
# 🔄 Document Moved

**This document has been moved to:** [\`$DEST_RELATIVE\`](/$DEST_RELATIVE)

**Original location:** \`$SOURCE_RELATIVE\`  
**New location:** \`$DEST_RELATIVE\`  
**Move date:** $(date)

---

*This redirect file will be removed in a future cleanup. Please update your bookmarks.*

## Quick Links

- [📖 New Document Location](/$DEST_RELATIVE)
- [🏗️ Architecture Documentation](/docs/architecture/README.md)
- [📚 Main Documentation](/docs/README.md)

EOF

echo "📊 Step 6: Generating move report..."
REPORT_FILE="$BACKUP_DIR/move-report.md"

cat > "$REPORT_FILE" << EOF
# File Move Report

**Date:** $(date)  
**Operation:** Move file with automatic link updates  
**Script:** move-file-with-updates.sh

## Move Details

- **Source:** \`$SOURCE_FILE\`
- **Destination:** \`$DEST_FILE\`
- **Files Updated:** ${#referencing_files[@]}
- **Total References Updated:** $reference_count

## Files Modified

EOF

for file in "${referencing_files[@]}"; do
    echo "- \`$file\`" >> "$REPORT_FILE"
done

cat >> "$REPORT_FILE" << EOF

## Backup Location

All original files backed up to: \`$BACKUP_DIR\`

## Next Steps

1. **Verify the move:** Check that the new file location works correctly
2. **Test all updated links:** Ensure all references resolve properly  
3. **Remove redirect:** After confirming all external references are updated
4. **Commit changes:** Add both moved file and updated references to git

## Rollback Instructions

If you need to rollback this move:

\`\`\`bash
# Restore original file
cp "$BACKUP_DIR/$(basename "$SOURCE_FILE")" "$SOURCE_FILE"

# Restore all modified files
EOF

for file in "${referencing_files[@]}"; do
    echo "cp \"$BACKUP_DIR/$(basename "$file")\" \"$file\"" >> "$REPORT_FILE"
done

cat >> "$REPORT_FILE" << EOF
\`\`\`

EOF

echo ""
echo "✅ Move completed successfully!"
echo ""
echo "📊 Summary:"
echo "   • Moved: $SOURCE_FILE → $DEST_FILE"
echo "   • Updated: ${#referencing_files[@]} files"
echo "   • References: $reference_count total links updated"
echo "   • Backup: $BACKUP_DIR"
echo "   • Report: $REPORT_FILE"
echo "   • Redirect: Created at original location"
echo ""
echo "🔍 Next steps:"
echo "   1. Review the move report: cat $REPORT_FILE"
echo "   2. Test the new file location works"
echo "   3. Validate all links: ./scripts/validate-docs.sh"
echo "   4. Commit the changes to git"
echo ""
echo "⚠️  Remember to remove the redirect file after external references are updated!"