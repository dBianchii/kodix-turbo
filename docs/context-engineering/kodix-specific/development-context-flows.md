<!-- AI-METADATA:
category: context-flow
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
# Development Context Flows

> Step-by-step context templates for common Kodix development workflows

## 🎯 Purpose

Provide AI assistants with detailed, sequential context for executing common development tasks in the Kodix platform, ensuring consistent and correct implementations.

## 🚀 Feature Implementation Flow

### Complete Feature Development Context

```markdown
You are implementing a new feature in the Kodix platform. Follow this complete workflow:

**Phase 1: Planning & Setup**
1. Identify the SubApp where the feature belongs
2. Review existing patterns in that SubApp
3. Plan the data model and API structure
4. Design the UI components needed

**Phase 2: Backend Implementation**
1. Create/update database schema:
   \`\`\`typescript
   // In packages/db/schema/{feature}.ts
   export const features = mysqlTable("features", {
     id: uuid("id").primaryKey().defaultRandom(),
     teamId: uuid("team_id").notNull(),
     // feature-specific fields
     createdAt: timestamp("created_at").defaultNow(),
     updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
   });
   \`\`\`

2. Implement service layer:
   \`\`\`typescript
   // In packages/api/src/services/{feature}.service.ts
   export class FeatureService {
     constructor(private db: Database) {}
     
     async create(data: CreateFeatureDto) {
       // Validation and business logic
       return this.db.insert(features).values(data);
     }
   }
   \`\`\`

3. Create tRPC router:
   \`\`\`typescript
   // In packages/api/src/routers/{feature}.router.ts
   export const featureRouter = createTRPCRouter({
     create: protectedProcedure
       .input(createFeatureSchema)
       .mutation(async ({ ctx, input }) => {
         const service = new FeatureService(ctx.db);
         return service.create(input);
       }),
   });
   \`\`\`

**Phase 3: Frontend Implementation**
1. Create TypeScript types
2. Build UI components with Shadcn/ui
3. Implement data fetching with TanStack Query
4. Add proper loading and error states
5. Ensure responsive design

**Phase 4: Testing & Validation**
1. Write unit tests for service layer
2. Test API endpoints
3. Verify UI functionality
4. Check team isolation
5. Validate permissions

**Phase 5: Integration**
1. Update navigation if needed
2. Add feature flags if required
3. Update documentation
4. Create migration if needed
```

### Quick Reference Checklist

```markdown
Feature Implementation Checklist:
- [ ] Database schema with team isolation
- [ ] Service layer with business logic
- [ ] tRPC router with validation
- [ ] Frontend components with TypeScript
- [ ] Loading and error states
- [ ] i18n for all strings
- [ ] Permission checks
- [ ] Unit tests
- [ ] Documentation updates
```

## 🐛 Debugging Flow

### Systematic Debugging Context

```markdown
You are debugging an issue in the Kodix platform. Follow this systematic approach:

**Step 1: Identify the Layer**
Determine where the issue occurs:
- Frontend (React/UI)
- API (tRPC)
- Service (Business Logic)
- Database (Queries)

**Step 2: Add Strategic Logging**
\`\`\`typescript
// Frontend logging
console.log("[Component] State:", { state, props });
console.log("[API Call] Request:", input);
console.log("[API Call] Response:", data);

// Backend logging
console.log("[Router] Input:", input);
console.log("[Service] Processing:", data);
console.log("[DB] Query:", query.toSQL());
\`\`\`

**Step 3: Check Common Issues**

Frontend Issues:
- State management problems
- Incorrect API calls
- Missing error handling
- Race conditions

Backend Issues:
- Missing team isolation
- Validation errors
- Database constraints
- Permission failures

**Step 4: Use Browser DevTools**
- Network tab for API calls
- Console for errors
- React DevTools for component state
- Redux/Zustand DevTools for stores

**Step 5: Verify Data Flow**
Trace the complete request:
1. Component trigger
2. API call
3. Backend processing
4. Database query
5. Response handling

**Step 6: Common Fixes**
\`\`\`typescript
// Fix: Missing team isolation
where: and(
  eq(table.teamId, ctx.session.teamId),
  // other conditions
)

// Fix: Proper error handling
try {
  const result = await service.operation();
  return result;
} catch (error) {
  console.error("[Service] Error:", error);
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Operation failed",
  });
}
\`\`\`
```

## 🔄 API Development Flow

### tRPC API Implementation Context

