<!-- AI-METADATA:
category: standards
complexity: intermediate
updated: 2025-01-12
claude-ready: true
phase: 4
priority: high
token-optimized: true
audience: developers
ai-context-weight: critical
-->

<!-- AI-CONTEXT-BOUNDARY: start -->
# Kodix Documentation Writing Rules

> Content style, format, and quality standards for Kodix platform documentation

## 🎯 Purpose

Establish comprehensive writing standards that ensure consistency, clarity, and optimal AI assistant compatibility across all Kodix documentation.

## 📝 Content Standards

### Language & Style

#### Primary Language Rules
- **Technical Documentation**: English only
- **User-Facing Features**: English preferred, Portuguese acceptable where appropriate
- **Code Examples**: English comments and variable names only
- **File Names**: English only, kebab-case format

#### Writing Style Guidelines
- **Tone**: Professional, clear, and concise
- **Perspective**: Use second person ("you") for instructions
- **Tense**: Present tense for current features, future tense for planned features
- **Voice**: Active voice preferred over passive voice

#### Technical Terminology
- **Consistency**: Use established Kodix terminology consistently
- **Definitions**: Define technical terms on first use
- **Acronyms**: Spell out on first use, then use acronym
- **Case Sensitivity**: Follow established naming conventions

### Content Structure

#### Document Organization
```markdown
<!-- AI-METADATA: [required metadata] -->

<!-- AI-CONTEXT-BOUNDARY: start -->
# Document Title

> Brief description or purpose statement

## 🎯 Purpose
[What this document covers and why it exists]

## 📋 Main Content Sections
[Organized content with clear headers]

## 🔗 Related Resources
[Links to related documentation]

<!-- AI-CONTEXT-BOUNDARY: end -->
```

