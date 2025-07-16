<!-- AI-METADATA:
category: prompt-library
complexity: advanced
updated: 2025-01-12
claude-ready: true
phase: 4
priority: high
token-optimized: true
audience: developers
ai-context-weight: critical
-->

<!-- AI-CONTEXT-BOUNDARY: start -->
# Architecture Decision Prompts

> Comprehensive prompts for making architectural decisions in the Kodix platform with AI assistance

## 🎯 Purpose

Provide structured prompts for architectural decision-making, ensuring decisions align with Kodix patterns, scalability requirements, and long-term maintainability.

## 🏗️ Architectural Decision Framework

### Comprehensive Architecture Decision Prompt

```markdown
**Task**: Make an architectural decision for the Kodix platform

**Context**: Kodix platform using SubApp architecture with Next.js 15, tRPC v11, React 19, Drizzle ORM, MySQL

**Decision Required**: [ARCHITECTURAL_CHALLENGE]

**Current Architecture Context**:
- SubApp-based modular architecture
- Team-based multi-tenancy
- Service layer pattern with repository abstraction
- Event-driven communication between SubApps
- Type-safe end-to-end with tRPC

**Analysis Framework**:

1. **Problem Definition**
   - What specific challenge are we solving?
   - What are the current limitations?
   - What are the business requirements?
   - What are the technical constraints?

2. **Options Analysis**
   - Option A: [Description, pros, cons, complexity]
   - Option B: [Description, pros, cons, complexity]
   - Option C: [Description, pros, cons, complexity]

3. **Evaluation Criteria**
   - Scalability impact
   - Development velocity impact
   - Maintainability considerations
   - Performance implications
   - Security considerations
   - Team isolation compatibility
   - Integration complexity

4. **Risk Assessment**
   - Technical risks
   - Business risks
   - Migration risks
   - Long-term risks

5. **Implementation Strategy**
   - Migration path
   - Timeline estimates
   - Resource requirements
   - Testing strategy

**Output Format**:
- **Recommended Decision**: Clear choice with rationale
- **Implementation Plan**: Step-by-step approach
- **Success Metrics**: How to measure success
- **Rollback Plan**: How to revert if needed
- **Documentation Requirements**: What needs to be updated

Please provide a detailed architectural decision record (ADR) format response.
```

## 🎨 Frontend Architecture Decisions

### UI Architecture Decision

```markdown
**Task**: Decide on UI architecture approach for [SPECIFIC_FEATURE]

**Context**: Kodix frontend using Next.js 15 App Router, React 19, Shadcn/ui, Tailwind CSS

**Decision Areas**:

**1. Component Architecture**
- Atomic Design vs Feature-based organization
- Shared component library structure
- SubApp-specific component isolation
- Cross-SubApp component sharing strategy

**2. State Management**
- Zustand stores vs React Context
- Server state with TanStack Query
- Global vs local state boundaries
- State persistence strategies

**3. Routing & Navigation**
- SubApp routing integration
- Dynamic routing patterns
- Navigation state management
- URL structure for multi-tenancy

**4. Performance Optimization**
- Code splitting strategies
- Bundle optimization approach
- SSR vs CSR decisions
- Caching strategies

**Example Decision Process**:
```typescript
// Decision: Component organization strategy

// Option A: Atomic Design
/components/
├── atoms/       # Basic elements
├── molecules/   # Simple combinations
├── organisms/   # Complex components
└── templates/   # Page layouts

// Option B: Feature-based
/components/
├── user/        # User-related components
├── team/        # Team-related components
├── shared/      # Shared components
└── layout/      # Layout components

// Option C: Hybrid (Recommended)
/components/
├── ui/          # Atomic design system components
├── shared/      # Shared business components
└── [subapp]/    # SubApp-specific components

// Rationale: Hybrid approach provides:
// - Clear separation of concerns
// - Reusable design system
// - SubApp isolation
// - Scalable organization
```

**Analysis Questions**:
1. How does this affect SubApp independence?
2. What's the impact on bundle size?
3. How does this scale with team growth?
4. What's the developer experience impact?
```

### State Management Decision

