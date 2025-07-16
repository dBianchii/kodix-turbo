# Generate PRP Command

When the user types `/generate-prp` followed by feature details, file path, or structured input:

## 🚨 **Mandatory Formatting Rules**

### 1. **Language Requirement: English Only**

- **ALL PRPs MUST be written exclusively in English**
- This ensures consistency, portability between AI assistants, and compatibility with global tools
- No exceptions - all sections, comments, and content must be in English

### 2. **Sequential Naming Convention**

- **ALL PRP files MUST follow sequential numbering within their folder**
- When saving a new PRP in any subfolder (e.g., `/docs/planning/model-sync/`), the filename must follow the existing numerical sequence
- **Format**: `XXX-[prp-name].md` where XXX is the next sequential number
- **Example**:
  - Current document: `023-change-something.md`
  - Next document: `024-new-feature-name.md`
- This numbering facilitates ordering, change history tracking, and traceability

## Step 1: Parse Input

Extract feature information from the user's input. Accept these formats:

1. **Direct input after command**:

   ```
   /generate-prp Add dark mode toggle to settings
   ```

2. **Reference to file**:

   ```
   /generate-prp INITIAL.md
   ```

3. **Structured format**:
   ```
   /generate-prp
   Feature: Dark mode toggle
   Context: Users need theme switching
   Users: All Kodix users
   Stack: Next.js, Tailwind, Zustand
   ```

## Step 2: **VALIDATION PHASE** 🚨

### 2.1 **Evaluate Current Code Alignment**

**CRITICAL**: Before generating any plan, verify alignment with existing codebase:

```
- Search for similar existing implementations
- Check if requested feature already exists (partially or fully)
- Verify the feature fits within current architecture
- Identify any conflicting patterns or implementations
```

### 2.2 **Validate Folder Paths**

**CRITICAL**: Ensure all referenced paths actually exist:

```
- Check if target SubApp directories exist
- Verify component/service directories are valid
- Confirm database schema paths are correct
- Validate any referenced documentation paths
```

### 2.3 **Check Feature Type Context**

Determine if this is a **lint correction plan** and apply appropriate references:

```
- If lint correction: Reference @lint-correction-playbook.md
- If lint correction: Reference @linting-and-typechecking-protocol.md
- If architecture change: Extra validation against boundaries
```

### 2.4 **Validate Naming Convention** 🔢

**MANDATORY**: Check existing files in target directory for sequential naming:

```
- List existing PRP files in target directory
- Identify the highest sequential number (e.g., 023)
- Prepare next sequential number (e.g., 024)
- Ensure filename follows format: XXX-[feature-name].md
```

## Step 3: Analyze the Kodix Codebase

### 3.1 Search for Similar Patterns

Use codebase search to understand existing patterns:

```
- For UI features: Search for similar components and UI patterns
- For API features: Find existing tRPC endpoints and patterns
- For database features: Look for schema patterns and migrations
- For state management: Find Zustand store patterns
```

### 3.2 Review Kodix Architecture

Read and understand the architecture:

```
- Read: @docs/architecture/README.md
- Read: @docs/architecture/subapp-architecture.md
- Read: Relevant SubApp documentation in @docs/subapps/
- Understand: Where this feature fits in the architecture
```

### 3.3 **Check Kodix Standards & Boundaries** 🏛️

Review coding and implementation standards with **STRICT** boundary enforcement:

```
- ESLint rules: @docs/eslint/kodix-eslint-coding-rules.md
- Architecture boundaries: @docs/architecture/data-contracts-and-boundaries.md
- Architecture standards: @docs/architecture/Architecture_Standards.md
- Lessons learned: @docs/architecture/lessons-learned.md
- Service layer patterns: @docs/architecture/service-layer-patterns.md
- i18n requirements: No hardcoded strings
- Multi-tenancy: Always consider teamId isolation
```

### 3.4 **Enforce ESLint Rules** 🚨

**MANDATORY**: Ensure the plan follows strict ESLint rules:

```
✅ REQUIRED patterns:
- useTRPC() pattern (NOT import { api })
- Explicit typing (NO @ts-nocheck)
- Promise.allSettled (NOT Promise.all)
- Validated env (NOT direct process.env)
- Organized imports (type imports separated)

❌ FORBIDDEN patterns:
- import { api } from "~/trpc/react"
- @ts-nocheck anywhere
- Unvalidated any type usage
- Promise.all without error handling
- Direct process.env access
```

