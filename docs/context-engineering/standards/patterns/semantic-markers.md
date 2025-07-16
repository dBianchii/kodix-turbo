# Semantic Markers

<!-- AI-METADATA:
category: patterns
complexity: intermediate
updated: 2025-07-13
claude-ready: true
priority: medium
token-optimized: true
audience: developers
ai-context-weight: medium
-->

<!-- AI-CONTEXT-BOUNDARY: start -->

## 🎯 Purpose

Semantic markers for AI-readable markup patterns in Kodix documentation, providing standardized ways to embed machine-readable metadata within Markdown content.

## 📋 Core Semantic Markers

### Document Context Boundaries

```markdown
<!-- AI-CONTEXT-BOUNDARY: start -->
[Main content for AI consumption]
<!-- AI-CONTEXT-BOUNDARY: end -->
```

**Purpose**: Clearly delineates content boundaries for AI processing, enabling precise context extraction and token optimization.

### Content Classification

```markdown
<!-- AI-CONTEXT: Implementation -->
<!-- AI-CONTEXT: Architecture -->
<!-- AI-CONTEXT: Troubleshooting -->
<!-- AI-CONTEXT: Configuration -->
```

**Usage**: Mark content sections by type to help AI understand the nature of information.

### Priority Markers

```markdown
<!-- AI-PRIORITY: critical -->
<!-- AI-PRIORITY: high -->
<!-- AI-PRIORITY: medium -->
<!-- AI-PRIORITY: low -->
```

**Usage**: Indicate importance for AI context window management and processing prioritization.

## 🔗 Relationship Markers

### Document Dependencies

```markdown
<!-- DEPENDS-ON: [auth-system.md, database-guide.md] -->
<!-- REQUIRED-BY: [user-dashboard.md, admin-panel.md] -->
<!-- SEE-ALSO: [related-doc1.md, related-doc2.md] -->
```

**Purpose**: Define connections between documents for intelligent navigation and context assembly.

### Content Relationships

```markdown
<!-- EXTENDS: [base-pattern.md] -->
<!-- IMPLEMENTS: [interface-spec.md] -->
<!-- REPLACES: [legacy-approach.md] -->
```

**Purpose**: Show how content builds upon or relates to other documentation.

## 💻 Code Enhancement Markers

### Code Block Optimization

```markdown
<!-- AI-CODE-BLOCK: typescript-example -->
```typescript
// Complete working example with context
export const userService = {
  async getById(id: string, teamId: string) {
    // Team isolation pattern
    return await db.query.users.findFirst({
      where: and(
        eq(users.id, id),
        eq(users.teamId, teamId) // Required
      ),
    });
  }
};
```
<!-- /AI-CODE-BLOCK -->
```

### Pattern Documentation

```markdown
<!-- AI-PATTERN: team-isolation -->
**Problem**: Ensure data access respects team boundaries
**Solution**: Always include teamId in database queries
**Usage**: Required for all user data access
<!-- /AI-PATTERN -->
```

## 🎯 Implementation Guidelines

### Marker Placement

1. **Document Level**: AI-METADATA at top, CONTEXT-BOUNDARY around main content
2. **Section Level**: AI-CONTEXT after headings for content classification  
3. **Code Blocks**: AI-CODE-BLOCK for enhanced examples
4. **Relationships**: At document end for cross-references

### Best Practices

**Effective Usage**:
- Use consistently across related documents
- Keep markers concise and meaningful
- Update relationships when content changes
- Validate marker syntax regularly

**Avoid**:
- Overusing markers (focus on value)
- Creating custom markers without documentation
- Forgetting to update cross-references
- Mixing different marker formats

## ✅ Validation

### Required Markers

Every Context Engineering document should include:
- [ ] AI-METADATA header with complete fields
- [ ] AI-CONTEXT-BOUNDARY around main content
- [ ] Appropriate relationship markers (SEE-ALSO, DEPENDS-ON)
- [ ] Content classification markers for major sections

### Quality Checklist

- [ ] Markers follow established syntax patterns
- [ ] Cross-references point to existing files
- [ ] Priority levels are appropriate for content
- [ ] Code blocks include necessary context

## 🔗 Integration

**Template Integration**: Used in [Document Template](../templates/document-template.md)  
**Metadata Schema**: Compatible with [AI Metadata Template](../templates/ai-metadata-template.md)  
**Documentation Patterns**: Supports [Documentation Patterns](./documentation-patterns.md)

<!-- AI-CONTEXT-BOUNDARY: end -->

---

**Usage**: Apply these markers consistently in all Context Engineering documentation  
**Related**: [AI Metadata Template](../templates/ai-metadata-template.md) | [Documentation Patterns](./documentation-patterns.md)  
**Last Updated**: 2025-07-13