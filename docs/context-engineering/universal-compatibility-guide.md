# Universal AI Assistant Compatibility Guide

<!-- AI-METADATA:
category: guide
complexity: basic
updated: 2025-07-13
claude-ready: true
priority: high
token-optimized: true
audience: developers
ai-context-weight: important
-->

<!-- AI-CONTEXT-BOUNDARY: start -->

## 🎯 Purpose

Ensure Kodix documentation works consistently across all AI development assistants through universal markdown standards and structured content.

## 🔍 Current Reality

### What Actually Works

All modern AI assistants (Claude Code, Cursor, GitHub Copilot, Gemini, Windsurf) can:
- Read and understand markdown files
- Parse HTML comments for metadata
- Follow structured documentation patterns
- Execute commands based on markdown instructions

### Universal Compatibility Matrix

| Feature | Implementation | Status | Notes |
|---------|----------------|--------|-------|
| **Markdown Documentation** | `.md` files | ✅ Working | All tools read markdown natively |
| **PRP Workflow** | `/generate-prp` and `/execute-prp` | ✅ Working | Universal commands via markdown |
| **AI Metadata** | HTML comments | ✅ Working | Gracefully ignored if not supported |
| **Semantic Markers** | `<!-- AI-CONTEXT -->` | ✅ Working | Standard HTML comment format |
| **Rule Loading** | Different entry points | ✅ Working | CLAUDE.md, .cursor/rules, etc. |

## 📋 Universal Standards

### Document Structure

Every document follows this pattern for universal compatibility:

```markdown
<!-- AI-METADATA:
category: [type]
complexity: [level]
updated: YYYY-MM-DD
claude-ready: true
priority: [level]
token-optimized: true
audience: [target]
ai-context-weight: [importance]
-->

<!-- AI-CONTEXT-BOUNDARY: start -->

# Document Title

## 🎯 Purpose
Clear objective statement

## 📋 Content
Main documentation content

## 🔗 Related Resources
Cross-references

<!-- AI-CONTEXT-BOUNDARY: end -->

---

**Last Updated**: YYYY-MM-DD
**Next**: [Related Document](./link.md)
```

### Universal Patterns That Work

1. **Standard Markdown**: Use common markdown syntax
2. **HTML Comments**: For metadata and markers
3. **Clear Structure**: Consistent heading hierarchy
4. **File References**: Relative paths to other docs
5. **Code Examples**: Standard fenced code blocks

### What to Avoid

- Tool-specific markup or features
- Proprietary formats or extensions
- Complex nested structures
- Non-standard markdown extensions
- Tool-specific configuration files in docs

## 🚀 Practical Implementation

### For the PRP Workflow

The PRP system works universally because:
- Commands are markdown files with instructions
- No executable scripts or tool-specific code
- AI reads and follows the instructions
- Same workflow across all assistants

### For Documentation

All documentation uses:
- Plain `.md` files in the `/docs` directory
- Standard markdown formatting
- HTML comments for metadata
- Clear file organization
- Cross-references via relative paths

### For AI Rules

Different tools load rules differently:
- **Claude Code**: Reads `CLAUDE.md`
- **Cursor**: Uses `.cursor/rules/`
- **Others**: Follow their specific patterns

But all rules reference the same core documentation in `/docs`.

## ✅ Compatibility Checklist

When creating documentation:

- [ ] Uses standard markdown syntax
- [ ] Includes AI metadata header
- [ ] Has AI context boundaries
- [ ] Contains clear purpose section
- [ ] Uses relative path links
- [ ] Avoids tool-specific features
- [ ] Follows Kodix writing standards
- [ ] Works as plain text file

## 🔗 Related Resources

- [Universal Compatibility Principle](./universal-compatibility-principle.md)
- [Documentation Standards](./standards/documentation-patterns.md)
- [PRP Workflow Guide](./prp/README.md)
- [Universal Commands](./commands/README.md)

<!-- AI-CONTEXT-BOUNDARY: end -->

---

**Last Updated**: 2025-07-13  
**Next**: [Current Status Summary](./current-status-summary.md)