## Step 4: Generate the PRP Document

Create a comprehensive PRP with these sections **IN ENGLISH ONLY**:

```markdown
# PRP: [Feature Name]

<!-- AI-METADATA:
category: prp
feature: [kebab-case-name]
complexity: [basic|intermediate|advanced]
estimated-effort: [hours]
created: [YYYY-MM-DD]
validation-status: [aligned|needs-review]
language: en
-->

## 🔍 **Pre-Implementation Validation**

### Code Alignment Check ✅

- [ ] Similar implementations reviewed
- [ ] No conflicting patterns identified
- [ ] Architecture boundaries respected
- [ ] Folder paths validated

### ESLint Compliance ✅

- [ ] useTRPC() pattern planned
- [ ] Explicit typing strategy defined
- [ ] Promise.allSettled usage planned
- [ ] Validated env usage planned
- [ ] No forbidden patterns in plan

### Mandatory Formatting ✅

- [ ] Document written in English only
- [ ] Sequential naming convention followed
- [ ] Proper numerical sequence identified

## 🎯 Goal

[One clear sentence describing what this feature accomplishes]

## 📋 Context

[2-3 paragraphs explaining:]

- Why this feature is needed
- What problem it solves
- Business value it provides
- Current pain points it addresses

## 👥 Users

[Describe who will use this feature:]

- Primary users and their needs
- Secondary users (if any)
- Use cases and scenarios
- Expected frequency of use

## ✅ Acceptance Criteria

[List specific, measurable criteria:]

- [ ] User can [specific action]
- [ ] System [specific behavior]
- [ ] Data is [specific state]
- [ ] Performance meets [metric]
- [ ] Error handling for [cases]
- [ ] Accessibility requirements met
- [ ] Mobile responsive (if applicable)
- [ ] i18n support (no hardcoded strings)
- [ ] **ESLint compliance** (all rules followed)
- [ ] **Architecture boundaries** respected

## 🏗️ Technical Specification

### Architecture

[How this fits into Kodix architecture:]

- Which SubApp(s) are involved
- SubApp isolation principles followed
- Cross-app communication (via Service Layer)
- Multi-tenancy with teamId isolation
- **Data contracts & boundaries** compliance

### Components

**Frontend Components:**

- `ComponentName`: [Purpose and features]
- Uses Shadcn/ui components
- **ESLint compliant** (useTRPC pattern)

**Backend Components:**

- `ServiceName`: [Purpose and responsibilities]
- tRPC endpoints following patterns
- **Service layer** communication

**Database Components:**

- Schema changes if needed
- Drizzle ORM patterns
- **Type-safe** operations

### Data Flow

1. User initiates [action]
2. Frontend sends [data] via tRPC (**useTRPC pattern**)
3. Backend validates with Zod
4. Database operations via Drizzle
5. Response returns [format]
6. UI updates with [result]

### Kodix Stack Integration

**Next.js 15 (App Router):**

- Page: `app/[subapp]/[feature]/page.tsx`
- Server/Client components as needed
- Loading and error states

**tRPC v11:**

- Router: `[subapp].[feature].[method]`
- Input validation with Zod
- Proper error handling
- **useTRPC() pattern** enforcement

**Drizzle ORM:**

- Schema in `packages/db/schema/`
- Type-safe queries
- Migration if needed

**UI (Shadcn/ui + Tailwind):**

- Components from `packages/ui/`
- Consistent styling
- Dark mode support

## 🧪 Testing Requirements

### Unit Tests

- Component behavior tests
- tRPC procedure tests
- Service layer tests
- Validation tests

### Integration Tests

- Full user flow
- Cross-app communication
- Database integrity
- Error scenarios

### E2E Tests (if critical)

- Complete user journey
- Performance benchmarks

**Testing Reference**: Follow patterns from `@docs/tests/README.md`

## 🚀 Implementation Plan

### Phase 1: Foundation ([X] hours)

1. **Validate folder structure** (ensure paths exist)
2. Set up routing
3. Create base components
4. Set up tRPC endpoints (**useTRPC pattern**)

### Phase 2: Core Implementation ([X] hours)

1. Implement business logic
2. Create UI components
3. Add validation
4. Connect data flow

### Phase 3: Polish & Testing ([X] hours)

1. Write comprehensive tests
2. Handle edge cases
3. Add i18n support
4. **ESLint compliance check**
5. Optimize performance

## ⚠️ Risks & Mitigations

- Risk: [Description] → Mitigation: [Strategy]
- Multi-tenancy: Ensure teamId isolation
- Performance: Consider caching strategy
- **ESLint violations**: Early validation and testing
- **Architecture boundaries**: Service layer enforcement

## 📚 References

- Architecture: @docs/architecture/
- ESLint Rules: @docs/eslint/kodix-eslint-coding-rules.md
- Data Boundaries: @docs/architecture/data-contracts-and-boundaries.md
- Service Layer: @docs/architecture/service-layer-patterns.md
- Testing: @docs/tests/README.md
- Similar features: [List existing patterns]
- Design system: @packages/ui/
```

