# PRP: [Feature Name]
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="medium" -->
<!-- AI-METADATA:
category: prp
feature: [kebab-case-feature-name]
complexity: [basic|intermediate|advanced]
estimated-effort: [number-in-hours]
created: [YYYY-MM-DD]
-->

## 🎯 Goal

[One clear, concise sentence describing what this feature will accomplish]

## 📋 Context

[Explain the background and motivation for this feature. Include:]

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

- [ ] [Specific, measurable criterion that must be met]
- [ ] [Another specific criterion]
- [ ] [Edge case handling]
- [ ] [Performance requirement]
- [ ] [Error handling requirement]
- [ ] [Accessibility requirement if applicable]
- [ ] [Mobile responsiveness if applicable]

## 🏗️ Technical Specification

### Architecture

[Explain how this fits into Kodix architecture:]

- Which SubApp(s) are involved
- How it follows SubApp isolation principles
- Any cross-app communication needed (via Service Layer)
- Security considerations (teamId isolation)

### Components

**Frontend Components:**

- `[ComponentName]`: [Purpose and key features]

**Backend Components:**

- `[ServiceName]`: [Purpose and responsibilities]

**Database Components:**

- `[TableName]`: [Purpose and fields]

### Data Flow

1. User initiates [action]
2. Frontend sends [data] via [method]
3. Backend processes [logic]
4. Database stores/retrieves [data]
5. Response returns [format]
6. UI updates with [result]

### Stack Integration

**Next.js 15 (App Router):**

- Page/Route: `app/[subapp]/[feature]/page.tsx`
- Server Components for [use case]
- Client Components for [use case]

**tRPC v11:**

- Router: `[subapp].[feature].[method]`
- Input validation: [Zod schemas]
- Procedures: [query/mutation]

**Drizzle ORM:**

- Schema changes: [new tables/columns]
- Migrations needed: [yes/no]
- Relationships: [foreign keys]

**Zod Validation:**

- Input schemas: [list schemas]
- Output schemas: [list schemas]

**Redis (if applicable):**

- Caching strategy: [what/how/TTL]

**UI Components (Shadcn/ui):**

- Components to use: [list components]

## 🧪 🧪 Testing Requirements

### Unit Tests

**Frontend Tests:**

- [Test description]: [What it validates]

**Backend Tests:**

- [Test description]: [What it validates]

### Integration Tests

- [Test description]: [What it validates]

### E2E Tests (if critical feature)

- [Scenario description]: [What it validates]

## 🚀 Implementation Plan

### Phase 1: Setup and Foundation ([X] hours)

1. [Specific task with clear deliverable]
2. [Another specific task]

### Phase 2: Core Implementation ([X] hours)

1. [Specific task with clear deliverable]
2. [Another specific task]

### Phase 3: Testing and Polish ([X] hours)

1. [Specific task with clear deliverable]
2. [Another specific task]

## ⚠️ Risks & Mitigations

- **Risk**: [Description of potential issue]
  **Mitigation**: [How to prevent or handle it]

## 📊 Success Metrics

- [ ] All acceptance criteria met
- [ ] Test coverage > 80%
- [ ] No linting errors
- [ ] TypeScript strict mode passes
- [ ] Performance benchmarks met
- [ ] Documentation updated

## 📚 References

- <!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
[Kodix SubApp Architecture](/docs/architecture/subapp-architecture.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->
- [Relevant existing implementation]
- [External documentation if applicable]
