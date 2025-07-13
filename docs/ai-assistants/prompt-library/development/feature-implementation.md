<!-- AI-METADATA:
category: prompt-library
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
# Feature Implementation Prompts

> Pre-built, tested prompts for implementing new features in the Kodix platform

## 🎯 Purpose

Provide developers with ready-to-use prompts for AI assistants to implement features following Kodix patterns and standards.

## 🚀 Full-Stack Feature Implementation

### Complete Feature Prompt Template

```markdown
**Context**: You are implementing a new feature in the Kodix platform.

**Stack**: Next.js 15 (App Router), React 19, TypeScript, tRPC v11, Drizzle ORM, MySQL, Tailwind CSS

**Architecture**: SubApp-based modular system with team-based multi-tenancy

**Feature**: [FEATURE_NAME]
**SubApp**: [TARGET_SUBAPP]
**Requirements**: [DETAILED_REQUIREMENTS]

**Implementation Plan**:
1. Database schema with proper team isolation
2. Service layer with business logic
3. tRPC router with CRUD operations
4. Frontend components using shadcn/ui
5. Proper error handling and validation
6. i18n for all user-facing strings
7. Comprehensive tests

**Standards to Follow**:
- No 'any' types in TypeScript
- Team-based data isolation (mandatory teamId filtering)
- Use `useTRPC()` hook, never import { api }
- ESLint rules must pass
- All strings use i18n (useTranslation hook)
- Error handling with TRPCError
- Loading states with skeleton components

**Reference Patterns**: Follow patterns from [REFERENCE_FILES]

**Validation Checklist**:
- [ ] Database schema includes teamId and timestamps
- [ ] Service methods validate team access
- [ ] tRPC procedures use protectedProcedure
- [ ] Components handle loading/error states
- [ ] All strings use t() function
- [ ] Tests cover main functionality
- [ ] No ESLint or TypeScript errors

Please implement this feature step by step, starting with the database schema.
```

### Example: User Profile Management

```markdown
**Context**: You are implementing a new feature in the Kodix platform.

**Stack**: Next.js 15 (App Router), React 19, TypeScript, tRPC v11, Drizzle ORM, MySQL, Tailwind CSS

**Architecture**: SubApp-based modular system with team-based multi-tenancy

**Feature**: User Profile Management
**SubApp**: profile
**Requirements**: 
- Users can view and edit their profiles
- Profile includes: name, email, avatar, bio, preferences
- Avatar upload with image resizing
- Real-time updates across the app
- Audit trail for profile changes

**Implementation Plan**:
1. Database schema with proper team isolation
2. Service layer with business logic
3. tRPC router with CRUD operations
4. Frontend components using shadcn/ui
5. Proper error handling and validation
6. i18n for all user-facing strings
7. Comprehensive tests

**Standards to Follow**:
- No 'any' types in TypeScript
- Team-based data isolation (mandatory teamId filtering)
- Use `useTRPC()` hook, never import { api }
- ESLint rules must pass
- All strings use i18n (useTranslation hook)
- Error handling with TRPCError
- Loading states with skeleton components

**Reference Patterns**: Follow patterns from packages/api/src/routers/user.router.ts and apps/web/src/subapps/todo/components/

**Validation Checklist**:
- [ ] Database schema includes teamId and timestamps
- [ ] Service methods validate team access
- [ ] tRPC procedures use protectedProcedure
- [ ] Components handle loading/error states
- [ ] All strings use t() function
- [ ] Tests cover main functionality
- [ ] No ESLint or TypeScript errors

Please implement this feature step by step, starting with the database schema.
```

## 🔧 Backend Implementation Prompts

### tRPC Router Creation

```markdown
**Task**: Create a new tRPC router for [RESOURCE_NAME]

**Context**: Kodix platform using tRPC v11, Drizzle ORM, MySQL with team-based multi-tenancy

**Requirements**:
- CRUD operations: create, findMany, findById, update, delete
- Team isolation on all operations
- Input validation with Zod schemas
- Proper error handling with TRPCError
- Pagination for list operations
- Soft delete implementation

**Patterns to Follow**:
```typescript
// Reference: packages/api/src/routers/user.router.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const [resource]Router = createTRPCRouter({
  create: protectedProcedure
    .input(create[Resource]Schema)
    .mutation(async ({ ctx, input }) => {
      // Validate team access
      if (input.teamId !== ctx.session.teamId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot create [resource] for other teams",
        });
      }
      
      // Use service layer
      const service = new [Resource]Service(ctx.db);
      return service.create(input);
    }),
});
```

**Implementation Steps**:
1. Create Zod schemas for input/output validation
2. Implement service layer with business logic
3. Create tRPC procedures with proper auth
4. Add error handling and team isolation
5. Write unit tests for all procedures

Please implement following this exact pattern.
```

