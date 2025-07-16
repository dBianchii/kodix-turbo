<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="medium" -->category: reference
complexity: intermediate
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: all
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# Claude Code Rules - Items Under Review

This document contains rules and guidelines removed from the main Claude Code rules for further consideration. These items may be redundant, overly detailed, or of questionable value.

---

## Overly Detailed Tool Instructions

### Verbose File Operation Examples ⏱ 2025-07-12

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Sequential context loading for VibeCoding
1. Read universal rules and project overview
2. Load relevant architecture documentation
3. Examine specific implementation patterns
4. Review testing and validation requirements

// Parallel analysis using available tools
Task([
  "Analyze component patterns",
  "Review API integration",
  "Check testing strategies"
])
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**Review Reason**: Too verbose and redundant with simpler guidance. Basic tool usage should be intuitive.

<!-- AI-EXPAND: trigger="detailed-request" -->### Detailed PRP Workflow Implementation ⏱ 2025-07-12

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// /generate-prp implementation
1. Read docs/context-engineering/commands/generate-prp.md
2. Analyze feature request using Claude's comprehension
3. Search codebase for relevant patterns using Glob/Grep
4. Generate comprehensive PRP following template
5. Save to appropriate location based on scope

// /execute-prp implementation  
1. Read docs/context-engineering/commands/execute-prp.md
2. Load and analyze PRP document thoroughly
3. Create implementation plan with Claude's reasoning
4. Implement using systematic file operations
5. Run validation and tests via Bash
6. Update documentation as needed
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**Review Reason**: Redundant with universal PRP rules. Tool-specific implementation details are excessive.

---

## Redundant Information

<!-- AI-EXPAND: trigger="detailed-request" -->### Context Assembly Detailed Examples ⏱ 2025-07-12

#### Progressive Discovery Examples
- **Priority Loading**: Universal rules → Architecture → Specific implementation
- **Progressive Discovery**: Use Read tool for deep analysis, Glob for pattern matching
- **Semantic Understanding**: Leverage Claude's natural language comprehension for documentation

**Review Reason**: Redundant with general VibeCoding workflow guidance.

### Extensive Integration Checklists ⏱ 2025-07-12

#### Tool Availability Verification
- [ ] `Edit` and `MultiEdit` working for file modifications
- [ ] `Read` tool available for file analysis
- [ ] `Bash` tool configured for commands and validation
- [ ] `Glob` and `Grep` available for codebase search
- [ ] `Task` tool working for complex analysis operations

#### VibeCoding Optimization
- [ ] Context engineering principles understood and applied
- [ ] Progressive disclosure pattern implemented
- [ ] Documentation-first approach activated
- [ ] Multi-step reasoning processes established
- [ ] Quality validation workflows integrated

**Review Reason**: Too detailed and repetitive. Basic tool availability should be assumed.

---

## Low Value Additions

<!-- AI-EXPAND: trigger="detailed-request" -->### Model-Specific Debugging Detail ⏱ 2025-07-12

Model Selector logs working: `selectedModelId="2w0uijcrljpq"` (gpt-4.1-mini). Test selection for update/callback issues using Claude Code's analysis and Bash tool for log investigation.

**Review Reason**: Very specific debugging detail that may not be universally relevant.

### Verbose Communication Patterns ⏱ 2025-07-12

### Communication Patterns
- **Explanatory Approach**: Provide reasoning for decisions when helpful
- **Structured Output**: Use clear formatting and organization
- **Validation Transparency**: Show testing and quality check results
- **Documentation Updates**: Keep relevant docs current with changes

**Review Reason**: These are basic professional practices, not specific rules needed.

---

## Questionable Tool-Specific Content

### Extensive Context Window Management ⏱ 2025-07-12

#### Claude Code Context Window Management
- **Priority Loading**: Universal rules → Architecture → Specific implementation
- **Progressive Discovery**: Use Read tool for deep analysis, Glob for pattern matching
- **Semantic Understanding**: Leverage Claude's natural language comprehension for documentation

**Review Reason**: While useful, this level of detail might be excessive for a rules document.

### Advanced Techniques Section ⏱ 2025-07-12

### Context Engineering Excellence
- Load documentation systematically following universal principles
- Use semantic understanding to prioritize relevant information
- Apply progressive disclosure for complex implementations
- Maintain cross-tool compatibility in documentation updates

### Reasoning Integration
- Combine analytical reasoning with practical implementation
- Use pattern recognition for architectural consistency
- Apply logical deduction for problem-solving
- Leverage comprehensive understanding for quality outcomes

**Review Reason**: Very abstract guidance that doesn't provide concrete actionable rules.

---

## Potentially Redundant Best Practices

### File Operations Excellence ⏱ 2025-07-12

- **Targeted Changes**: Use `Edit` with sufficient context for uniqueness
- **Complex Modifications**: Use `MultiEdit` with careful sequential planning
- **New Development**: Use `Write` after thorough analysis of requirements
- **Cross-file Operations**: Apply systematic approach with validation

**Review Reason**: Redundant with the decision matrix earlier in the document.

### VibeCoding Mastery ⏱ 2025-07-12

- **Context First**: Always load relevant documentation before implementation
- **Reasoning-Driven**: Use Claude's analytical capabilities for problem-solving
- **Pattern-Aware**: Leverage existing Kodix patterns and conventions
- **Quality-Focused**: Integrate validation and testing throughout development

**Review Reason**: These are implied by the main workflow guidance and may be redundant.

---

**Review Date**: 2025-07-12  
**Status**: Items extracted for further evaluation  
**Next Action**: Determine which items add real value vs. redundant guidance
