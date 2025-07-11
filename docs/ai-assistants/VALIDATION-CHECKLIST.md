# AI Assistant Context Validation Checklist

<!-- AI-METADATA:
category: validation
priority: HIGHEST
enforce: ALWAYS
-->

## 🎯 Purpose

This checklist ensures ALL AI assistants are properly loading and enforcing Kodix priority policies.

## ✅ Pre-Task Validation

Before starting ANY development task, the AI assistant MUST:

### 1. Load Priority Documents (In Order)

- [ ] Load `docs/rules/PRIORITY-POLICIES.md` **FIRST**
- [ ] Load `docs/rules/kodix-rules.md`
- [ ] Load `docs/rules/kodix-prp-workflow.md`
- [ ] Load tool-specific configuration (if any)

### 2. Verify Policy Understanding

The AI should be able to answer these questions:

- [ ] What is the policy on using `any` type? _(Answer: Zero tolerance)_
- [ ] What pattern must be used for tRPC? _(Answer: useTRPC(), never import { api })_
- [ ] How should file edits be handled in monorepo? _(Answer: Level 1-3 strategy)_
- [ ] What language for endpoint names? _(Answer: English only)_
- [ ] Where to create planning docs? _(Answer: Appropriate planning/ subdirectory)_

### 3. Check Timestamp Awareness

- [ ] Can identify when policies were established
- [ ] Understands that newer policies override older ones
- [ ] Recognizes policy priority levels (🔴 HIGHEST, 🟠 HIGH, 🟡 MEDIUM, 🟢 STANDARD)

## 🔍 Runtime Validation

During task execution, verify:

### Code Quality Checks

- [ ] No `any` types without explicit validation
- [ ] All tRPC uses follow `useTRPC()` pattern
- [ ] ESLint rules are strictly followed
- [ ] Endpoints use English naming

### Workflow Compliance

- [ ] Planning documents created before implementation
- [ ] Debug protocol followed when troubleshooting
- [ ] Cross-package impacts checked with `pnpm typecheck`
- [ ] Documentation updated when adding new files

### Monorepo Safety

- [ ] Using appropriate file edit strategy (Level 1-3)
- [ ] Not modifying restricted SubApps
- [ ] Following Service Layer for cross-app communication
- [ ] Respecting teamId isolation

## 🚨 Red Flags

If the AI assistant does ANY of these, policies are NOT being followed:

- ❌ Uses `any` type casually
- ❌ Imports `{ api }` for tRPC
- ❌ Creates endpoints with Portuguese names
- ❌ Edits multiple files without warning about instability
- ❌ Skips planning documentation
- ❌ Ignores ESLint errors
- ❌ Uses mock data without explicit permission
- ❌ Modifies SubApps other than Chat/AI Studio without permission

## 📊 Validation Command

For users to test if AI is properly configured:

```
Please summarize the Kodix priority policies, especially regarding:
1. TypeScript any type usage
2. tRPC patterns
3. File editing in monorepo
4. Debug protocols
```

A properly configured AI should immediately reference specific policies with timestamps.

## 🔗 Configuration Points

Ensure these files reference PRIORITY-POLICIES.md:

- ✅ `docs/CLAUDE.md` - Universal reference
- ✅ `docs/rules/kodix-rules.md` - Main rules
- ✅ `.cursor/rules/README.md` - Cursor reference
- ✅ `.cursor/settings.json` - Cursor context files
- ✅ Future AI tool configurations

<!-- REQUIRED-BY: [all-ai-assistants] -->
<!-- VALIDATION-FOR: [priority-policies] -->