```markdown
**Task**: Choose state management approach for [FEATURE_CONTEXT]

**Current State**: Zustand for client state, TanStack Query for server state

**Decision Factors**:

**1. State Types to Consider**:
- UI state (modals, forms, selections)
- Application state (user preferences, settings)
- Server state (API data, caching)
- Shared state (cross-SubApp communication)

**2. SubApp Isolation Requirements**:
- Each SubApp should manage its own state
- Minimal global state dependencies
- Clear boundaries between SubApp states
- Event-driven communication for sharing

**3. Performance Considerations**:
- Bundle size impact
- Re-render optimization
- Memory usage
- Hydration performance

**Example Decision Matrix**:
| Solution | UI State | App State | Server State | Isolation | Performance |
|----------|----------|-----------|--------------|-----------|-------------|
| Zustand Only | ✅ Good | ✅ Excellent | ❌ Poor | ✅ Good | ✅ Good |
| React Context | ✅ Good | ⚠️ Limited | ❌ Poor | ⚠️ Limited | ⚠️ Careful |
| Redux Toolkit | ✅ Good | ✅ Excellent | ⚠️ Complex | ⚠️ Monolithic | ⚠️ Heavy |
| Hybrid Approach | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅ Optimal |

**Recommended Hybrid Approach**:
```typescript
// SubApp-specific Zustand store
export const useCalendarStore = create<CalendarState>((set) => ({
  selectedDate: new Date(),
  view: 'month',
  setSelectedDate: (date) => set({ selectedDate: date }),
  setView: (view) => set({ view }),
}));

// Server state with TanStack Query
export function useCalendarEvents(teamId: string) {
  const trpc = useTRPC();
  return trpc.calendar.findEvents.useQuery({ teamId });
}

// Cross-SubApp communication via events
import { eventBus } from '@/lib/event-bus';

// Emit from calendar SubApp
eventBus.emit('calendar:event-created', eventData);

// Listen in todo SubApp
useEffect(() => {
  const handler = (data) => createRelatedTodo(data);
  eventBus.on('calendar:event-created', handler);
  return () => eventBus.off('calendar:event-created', handler);
}, []);
```
```

## 🔧 Backend Architecture Decisions

### API Architecture Decision

```markdown
**Task**: Design API architecture for [SPECIFIC_DOMAIN]

**Context**: tRPC v11 with Drizzle ORM, MySQL, team-based multi-tenancy

**Decision Areas**:

**1. API Layer Organization**
- Router structure and naming
- Procedure organization
- Middleware composition
- Error handling strategy

**2. Data Access Pattern**
- Service layer vs direct DB access
- Repository pattern implementation
- Transaction management
- Query optimization

**3. Security Architecture**
- Authentication strategy
- Authorization patterns
- Team isolation enforcement
- Rate limiting approach

**4. Integration Patterns**
- SubApp communication
- External service integration
- Event emission and handling
- Caching strategy

**Example Decision: Service Layer Implementation**
```typescript
// Decision: Repository + Service pattern

// Repository Layer (Data Access)
export class UserRepository {
  constructor(private db: Database) {}
  
  async findByTeam(teamId: string): Promise<User[]> {
    return this.db.query.users.findMany({
      where: eq(users.teamId, teamId),
    });
  }
  
  async create(data: CreateUserData): Promise<User> {
    const [user] = await this.db.insert(users).values(data).returning();
    return user;
  }
}

// Service Layer (Business Logic)
export class UserService {
  constructor(
    private userRepo: UserRepository,
    private eventEmitter: EventEmitter
  ) {}
  
  async createUser(data: CreateUserInput): Promise<User> {
    // Business validation
    await this.validateCreateRules(data);
    
    // Create user
    const user = await this.userRepo.create({
      ...data,
      id: generateId(),
    });
    
    // Emit event
    this.eventEmitter.emit('user.created', user);
    
    return user;
  }
}

// tRPC Router (API Layer)
export const userRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      const service = new UserService(
        new UserRepository(ctx.db),
        ctx.eventEmitter
      );
      return service.createUser(input);
    }),
});
```

**Benefits**:
- Clear separation of concerns
- Testable business logic
- Reusable data access patterns
- Event-driven architecture support
```

## 🗄️ Database Architecture Decisions

### Database Design Decision