#### Header Hierarchy
- **H1 (#)**: Document title only
- **H2 (##)**: Major sections
- **H3 (###)**: Subsections
- **H4 (####)**: Details within subsections
- **Maximum Depth**: H4 recommended, H5 only if absolutely necessary

#### Section Organization
1. **Purpose Statement**: Clear objective and scope
2. **Prerequisites**: Required knowledge or setup
3. **Main Content**: Core information with examples
4. **Related Resources**: Cross-references and next steps
5. **Metadata**: Status, version, maintenance info

## 🏷️ AI-First Markup Standards

### Required Metadata
```markdown
<!-- AI-METADATA:
category: [architecture|component|api|guide|reference|standards]
complexity: [basic|intermediate|advanced]
updated: YYYY-MM-DD
claude-ready: true
phase: [1|2|3|4]
priority: [low|medium|high|critical]
token-optimized: true
audience: [developers|fullstack|backend|frontend|devops|all]
ai-context-weight: [low|medium|important|critical]
-->
```

### Context Boundaries
- **Required**: Every document must have AI-CONTEXT-BOUNDARY markers
- **Purpose**: Clearly delineate content for AI consumption
- **Implementation**: Wrap main content between start and end markers

### Semantic Markers
```markdown
<!-- AI-CONTEXT: This section provides essential context -->
<!-- AI-PRIORITY: high -->
<!-- AI-TOKENS: estimated 150 -->

# Section Content

<!-- AI-SEMANTIC: architecture-pattern -->
<!-- AI-DEPENDENCIES: ["team-management", "configuration-system"] -->
<!-- AI-RELATED: ["backend-guide", "frontend-guide"] -->
<!-- AI-EXAMPLES: 3 -->
```

### Code Block Enhancement
```markdown
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
export const userRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      // Implementation with team isolation
      return await ctx.db.query.users.findFirst({
        where: and(
          eq(users.id, input.id),
          eq(users.teamId, ctx.session.teamId)
        ),
      });
    }),
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->
```

## 💻 Code Example Standards

### Code Quality Requirements
- **Working Examples**: All code must be tested and functional
- **Complete Context**: Include necessary imports and setup
- **Error Handling**: Show proper error handling patterns
- **Team Isolation**: Demonstrate team-based access control where applicable

### Code Documentation
```typescript
// ✅ Good: Clear, descriptive comments
export async function createUser(userData: CreateUserInput): Promise<User> {
  // Validate input data according to business rules
  const validatedData = CreateUserSchema.parse(userData);
  
  // Ensure team isolation in user creation
  const user = await db.insert(users).values({
    ...validatedData,
    teamId: getCurrentTeamId(),
  });
  
  return user;
}

// ❌ Bad: Unclear or missing comments
export async function createUser(data: any) {
  return await db.insert(users).values(data);
}
```

### Example Patterns
#### tRPC Patterns
```typescript
// ✅ Correct pattern
const trpc = useTRPC();
const { data } = trpc.user.getById.useQuery({ id: userId });

// ❌ Incorrect pattern  
import { api } from '~/trpc/server';
const { data } = api.user.getById.useQuery({ id: userId });
```

#### Database Patterns
```typescript
// ✅ With team isolation
const users = await db.query.users.findMany({
  where: eq(users.teamId, currentTeamId),
});

// ❌ Without team isolation
const users = await db.query.users.findMany();
```

## 🔗 Cross-Reference Standards

### Internal Links
```markdown
<!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
[Architecture Standards](../architecture/standards/architecture-standards.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->
```

### Link Categories
- **dependency**: Required reading for understanding current content
- **related**: Helpful additional information
- **reference**: Technical reference material
- **guide**: Step-by-step instructions

### Link Validation
- **Relative Paths**: Use relative paths for internal links
- **Descriptive Text**: Link text should describe destination content
- **Context**: Include brief context for why link is relevant
- **Testing**: All links must be validated before publication

## 📊 Quality Standards

### Content Quality Checklist
- [ ] **Clear Purpose**: Document objective is obvious
- [ ] **Complete Information**: All necessary details included
- [ ] **Working Examples**: Code examples tested and functional
- [ ] **Proper Structure**: Follows established hierarchy
- [ ] **Cross-References**: Appropriate links to related content
- [ ] **AI Metadata**: Required metadata headers included
- [ ] **Language Consistency**: Follows language standards
- [ ] **Error-Free**: No spelling or grammatical errors

### Technical Accuracy
- **Code Examples**: Must compile and run correctly
- **API References**: Match actual implementation
- **Version Alignment**: Reflect current technology versions
- **Pattern Compliance**: Follow established Kodix patterns

### Maintenance Requirements
- **Regular Reviews**: Quarterly content review cycles
- **Update Triggers**: Update when referenced code changes
- **Deprecation Notices**: Clear marking of deprecated content
- **Version Tracking**: Maintain version information

## 🎨 Formatting Guidelines

### Visual Elements
#### Emojis for Section Headers
- 🎯 Purpose/Objective
- 📋 Lists/Content
- 🏗️ Architecture/Structure
- 🔧 Implementation/Technical
- 🚀 Getting Started/Quick Start
- 🔗 Related/Links
- ⚠️ Warnings/Important
- ✅ Success/Completed
- ❌ Errors/Incorrect

#### Code Formatting
- **Inline Code**: Use backticks for `variable names`, `function names`, and `file paths`
- **Code Blocks**: Use fenced code blocks with language specification
- **Syntax Highlighting**: Always specify language for proper highlighting

#### Tables
```markdown
| Feature | Support | Notes |
|---------|---------|-------|
| Authentication | ✅ Complete | JWT-based |
| Team Isolation | ✅ Complete | Row-level security |
| Real-time Updates | 🔄 In Progress | WebSocket implementation |
```

### Status Indicators
- ✅ Complete/Implemented
- 🔄 In Progress
- ⏳ Planned
- ❌ Not Supported
- ⚠️ Deprecated
- 🆕 New Feature

## 🤖 AI Assistant Optimization

### Token Optimization
- **Concise Writing**: Remove unnecessary words while maintaining clarity
- **Structured Content**: Use consistent patterns AI can recognize
- **Progressive Disclosure**: Start with overview, then provide details
- **Hierarchical Organization**: Clear information hierarchy

### Context Compression
```markdown
<!-- AI-COMPRESS: strategy="summary" max-tokens="150" -->
**Quick Summary**: Essential points for rapid AI understanding
<!-- /AI-COMPRESS -->

Detailed content follows for human readers and comprehensive AI context.
```

### Universal Compatibility
- **Claude Code**: VibeCoding methodology support
- **Cursor**: Enhanced autocomplete patterns
- **GitHub Copilot**: Pattern recognition optimization
- **Gemini**: Multi-modal content understanding
- **ChatGPT**: Structured conversation support

## 🔄 Review & Approval Process

### Content Review Workflow
1. **Author Review**: Self-review against standards checklist
2. **Peer Review**: Technical accuracy verification
3. **Standards Review**: Compliance with writing rules
4. **Final Approval**: Maintainer approval before publication

### Quality Gates
- **Automated Validation**: Link checking, spell checking, format validation
- **Manual Review**: Technical accuracy, clarity, completeness
- **AI Compatibility**: Markup validation, token optimization verification

## 🔗 Related Standards

- [Folder Structure](./folder-structure.md) - Directory organization standards
- [AI Assistant Compatibility](./ai-assistant-compatibility.md) - AI optimization guidelines
- [Core Architecture Documentation](./core-architecture-docs.md) - Architecture-specific standards

---

**Last Updated**: 2025-01-12  
**Version**: 1.0 (Consolidated from Phase 1-4 implementation)

<!-- AI-CONTEXT-BOUNDARY: end -->