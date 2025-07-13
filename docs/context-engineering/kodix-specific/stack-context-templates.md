<!-- AI-METADATA:
category: context-template
complexity: intermediate
updated: 2025-01-12
claude-ready: true
phase: 4
priority: high
token-optimized: true
audience: ai-assistants
ai-context-weight: critical
-->

<!-- AI-CONTEXT-BOUNDARY: start -->
# Kodix Stack Context Templates

> Pre-built context templates for optimal AI assistant performance with the Kodix technology stack

## 🎯 Purpose

These templates provide AI assistants with precise, token-optimized context about the Kodix stack, ensuring consistent and accurate code generation across all development scenarios.

## 📚 Core Stack Context

### Full Stack Overview

```markdown
You are working on the Kodix platform, a modern full-stack application with the following architecture:

**Frontend Stack**:
- Next.js 15 (App Router)
- React 19 with Server Components
- TypeScript 5.6+
- Tailwind CSS for styling
- Shadcn/ui component library
- TanStack Query for data fetching
- Zustand for client state management

**Backend Stack**:
- tRPC v11 for type-safe APIs
- Drizzle ORM for database operations
- MySQL 8.0 database
- Node.js 22+ runtime
- Zod for validation
- JWT-based authentication

**Architecture Patterns**:
- SubApp-based modular architecture
- Team-based multi-tenancy
- Service layer pattern
- Repository pattern for data access
- Event-driven communication between SubApps

**Development Standards**:
- Strict TypeScript with no 'any' types
- ESLint configuration with custom rules
- i18n required for all user-facing strings
- Comprehensive error handling
- Team-based access control on all resources
```

### Frontend-Specific Context

```markdown
You are working on the frontend of the Kodix platform. Key patterns and conventions:

**Component Structure**:
- Use functional components with TypeScript
- Implement proper loading and error states
- Follow the SubApp component organization
- Use Shadcn/ui components as base

**Data Fetching**:
- Use the `useTRPC()` hook for API calls
- Implement proper TypeScript types for all data
- Handle loading, error, and success states
- Use TanStack Query for caching

**State Management**:
- Local component state with useState
- Global state with Zustand stores
- Server state with TanStack Query
- Form state with react-hook-form

**Styling**:
- Tailwind CSS classes only
- No inline styles or CSS modules
- Use Shadcn/ui theme variables
- Responsive design required

Example component pattern:
\`\`\`typescript
import { useTRPC } from "~/trpc/react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "next-i18next";

interface UserListProps {
  teamId: string;
}

export function UserList({ teamId }: UserListProps) {
  const { t } = useTranslation();
  const trpc = useTRPC();
  
  const { data, isLoading, error } = trpc.user.findByTeam.useQuery({ teamId });
  
  if (isLoading) return <div>{t("common.loading")}</div>;
  if (error) return <div>{t("common.error")}: {error.message}</div>;
  
  return (
    <Card>
      {data?.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </Card>
  );
}
\`\`\`
```

### Backend-Specific Context

```markdown
You are working on the backend of the Kodix platform. Key patterns and conventions:

**tRPC Router Structure**:
- Procedures follow naming: create*, find*, update*, delete*
- All procedures require team context
- Use Zod schemas for input/output validation
- Implement proper error handling

**Database Operations**:
- Use Drizzle ORM for all database queries
- Apply team-based filtering on all queries
- Use transactions for multi-table operations
- Implement soft deletes where applicable

**Service Layer**:
- Business logic in service classes
- Repository pattern for data access
- Dependency injection for testability
- Event emission for SubApp communication

Example tRPC router pattern:
\`\`\`typescript
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { UserService } from "~/services/user.service";

export const userRouter = createTRPCRouter({
  findByTeam: protectedProcedure
    .input(z.object({
      teamId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const userService = new UserService(ctx.db);
      return userService.findByTeam(input.teamId, {
        limit: input.limit,
        offset: input.offset,
      });
    }),
    
  createUser: protectedProcedure
    .input(z.object({
      teamId: z.string().uuid(),
      name: z.string().min(1).max(255),
      email: z.string().email(),
      role: z.enum(["admin", "member", "viewer"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const userService = new UserService(ctx.db);
      return userService.create({
        ...input,
        createdBy: ctx.session.user.id,
      });
    }),
});
\`\`\`
```

### Database Context

```markdown
You are working with the Kodix database layer. Key patterns:

**Drizzle Schema Patterns**:
- All tables include: id, teamId, createdAt, updatedAt
- Use UUIDs for primary keys
- Implement proper indexes
- Add foreign key constraints

**Query Patterns**:
- Always filter by teamId
- Use proper joins for related data
- Implement pagination
- Add proper WHERE clauses

Example schema pattern:
\`\`\`typescript
import { mysqlTable, varchar, timestamp, uuid, index } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("member"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  teamIdIdx: index("team_id_idx").on(table.teamId),
  emailIdx: index("email_idx").on(table.email),
}));
\`\`\`
```

## 🔧 Usage Instructions

### For AI Assistants

1. **Select the appropriate context** based on the task:
   - Full Stack Overview for general tasks
   - Frontend-Specific for UI/component work
   - Backend-Specific for API/service work
   - Database Context for schema/query work

2. **Combine contexts** when working across layers:
   ```markdown
   [Include Full Stack Overview]
   [Include Frontend-Specific Context]
   [Include Backend-Specific Context]
   ```

3. **Add task-specific context**:
   ```markdown
   Task: Implement user profile management
   SubApp: profile
   Requirements: CRUD operations, image upload, team isolation
   ```

### For Developers

When prompting AI assistants:

1. **Reference this template**:
   ```
   Use the Kodix stack context from docs/context-engineering/kodix-specific/stack-context-templates.md
   ```

2. **Specify the layer**:
   ```
   Focus on the frontend implementation using the Frontend-Specific Context
   ```

3. **Provide additional context**:
   ```
   Working in the 'calendar' SubApp, need to integrate with existing event system
   ```

## 📊 Context Optimization

### Token Usage

| Context Type | Approximate Tokens | Use Case |
|--------------|-------------------|----------|
| Full Stack Overview | ~250 | General development tasks |
| Frontend-Specific | ~200 | UI/Component development |
| Backend-Specific | ~200 | API/Service development |
| Database Context | ~150 | Schema/Query work |
| Combined All | ~800 | Complex full-stack features |

### Best Practices

1. **Start minimal**: Use only the context needed for the specific task
2. **Layer contexts**: Add more specific context as needed
3. **Include examples**: Reference patterns improve accuracy
4. **Update regularly**: Keep contexts aligned with current stack

## 🔗 Related Resources

- [SubApp Context Patterns](./subapp-context-patterns.md)
- [Architecture Context Maps](./architecture-context-maps.md)
- [Development Context Flows](./development-context-flows.md)

<!-- AI-CONTEXT-BOUNDARY: end -->