```markdown
You are implementing a new API endpoint in Kodix. Follow this flow:

**Step 1: Define Input/Output Schemas**
\`\`\`typescript
import { z } from "zod";

// Input validation schema
export const createResourceSchema = z.object({
  teamId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  settings: z.object({
    isPublic: z.boolean().default(false),
    maxItems: z.number().min(1).max(1000).default(100),
  }),
});

// Output type (usually from database schema)
export type Resource = typeof resources.$inferSelect;
\`\`\`

**Step 2: Implement Service Method**
\`\`\`typescript
export class ResourceService {
  async create(data: z.infer<typeof createResourceSchema>) {
    // Validate business rules
    const existingCount = await this.getTeamResourceCount(data.teamId);
    if (existingCount >= 100) {
      throw new Error("Team resource limit reached");
    }
    
    // Create resource
    const [resource] = await this.db
      .insert(resources)
      .values({
        ...data,
        id: generateId(),
      })
      .returning();
      
    // Emit event
    eventEmitter.emit("resource.created", resource);
    
    return resource;
  }
}
\`\`\`

**Step 3: Create tRPC Procedure**
\`\`\`typescript
export const resourceRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createResourceSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify team access
      if (input.teamId !== ctx.session.teamId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot create resources for other teams",
        });
      }
      
      const service = new ResourceService(ctx.db);
      return service.create(input);
    }),
    
  findByTeam: protectedProcedure
    .input(z.object({
      teamId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Implementation with pagination
    }),
});
\`\`\`

**Step 4: Frontend Integration**
\`\`\`typescript
// Hook for data fetching
export function useResources(teamId: string) {
  const trpc = useTRPC();
  
  return trpc.resource.findByTeam.useQuery({
    teamId,
    limit: 20,
  });
}

// Mutation hook
export function useCreateResource() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  return trpc.resource.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["resource", "findByTeam"],
      });
    },
  });
}
\`\`\`
```

## 🎨 UI Component Development Flow

### Component Creation Context

```markdown
You are creating a new UI component for Kodix. Follow this flow:

**Step 1: Component Structure**
\`\`\`typescript
// In /components/{feature}/ResourceCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "next-i18next";
import type { Resource } from "@/types/resource";

interface ResourceCardProps {
  resource: Resource;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export function ResourceCard({ 
  resource, 
  onEdit, 
  onDelete, 
  isLoading 
}: ResourceCardProps) {
  const { t } = useTranslation();
  
  if (isLoading) {
    return <ResourceCardSkeleton />;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{resource.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          {resource.description}
        </p>
        <div className="mt-4 flex gap-2">
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(resource.id)}
            >
              {t("common.edit")}
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => onDelete(resource.id)}
            >
              {t("common.delete")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Loading skeleton
function ResourceCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-3/4 bg-muted animate-pulse rounded mt-2" />
      </CardContent>
    </Card>
  );
}
\`\`\`

**Step 2: Form Components**
\`\`\`typescript
// Form with validation
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function ResourceForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const form = useForm({
    resolver: zodResolver(createResourceSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("resource.name")}</FormLabel>
              <Input {...field} />
            </FormItem>
          )}
        />
        <Button type="submit">
          {t("common.create")}
        </Button>
      </form>
    </Form>
  );
}
\`\`\`

**Step 3: List Components**
\`\`\`typescript
// Data table with sorting, filtering, pagination
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

export function ResourceList({ teamId }: { teamId: string }) {
  const { data, isLoading } = useResources(teamId);
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <DataTable
      columns={columns}
      data={data?.items ?? []}
      pagination={{
        pageSize: 20,
        total: data?.total,
      }}
      sorting
      filtering
    />
  );
}
\`\`\`
```

## 🔒 Authentication & Authorization Flow

### Security Implementation Context

```markdown
You are implementing authentication and authorization in Kodix. Follow this flow:

**Step 1: Route Protection**
\`\`\`typescript
// API route protection
export const protectedProcedure = t.procedure
  .use(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in",
      });
    }
    
    return next({
      ctx: {
        ...ctx,
        session: ctx.session,
      },
    });
  });

// Admin-only routes
export const adminProcedure = protectedProcedure
  .use(async ({ ctx, next }) => {
    if (ctx.session.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }
    
    return next();
  });
\`\`\`

**Step 2: Permission Checks**
\`\`\`typescript
// Fine-grained permissions
export async function checkPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  const permission = await db.query.permissions.findFirst({
    where: and(
      eq(permissions.userId, userId),
      eq(permissions.resource, resource),
      eq(permissions.action, action),
    ),
  });
  
  return !!permission;
}

// Usage in procedures
if (!await checkPermission(ctx.session.user.id, "resource", "create")) {
  throw new TRPCError({
    code: "FORBIDDEN",
    message: "You don't have permission to create resources",
  });
}
\`\`\`

**Step 3: Frontend Protection**
\`\`\`typescript
// Protected routes
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status]);
  
  if (status === "loading") return <LoadingSpinner />;
  if (!session) return null;
  
  return <>{children}</>;
}

// Permission-based UI
export function CanAccess({ 
  permission, 
  children 
}: { 
  permission: string; 
  children: React.ReactNode;
}) {
  const { permissions } = useUserPermissions();
  
  if (!permissions.includes(permission)) {
    return null;
  }
  
  return <>{children}</>;
}
\`\`\`
```

## 🧪 Testing Flow

### Comprehensive Testing Context

