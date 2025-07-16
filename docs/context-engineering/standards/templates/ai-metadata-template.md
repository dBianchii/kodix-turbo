# AI Metadata Template

<!-- AI-METADATA:
category: templates
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

Standardized metadata schema for all Context Engineering documentation, providing consistent AI-readable information for optimal document processing and understanding.

## 📋 Standard AI Metadata Template

### Required Fields

```markdown
<!-- AI-METADATA:
category: [category]
complexity: [level]
updated: YYYY-MM-DD
claude-ready: true
priority: [level]
token-optimized: true
audience: [target]
ai-context-weight: [importance]
-->
```

### Field Definitions

#### **category** (required)
Document classification for AI understanding:
- `methodology` - Core Context Engineering concepts and workflows
- `templates` - Reusable templates and patterns
- `patterns` - Documentation and coding patterns
- `standards` - Technical standards and guidelines
- `validation` - Quality assurance and validation tools
- `planning` - Implementation and strategic planning
- `guide` - Step-by-step instructional content
- `reference` - Quick reference and lookup materials

#### **complexity** (required)
Content difficulty level for appropriate AI handling:
- `basic` - Introductory content, simple concepts
- `intermediate` - Standard development content
- `advanced` - Complex technical content
- `expert` - Highly specialized or cutting-edge content

#### **updated** (required)
Last modification date in YYYY-MM-DD format for currency tracking.

#### **claude-ready** (required)
Always set to `true` for Context Engineering standards compliance.

#### **priority** (required)
Content importance for AI attention prioritization:
- `critical` - Essential for Context Engineering implementation
- `high` - Important for development workflow
- `medium` - Supporting information and details
- `low` - Background or supplementary content

#### **token-optimized** (required)
Always set to `true` indicating content is optimized for AI token efficiency.

#### **audience** (required)
Target audience for appropriate content presentation:
- `developers` - Software developers and engineers
- `ai-assistants` - Optimized for AI assistant consumption
- `team-leads` - Project management and strategic content
- `all` - Universal content suitable for all audiences

#### **ai-context-weight** (required)
AI processing priority for context assembly:
- `critical` - Must include in AI context when relevant
- `important` - High priority for inclusion
- `medium` - Standard priority content
- `low` - Include only if space permits

## 🔧 Usage Examples

### Methodology Document
```markdown
<!-- AI-METADATA:
category: methodology
complexity: advanced
updated: 2025-07-13
claude-ready: true
priority: critical
token-optimized: true
audience: developers
ai-context-weight: critical
-->
```

### Template Document
```markdown
<!-- AI-METADATA:
category: templates
complexity: basic
updated: 2025-07-13
claude-ready: true
priority: high
token-optimized: true
audience: developers
ai-context-weight: important
-->
```

### Pattern Reference
```markdown
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
```

## ✅ Validation Checklist

When adding AI metadata to documents:

- [ ] All required fields included
- [ ] Category accurately reflects document type
- [ ] Complexity matches actual content difficulty
- [ ] Updated date is current (YYYY-MM-DD format)
- [ ] Priority aligns with document importance
- [ ] Audience matches intended readers
- [ ] AI context weight reflects processing priority
- [ ] Metadata placed at very beginning of document
- [ ] Followed by AI-CONTEXT-BOUNDARY markers

## 🔗 Related Standards

- **[Document Template](./document-template.md)** - Complete document structure
- **[Semantic Markers](../patterns/semantic-markers.md)** - Additional AI markup patterns
- **[Context Engineering Methodology](../context-engineering-methodology.md)** - Implementation framework

<!-- AI-CONTEXT-BOUNDARY: end -->

---

**Usage**: Copy and customize the template above for all Context Engineering documentation  
**Quality**: Validate with [Standards Checklist](../validation/standards-checklist.md)  
**Last Updated**: 2025-07-13