### Service Layer Implementation

```markdown
**Task**: Create a service class for [RESOURCE_NAME] business logic

**Context**: Kodix platform with service layer pattern, Drizzle ORM, team isolation

**Requirements**:
- Service class with dependency injection
- Methods: create, findMany, findById, update, delete
- Team-based access validation
- Event emission for create/update/delete
- Transaction support for complex operations
- Comprehensive error handling

**Pattern**:
```typescript
// Reference: packages/api/src/services/user.service.ts
export class [Resource]Service {
  constructor(private db: Database) {}
  
  async create(data: Create[Resource]Dto): Promise<[Resource]> {
    // Validate business rules
    await this.validateCreateRules(data);
    
    // Create with transaction
    const [resource] = await this.db.transaction(async (tx) => {
      const result = await tx.insert([resources]).values({
        ...data,
        id: generateId(),
        createdAt: new Date(),
      }).returning();
      
      // Emit event
      this.eventEmitter.emit('[resource].created', result[0]);
      
      return result;
    });
    
    return resource;
  }
  
  private async validateCreateRules(data: Create[Resource]Dto) {
    // Business validation logic
  }
}
```

**Standards**:
- All methods must validate team access
- Use transactions for multi-table operations
- Emit events for state changes
- Handle errors with descriptive messages
- Include proper TypeScript types

Please implement following this pattern.
```

## 🎨 Frontend Implementation Prompts

### React Component Creation

```markdown
**Task**: Create a React component for [COMPONENT_NAME]

**Context**: Kodix platform using React 19, TypeScript, shadcn/ui, TanStack Query, i18n

**Component Type**: [presentation|container|page]
**Requirements**: [SPECIFIC_REQUIREMENTS]

**Standards**:
- TypeScript with strict types (no 'any')
- Use shadcn/ui components as base
- Implement loading and error states
- All strings use useTranslation hook
- Responsive design with Tailwind CSS
- Accessibility considerations (ARIA labels, keyboard nav)

**Pattern**:
```typescript
// Reference: apps/web/src/subapps/todo/components/TaskCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "next-i18next";
import { useTRPC } from "~/trpc/react";

interface [Component]Props {
  [prop]: [type];
  onAction?: (id: string) => void;
  isLoading?: boolean;
}