```markdown
You are writing tests for Kodix features. Follow this testing flow:

**Step 1: Unit Tests for Services**
\`\`\`typescript
// In __tests__/services/resource.service.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { ResourceService } from "../resource.service";
import { createMockDb } from "@/test/utils";

describe("ResourceService", () => {
  let service: ResourceService;
  let mockDb: MockDatabase;
  
  beforeEach(() => {
    mockDb = createMockDb();
    service = new ResourceService(mockDb);
  });
  
  describe("create", () => {
    it("should create a resource with valid data", async () => {
      const input = {
        teamId: "team-123",
        name: "Test Resource",
      };
      
      const result = await service.create(input);
      
      expect(result).toMatchObject({
        id: expect.any(String),
        teamId: input.teamId,
        name: input.name,
      });
    });
    
    it("should enforce team resource limits", async () => {
      // Mock existing resources at limit
      mockDb.setQueryResult("count", 100);
      
      await expect(
        service.create({ teamId: "team-123", name: "New" })
      ).rejects.toThrow("Team resource limit reached");
    });
  });
});
\`\`\`

**Step 2: API Route Tests**
\`\`\`typescript
// Test tRPC procedures
import { createInnerTRPCContext } from "@/server/api/trpc";
import { resourceRouter } from "@/server/api/routers/resource";

describe("Resource API", () => {
  it("should require authentication", async () => {
    const ctx = createInnerTRPCContext({
      session: null,
    });
    
    const caller = resourceRouter.createCaller(ctx);
    
    await expect(
      caller.create({ teamId: "123", name: "Test" })
    ).rejects.toThrow("UNAUTHORIZED");
  });
  
  it("should create resource for authenticated user", async () => {
    const ctx = createInnerTRPCContext({
      session: {
        user: { id: "user-123" },
        teamId: "team-123",
      },
    });
    
    const caller = resourceRouter.createCaller(ctx);
    const result = await caller.create({
      teamId: "team-123",
      name: "Test Resource",
    });
    
    expect(result.name).toBe("Test Resource");
  });
});
\`\`\`

**Step 3: Component Tests**
\`\`\`typescript
// React component tests
import { render, screen, fireEvent } from "@testing-library/react";
import { ResourceCard } from "../ResourceCard";

describe("ResourceCard", () => {
  const mockResource = {
    id: "123",
    name: "Test Resource",
    description: "Test description",
  };
  
  it("should render resource details", () => {
    render(<ResourceCard resource={mockResource} />);
    
    expect(screen.getByText("Test Resource")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });
  
  it("should call onEdit when edit button clicked", () => {
    const onEdit = vi.fn();
    
    render(
      <ResourceCard 
        resource={mockResource} 
        onEdit={onEdit} 
      />
    );
    
    fireEvent.click(screen.getByText("Edit"));
    expect(onEdit).toHaveBeenCalledWith("123");
  });
});
\`\`\`
```

## 🔗 Integration Patterns

### Cross-SubApp Integration Context

```markdown
You are implementing integration between SubApps. Follow these patterns:

**Pattern 1: Event-Based Integration**
\`\`\`typescript
// Event emitter setup
// In packages/shared/events/index.ts
import { EventEmitter } from "events";

export interface SubAppEvents {
  "calendar:event-created": CalendarEvent;
  "todo:task-completed": TodoTask;
  "chat:message-sent": ChatMessage;
}

export const subAppEvents = new EventEmitter();

// Type-safe event methods
export function emitSubAppEvent<K extends keyof SubAppEvents>(
  event: K,
  data: SubAppEvents[K]
) {
  subAppEvents.emit(event, data);
}

export function onSubAppEvent<K extends keyof SubAppEvents>(
  event: K,
  handler: (data: SubAppEvents[K]) => void
) {
  subAppEvents.on(event, handler);
}
\`\`\`

**Pattern 2: Shared Services**
\`\`\`typescript
// Notification service used by multiple SubApps
export class NotificationService {
  static async notify(options: {
    userId: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    source: string;
  }) {
    // Store notification
    await db.insert(notifications).values({
      ...options,
      id: generateId(),
      read: false,
      createdAt: new Date(),
    });
    
    // Real-time push
    pusher.trigger(\`user-\${options.userId}\`, "notification", options);
  }
}

// Usage in any SubApp
await NotificationService.notify({
  userId: user.id,
  title: "Task Completed",
  message: "Your task has been marked as complete",
  type: "success",
  source: "todo",
});
\`\`\`

**Pattern 3: Data Sharing**
\`\`\`typescript
// Shared data access patterns
export class SharedDataService {
  // Get user's events across all SubApps
  static async getUserActivities(userId: string) {
    const [calendarEvents, todoTasks, chatMessages] = await Promise.all([
      db.query.calendarEvents.findMany({
        where: eq(calendarEvents.userId, userId),
        limit: 10,
      }),
      db.query.todoTasks.findMany({
        where: eq(todoTasks.assignedTo, userId),
        limit: 10,
      }),
      db.query.chatMessages.findMany({
        where: eq(chatMessages.userId, userId),
        limit: 10,
      }),
    ]);
    
    return {
      calendar: calendarEvents,
      todo: todoTasks,
      chat: chatMessages,
    };
  }
}
\`\`\`
```

## 🔗 Related Resources

- [Stack Context Templates](./stack-context-templates.md)
- [SubApp Context Patterns](./subapp-context-patterns.md)
- [Architecture Context Maps](./architecture-context-maps.md)

<!-- AI-CONTEXT-BOUNDARY: end -->