```markdown
**Task**: Design database architecture for [DATA_DOMAIN]

**Context**: MySQL with Drizzle ORM, team-based multi-tenancy

**Decision Factors**:

**1. Schema Design**
- Table structure and relationships
- Indexing strategy
- Data types and constraints
- Multi-tenancy approach

**2. Performance Considerations**
- Query optimization
- Scaling strategies
- Caching approaches
- Read replica usage

**3. Security & Compliance**
- Data isolation
- Audit logging
- Data retention
- Backup strategies

**Example Decision: Multi-tenancy Strategy**
```sql
-- Option A: Shared Database, Shared Schema (Row-level isolation)
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  team_id CHAR(36) NOT NULL,  -- Tenant isolation
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  
  INDEX team_id_idx (team_id),
  INDEX email_idx (email),
  
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

-- All queries must include team_id filter
SELECT * FROM users WHERE team_id = ? AND email = ?;

-- Option B: Shared Database, Separate Schemas (Schema per tenant)
-- CREATE SCHEMA team_123;
-- CREATE TABLE team_123.users (...);

-- Option C: Separate Databases (Database per tenant)
-- More isolation but complex management

-- Recommendation: Option A (Row-level isolation)
-- Reasons:
-- 1. Simpler operational management
-- 2. Better resource utilization
-- 3. Easier cross-tenant analytics
-- 4. Scales well with current team size
-- 5. Migration complexity is manageable
```

**Implementation Strategy**:
```typescript
// Enforce team isolation at ORM level
export const users = mysqlTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
}, (table) => ({
  teamIdIdx: index("team_id_idx").on(table.teamId),
  teamEmailUnique: unique("team_email_unique").on(table.teamId, table.email),
}));

// Repository pattern ensures team isolation
export class UserRepository {
  async findByTeam(teamId: string): Promise<User[]> {
    return this.db.query.users.findMany({
      where: eq(users.teamId, teamId), // Mandatory team filter
    });
  }
}
```
```

## 🚀 Scalability Architecture Decisions

### Performance & Scale Decision

```markdown
**Task**: Design for scale at [EXPECTED_SCALE_LEVEL]

**Current Scale**: [CURRENT_METRICS]
**Target Scale**: [TARGET_METRICS]

**Scaling Dimensions**:

**1. Horizontal Scaling**
- Application server scaling
- Database read replicas
- CDN for static assets
- Load balancing strategy

**2. Vertical Scaling**
- Resource optimization
- Memory usage patterns
- CPU utilization
- Storage requirements

**3. Caching Strategy**
- Application-level caching
- Database query caching
- CDN caching
- Session storage

**Example Decision: Caching Architecture**
```typescript
// Multi-layer caching strategy

// 1. Application Cache (Redis)
export class CacheService {
  constructor(private redis: Redis) {}
  
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }
  
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
}

// 2. Query Result Caching
export class UserService {
  async findByTeam(teamId: string): Promise<User[]> {
    const cacheKey = `users:team:${teamId}`;
    
    let users = await this.cache.get<User[]>(cacheKey);
    if (!users) {
      users = await this.userRepo.findByTeam(teamId);
      await this.cache.set(cacheKey, users, 600); // 10 min TTL
    }
    
    return users;
  }
}

// 3. Frontend Caching (TanStack Query)
export function useUsers(teamId: string) {
  const trpc = useTRPC();
  
  return trpc.user.findByTeam.useQuery(
    { teamId },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}
```

**Performance Targets**:
- API response time: <200ms (95th percentile)
- Page load time: <2s (initial load)
- Database query time: <50ms (average)
- Cache hit ratio: >90%
```

## 📋 Decision Documentation Template

### ADR (Architecture Decision Record) Format

```markdown
# ADR-001: [Decision Title]

**Date**: [YYYY-MM-DD]
**Status**: [Proposed | Accepted | Deprecated | Superseded]
**Deciders**: [List of decision makers]

## Context

[Describe the forces at play, including technological, political, social, and project local]

## Decision

[State the architecture decision and full justification]

## Rationale

[Describe why you chose this solution]

### Pros
- [Positive consequence 1]
- [Positive consequence 2]

### Cons
- [Negative consequence 1]
- [Negative consequence 2]

## Implementation

[Describe the implementation approach]

## Consequences

[Describe the resulting context, after applying the decision]

## Alternatives Considered

[List other options that were evaluated]

## Validation

[How to validate this decision is working]

## Related Decisions

[Link to related ADRs]
```

## 🔗 Related Resources

- [Feature Implementation Prompts](./feature-implementation.md)
- [Code Review Prompts](./code-review.md)
- [Bug Fixing Prompts](./bug-fixing.md)

<!-- AI-CONTEXT-BOUNDARY: end -->