## Step 5: **FINAL VALIDATION** 🔍

Before saving, perform final checks:

```
✅ MANDATORY CHECKS:
- [ ] All folder paths in plan actually exist
- [ ] No outdated instructions included
- [ ] ESLint compliance explicitly addressed
- [ ] Architecture boundaries respected
- [ ] Service layer patterns followed
- [ ] Multi-tenancy considerations included
- [ ] Testing plan references correct documentation
- [ ] **Document is written in English only**
- [ ] **Sequential naming convention validated**
- [ ] **Proper numerical sequence determined**
```

## Step 6: Save the PRP

Save the generated PRP to the appropriate location with **sequential naming**:

**Process:**

1. **Determine target directory** based on feature type
2. **List existing files** in target directory
3. **Identify highest sequential number** (e.g., 023)
4. **Generate next sequential number** (e.g., 024)
5. **Create filename**: `XXX-[feature-name].md`

**Directory Structure:**

```
docs/
├── subapps/
│   └── [subapp-name]/
│       └── prp/
│           ├── 001-initial-feature.md
│           ├── 002-enhancement.md
│           └── 024-[new-feature-name].md
├── core-service/
│   └── prp/
│       ├── 001-user-management.md
│       └── 015-[new-feature-name].md
└── architecture/
    └── prp/
        ├── 001-system-design.md
        └── 008-[new-feature-name].md
```

## Step 7: Provide Summary

After generating the PRP, provide a summary:

```
✅ PRP Generated: [Feature Name]

📄 Location: docs/[path]/XXX-[feature-name].md
📊 Sequential Number: XXX (next in sequence)

🔍 Validation Status:
- Code alignment: ✅ Verified
- Folder paths: ✅ Validated
- ESLint compliance: ✅ Addressed
- Architecture boundaries: ✅ Respected
- Language: ✅ English only
- Naming convention: ✅ Sequential number applied

📊 Overview:
- Complexity: [level]
- Estimated effort: [hours]
- Components: [count]
- Tests required: [count]

🚨 CRITICAL REMINDER:
This PRP follows all safeguards and coding standards.
DO NOT EXECUTE until explicitly ordered.

🚀 Next steps:
1. Review the generated PRP
2. Adjust if needed
3. Run: /execute-prp [path-to-prp] (ONLY when ready)
```

## 🚨 **EXECUTION SAFEGUARD**

**CRITICAL**: This command generates plans but **NEVER EXECUTES** them automatically.

- Plans must be explicitly reviewed before execution
- Use `/execute-prp [path]` command for implementation
- No code changes without explicit user approval

## Important Notes

- **English Only**: All PRPs must be written exclusively in English
- **Sequential Naming**: All PRP files must follow numerical sequence within their folder
- **No Mock Data**: Always use real implementations
- **i18n Required**: No hardcoded strings ever
- **Multi-tenancy**: Always consider teamId isolation
- **Testing**: Comprehensive tests are mandatory
- **Kodix Patterns**: Follow established patterns in the codebase
- **ESLint Compliance**: Strict adherence to coding rules
- **Architecture Boundaries**: Respect all architectural constraints
- **Path Validation**: Ensure all referenced paths exist
- **Execution Safety**: Never execute without explicit approval