export function [Component]({ [prop], onAction, isLoading }: [Component]Props) {
  const { t } = useTranslation();
  const trpc = useTRPC();
  
  if (isLoading) {
    return <[Component]Skeleton />;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('[resource].title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Implementation */}
        {onAction && (
          <Button 
            onClick={() => onAction([prop].id)}
            variant="outline"
          >
            {t('common.action')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function [Component]Skeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
```

**Checklist**:
- [ ] Props interface with proper types
- [ ] Loading skeleton component
- [ ] Error boundary compatibility
- [ ] i18n for all text
- [ ] Responsive design
- [ ] Accessibility attributes

Please implement following this pattern.
```

### Form Component Implementation

```markdown
**Task**: Create a form component for [FORM_PURPOSE]

**Context**: Kodix platform using react-hook-form, Zod validation, shadcn/ui form components

**Requirements**:
- Form validation with Zod schema
- Proper error handling and display
- Loading states during submission
- Accessibility features
- Success/error feedback

**Pattern**:
```typescript
// Reference: apps/web/src/components/forms/
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "next-i18next";
import { useTRPC } from "~/trpc/react";

const [form]Schema = z.object({
  [field]: z.string().min(1, "Required"),
  // Add other fields
});

type [Form]Data = z.infer<typeof [form]Schema>;

interface [Form]Props {
  initialData?: Partial<[Form]Data>;
  onSuccess?: (data: [Form]Data) => void;
  onCancel?: () => void;
}

export function [Form]Form({ initialData, onSuccess, onCancel }: [Form]Props) {
  const { t } = useTranslation();
  const trpc = useTRPC();
  
  const form = useForm<[Form]Data>({
    resolver: zodResolver([form]Schema),
    defaultValues: initialData,
  });
  
  const createMutation = trpc.[resource].create.useMutation({
    onSuccess: (data) => {
      onSuccess?.(data);
      form.reset();
    },
    onError: (error) => {
      // Handle error
    },
  });
  
  const onSubmit = (data: [Form]Data) => {
    createMutation.mutate(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="[field]"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('[form].[field]')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex gap-2">
          <Button 
            type="submit" 
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? t('common.saving') : t('common.save')}
          </Button>
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              {t('common.cancel')}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
```

Please implement following this exact pattern.
```

## 🗄️ Database Schema Prompts

### Schema Creation

```markdown
**Task**: Create a database schema for [RESOURCE_NAME]

**Context**: Kodix platform using Drizzle ORM with MySQL, team-based multi-tenancy

**Requirements**:
- Team isolation with teamId field
- Audit fields (createdAt, updatedAt, createdBy)
- UUID primary keys
- Proper indexes for performance
- Foreign key relationships
- Soft delete support (optional)

**Pattern**:
```typescript
// Reference: packages/db/schema/user.ts
import { mysqlTable, varchar, timestamp, uuid, text, boolean, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const [resources] = mysqlTable("[resources]", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").notNull(),
  
  // Resource-specific fields
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Audit fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  createdBy: uuid("created_by").notNull(),
  
  // Soft delete (optional)
  deletedAt: timestamp("deleted_at"),
}, (table) => ({
  teamIdIdx: index("team_id_idx").on(table.teamId),
  nameIdx: index("name_idx").on(table.name),
  createdByIdx: index("created_by_idx").on(table.createdBy),
}));

export const [resources]Relations = relations([resources], ({ one, many }) => ({
  team: one(teams, {
    fields: [[resources].teamId],
    references: [teams.id],
  }),
  creator: one(users, {
    fields: [[resources].createdBy],
    references: [users.id],
  }),
  // Add other relations
}));

// TypeScript types
export type [Resource] = typeof [resources].$inferSelect;
export type New[Resource] = typeof [resources].$inferInsert;
export type Create[Resource]Dto = Omit<New[Resource], 'id' | 'createdAt' | 'updatedAt'>;
export type Update[Resource]Dto = Partial<Omit<New[Resource], 'id' | 'teamId' | 'createdAt' | 'updatedAt'>>;
```

**Checklist**:
- [ ] teamId field for multi-tenancy
- [ ] UUID primary key with defaultRandom()
- [ ] Audit fields (createdAt, updatedAt, createdBy)
- [ ] Proper indexes for query performance
- [ ] Relations defined
- [ ] TypeScript types exported

Please implement following this pattern.
```

## 🧪 Testing Prompts

### Test Implementation

```markdown
**Task**: Create comprehensive tests for [COMPONENT/SERVICE/API]

**Context**: Kodix platform using Vitest, React Testing Library, test database

**Testing Strategy**:
- Unit tests for business logic
- Integration tests for API endpoints
- Component tests for UI behavior
- Team isolation validation

**Pattern**:
```typescript
// Reference: packages/api/src/routers/__tests__/user.router.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { [resource]Router } from "../[resource].router";
import { createTestDatabase } from "~/test/utils";

describe("[Resource] Router", () => {
  let testDb: any;
  
  beforeEach(async () => {
    testDb = await createTestDatabase();
  });
  
  describe("create", () => {
    it("should create [resource] with valid data", async () => {
      const ctx = createInnerTRPCContext({
        session: {
          user: { id: "user-123" },
          teamId: "team-123",
        },
        db: testDb,
      });
      
      const caller = [resource]Router.createCaller(ctx);
      
      const input = {
        teamId: "team-123",
        name: "Test [Resource]",
        description: "Test description",
      };
      
      const result = await caller.create(input);
      
      expect(result).toMatchObject({
        id: expect.any(String),
        teamId: "team-123",
        name: "Test [Resource]",
        description: "Test description",
      });
    });
    
    it("should enforce team isolation", async () => {
      const ctx = createInnerTRPCContext({
        session: {
          user: { id: "user-123" },
          teamId: "team-123",
        },
        db: testDb,
      });
      
      const caller = [resource]Router.createCaller(ctx);
      
      const input = {
        teamId: "team-456", // Different team
        name: "Test [Resource]",
      };
      
      await expect(caller.create(input)).rejects.toThrow("FORBIDDEN");
    });
  });
});
```

**Test Coverage Requirements**:
- [ ] Happy path scenarios
- [ ] Error cases and edge cases
- [ ] Team isolation enforcement
- [ ] Input validation
- [ ] Permission checks
- [ ] Data integrity

Please implement comprehensive tests following this pattern.
```

## 🔗 Related Resources

- [Bug Fixing Prompts](./bug-fixing.md)
- [Code Review Prompts](./code-review.md)
- [Architecture Decision Prompts](./architecture-decisions.md)

<!-- AI-CONTEXT-BOUNDARY: end -->