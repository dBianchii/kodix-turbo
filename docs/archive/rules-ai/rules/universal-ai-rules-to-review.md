<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="medium" -->category: reference
complexity: basic
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: all
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# Universal AI Rules - Items Under Review

This document contains rules and guidelines removed from the main universal rules for further consideration. These items may be tool-specific, redundant, or of questionable universal value.

---

## Questionable Universal Applicability

<!-- AI-EXPAND: trigger="detailed-request" -->### Model Logging Details ⏱ 2024-07-02
Model Selector logs working: `selectedModelId="2w0uijcrljpq"` (gpt-4.1-mini). Test selection for update/callback issues using available debugging tools.

**Review Reason**: Very specific implementation detail that may not apply universally.

### Specific Package Management Commands ⏱ 2024-07-02
Use pnpm. Node.js: `pnpm env use`, Volta, fnm, Homebrew.

**Review Reason**: Too specific to current tech stack, may not be universal across all projects.

### Specific Database Access Instructions ⏱ 2024-07-02
Drizzle Studio: https://local.drizzle.studio

1. `cd packages/db-dev && docker-compose up -d`
2. `cd packages/db && pnpm studio`

**Review Reason**: Very specific to current project setup, not universal.

### Specific Build Process Instructions ⏱ 2024-07-02
Don't use `pnpm build`. Use `pnpm dev:kdx` + TypeScript checking.

**Review Reason**: Project-specific command preferences, not universal principles.

### Specific ESLint Execution Pattern ⏱ 2024-07-02
From root: `pnpm eslint apps/kdx/` (not `--filter`).

**Review Reason**: Very specific command syntax, may not apply to all projects.

---

## Potentially Redundant Information

<!-- AI-EXPAND: trigger="detailed-request" -->### Detailed User Configuration Steps ⏱ 2024-07-02
Use existing endpoints: `app.getUserAppTeamConfig`, `app.saveUserAppTeamConfig`.
Steps: Define schema → Add `appId` → Register schema → Use endpoints.

**Review Reason**: Very detailed implementation steps that may belong in specific documentation.

<!-- AI-EXPAND: trigger="detailed-request" -->### Detailed App Onboarding Checklist ⏱ 2024-07-02
Verify: Locales, Validators, Helpers, Icons. Check: Imports, Mappings, Translations, Validations, Assets.

**Review Reason**: Specific checklist that might be better in project-specific documentation.

<!-- AI-EXPAND: trigger="detailed-request" -->### Detailed Navigation Lesson ⏱ 2024-07-02
Centralized Navigation Strategy resolved duplicate URLs. Lesson: Centralize navigation.

**Review Reason**: Specific historical lesson that may not be universally applicable.

---

## Low Impact Rules

<!-- AI-EXPAND: trigger="detailed-request" -->### Specific Diagram Standards Details ⏱ 2024-07-02
When creating diagrams:
1. Use clear, descriptive labels
2. Follow consistent formatting
3. Include proper node definitions
4. Use double quotes for text
5. Avoid special characters in IDs

**Review Reason**: Very detailed formatting rules that could be in a style guide.

### Language Policy Clarification Redundancy
**Mandatory Response Language: English**
- Respond in English ALWAYS, regardless of input language
- User may write in any language
- AI must translate and respond in English
- No exceptions

**Review Reason**: Redundant with the main language policy section above it.

---

## Tool-Specific Content (Should be Moved)

<!-- AI-EXPAND: trigger="detailed-request" -->### Timestamp Implementation Details ⏱ 2024-07-02
**Universal Principle**: Always get current date/time before defining dates in documentation.
**Implementation**: Use your AI assistant's available date/time tools to ensure accuracy.

**Review Reason**: The implementation section is tool-specific and belongs in tool-specific rules.

### Browser Debugging Implementation ⏱ 2024-07-02
**Universal Principle**: Always verify frontend issues with browser tools before backend investigation.
**Implementation**: Use your AI assistant's available browser debugging capabilities (console logs, network analysis, DOM inspection, etc.).

**Review Reason**: Implementation details are tool-specific.

---

**Review Date**: 2025-07-12  
**Status**: Items extracted for further evaluation  
**Next Action**: Determine which items should be moved to project-specific docs, tool-specific rules, or discarded
