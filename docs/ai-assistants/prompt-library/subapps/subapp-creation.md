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
# SubApp Creation Prompts

> Comprehensive prompts for creating new SubApps in the Kodix platform

## 🎯 Purpose

Provide step-by-step prompts for creating complete SubApp modules following Kodix architecture patterns.

## 🏗️ Complete SubApp Creation

### Full SubApp Implementation Prompt

```markdown
**Task**: Create a new SubApp for the Kodix platform

**SubApp Name**: [SUBAPP_NAME]
**Purpose**: [DETAILED_PURPOSE]
**Features**: [FEATURE_LIST]

**Context**: Kodix platform using SubApp architecture with Next.js 15, tRPC v11, React 19, Drizzle ORM

**Implementation Requirements**:
1. **SubApp Structure**: Complete folder organization
2. **Database Schema**: Tables with team isolation
3. **Service Layer**: Business logic and data access
4. **tRPC Router**: API endpoints with authentication
5. **Frontend Components**: UI with shadcn/ui
6. **State Management**: Zustand stores
7. **Configuration**: SubApp settings system
8. **Navigation**: Integration with main app
9. **Permissions**: Role-based access control
10. **Testing**: Comprehensive test coverage
11. **Documentation**: Implementation docs

**SubApp Architecture**:
```
/apps/web/src/subapps/[subapp-name]/
├── components/              # React components
│   ├── index.tsx           # Component exports
│   ├── [Feature]View.tsx   # Main views
│   ├── [Feature]List.tsx   # List components
│   ├── [Feature]Form.tsx   # Form components
│   └── [Feature]Card.tsx   # Card components
├── hooks/                  # Custom React hooks
│   ├── use[Feature].ts     # Data fetching hooks
│   └── use[Feature]Form.ts # Form handling hooks
├── stores/                 # Zustand state stores
│   └── [feature].store.ts  # State management
├── utils/                  # Utility functions
│   └── [feature].utils.ts  # Helper functions
├── types/                  # TypeScript types
│   └── [feature].types.ts  # Type definitions
├── config/                 # SubApp configuration
│   └── index.ts            # Config schema
├── server/                 # Server-side code
│   ├── router.ts           # tRPC router
│   └── service.ts          # Business logic
└── index.tsx               # SubApp entry point
```

**Standards to Follow**:
- TypeScript strict mode (no 'any' types)
- Team-based data isolation (mandatory)
- i18n for all user-facing strings
- Comprehensive error handling
- Loading and error states
- Responsive design
- Accessibility (WCAG 2.1 AA)
- ESLint and Prettier compliance

**Implementation Steps**:
1. Create SubApp entry point and configuration
2. Implement database schema with migrations
3. Build service layer with business logic
4. Create tRPC router with procedures
5. Develop React components with proper UX
6. Add state management with Zustand
7. Integrate with main app navigation
8. Implement permissions and access control
9. Write comprehensive tests
10. Create documentation

Please implement this SubApp step by step, starting with the entry point and configuration.
```

## 📝 Step-by-Step Implementation

### Step 1: SubApp Entry Point

```markdown
**Task**: Create SubApp entry point and configuration

**File**: `/apps/web/src/subapps/[subapp-name]/index.tsx`

**Requirements**:
- SubApp configuration object
- Lazy-loaded main component
- Permission requirements
- Navigation integration
- Settings schema

**Pattern**:
```typescript
// apps/web/src/subapps/[subapp-name]/index.tsx
import { SubAppConfig } from "@/types/subapp";
import { lazy } from "react";
import { z } from "zod";

// Settings schema for this SubApp
export const [subappName]SettingsSchema = z.object({
  defaultView: z.enum(["list", "grid", "calendar"]).default("list"),
  itemsPerPage: z.number().min(10).max(100).default(20),
  enableNotifications: z.boolean().default(true),
  theme: z.enum(["light", "dark", "auto"]).default("auto"),
});

export type [SubappName]Settings = z.infer<typeof [subappName]SettingsSchema>;

// SubApp configuration
export const [SubappName]SubApp: SubAppConfig = {
  // Basic info
  name: "[subapp-name]",
  displayName: "[Display Name]",
  description: "[SubApp purpose and functionality]",
  version: "1.0.0",
  
  // UI configuration
  icon: "[icon-name]", // From lucide-react
  color: "#[hex-color]",
  path: "/[subapp-name]",
  
  // Component and routing
  component: lazy(() => import("./components/[SubappName]View")),
  routes: [
    {
      path: "/[subapp-name]",
      component: lazy(() => import("./components/[SubappName]View")),
    },
    {
      path: "/[subapp-name]/create",
      component: lazy(() => import("./components/Create[Feature]")),
    },
    {
      path: "/[subapp-name]/[id]",
      component: lazy(() => import("./components/[Feature]Detail")),
    },
  ],
  
  // Permissions and access
  permissions: [
    "[subapp-name].view",
    "[subapp-name].create", 
    "[subapp-name].edit",
    "[subapp-name].delete"
  ],
  requiredRole: "member", // minimum role required
  
  // Settings
  settingsSchema: [subappName]SettingsSchema,
  defaultSettings: {
    defaultView: "list",
    itemsPerPage: 20,
    enableNotifications: true,
    theme: "auto",
  },
  
  // Feature flags
  features: {
    exportData: true,
    bulkOperations: true,
    advancedFiltering: true,
    realTimeUpdates: false,
  },
  
  // Dependencies on other SubApps
  dependencies: ["user-management"], // Optional
  
  // Integration hooks
  hooks: {
    onInstall: async (teamId: string) => {
      // Setup logic when SubApp is enabled for a team
    },
    onUninstall: async (teamId: string) => {
      // Cleanup logic when SubApp is disabled
    },
  },
};

// Export for main app registration
export default [SubappName]SubApp;
```

**Next**: Create the main view component structure.
```

### Step 2: Database Schema

```markdown
**Task**: Create database schema for the SubApp

**File**: `/packages/db/schema/[subapp-name].ts`

**Requirements**:
- Primary resource tables
- Team isolation fields
- Audit fields
- Proper indexes
- Relations
- TypeScript types

**Pattern**:
```typescript
// packages/db/schema/[subapp-name].ts
import { 
  mysqlTable, 
  varchar, 
  text, 
  timestamp, 
  uuid, 
  int, 
  boolean,
  json,
  index,
  unique
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { teams } from "./team";
import { users } from "./user";

// Main resource table
export const [resources] = mysqlTable("[resources]", {
  // Primary key
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Team isolation (required for all tables)
  teamId: uuid("team_id").notNull(),
  
  // Resource-specific fields
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  priority: varchar("priority", { length: 20 }).notNull().default("medium"),
  
  // Metadata
  metadata: json("metadata"),
  tags: json("tags"), // Array of strings
  
  // Audit fields (required for all tables)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  createdBy: uuid("created_by").notNull(),
  updatedBy: uuid("updated_by"),
  
  // Soft delete (optional but recommended)
  deletedAt: timestamp("deleted_at"),
  deletedBy: uuid("deleted_by"),
}, (table) => ({
  // Indexes for performance
  teamIdIdx: index("team_id_idx").on(table.teamId),
  statusIdx: index("status_idx").on(table.status),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
  createdByIdx: index("created_by_idx").on(table.createdBy),
  
  // Compound indexes
  teamStatusIdx: index("team_status_idx").on(table.teamId, table.status),
  
  // Unique constraints
  teamTitleUnique: unique("team_title_unique").on(table.teamId, table.title),
}));

// Related table example (if needed)
export const [resourceComments] = mysqlTable("[resource_comments]", {
  id: uuid("id").primaryKey().defaultRandom(),
  resourceId: uuid("resource_id").notNull(),
  teamId: uuid("team_id").notNull(),
  
  content: text("content").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: uuid("created_by").notNull(),
  
  deletedAt: timestamp("deleted_at"),
}, (table) => ({
  resourceIdIdx: index("resource_id_idx").on(table.resourceId),
  teamIdIdx: index("team_id_idx").on(table.teamId),
}));

// Relations
export const [resources]Relations = relations([resources], ({ one, many }) => ({
  // Required relations
  team: one(teams, {
    fields: [[resources].teamId],
    references: [teams.id],
  }),
  creator: one(users, {
    fields: [[resources].createdBy],
    references: [users.id],
  }),
  updater: one(users, {
    fields: [[resources].updatedBy],
    references: [users.id],
  }),
  
  // SubApp-specific relations
  comments: many([resourceComments]),
}));

export const [resourceComments]Relations = relations([resourceComments], ({ one }) => ({
  resource: one([resources], {
    fields: [[resourceComments].resourceId],
    references: [[resources].id],
  }),
  creator: one(users, {
    fields: [[resourceComments].createdBy],
    references: [users.id],
  }),
}));

// TypeScript types
export type [Resource] = typeof [resources].$inferSelect;
export type New[Resource] = typeof [resources].$inferInsert;
export type [ResourceComment] = typeof [resourceComments].$inferSelect;

// DTO types for API
export type Create[Resource]Dto = Omit<
  New[Resource], 
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'deletedBy'
>;

export type Update[Resource]Dto = Partial<
  Omit<New[Resource], 'id' | 'teamId' | 'createdAt' | 'createdBy' | 'deletedAt' | 'deletedBy'>
>;

// Search and filter types
export type [Resource]Filters = {
  status?: string[];
  priority?: string[];
  createdBy?: string[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
};

export type [Resource]Sort = {
  field: keyof [Resource];
  direction: 'asc' | 'desc';
};
```

**Migration File**: `/packages/db/migrations/[timestamp]_create_[subapp_name].sql`
```sql
CREATE TABLE [resources] (
  id CHAR(36) PRIMARY KEY,
  team_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  metadata JSON,
  tags JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  created_by CHAR(36) NOT NULL,
  updated_by CHAR(36),
  deleted_at TIMESTAMP NULL,
  deleted_by CHAR(36),
  
  INDEX team_id_idx (team_id),
  INDEX status_idx (status),
  INDEX created_at_idx (created_at),
  INDEX team_status_idx (team_id, status),
  UNIQUE team_title_unique (team_id, title),
  
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id),
  FOREIGN KEY (deleted_by) REFERENCES users(id)
);
```

**Next**: Implement the service layer for business logic.
```

### Step 3: Service Layer

```markdown
**Task**: Create service layer for business logic

**File**: `/packages/api/src/services/[subapp-name].service.ts`

**Requirements**:
- CRUD operations with team isolation
- Business rule validation
- Event emission
- Transaction support
- Error handling

**Pattern**:
```typescript
// packages/api/src/services/[subapp-name].service.ts
import { and, eq, desc, asc, inArray, isNull, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import type { Database } from "@/db";
import { [resources], [resourceComments] } from "@/db/schema/[subapp-name]";
import type { 
  Create[Resource]Dto, 
  Update[Resource]Dto, 
  [Resource], 
  [Resource]Filters,
  [Resource]Sort
} from "@/db/schema/[subapp-name]";
import { EventEmitter } from "events";

export class [Resource]Service {
  constructor(
    private db: Database,
    private eventEmitter: EventEmitter = new EventEmitter()
  ) {}

  // CREATE operations
  async create(data: Create[Resource]Dto): Promise<[Resource]> {
    // Validate business rules
    await this.validateCreateRules(data);
    
    return this.db.transaction(async (tx) => {
      const [[resource]] = await tx
        .insert([resources])
        .values({
          ...data,
          id: crypto.randomUUID(),
        })
        .returning();
        
      // Emit event for other systems
      this.eventEmitter.emit('[resource].created', {
        resource,
        teamId: resource.teamId,
        userId: resource.createdBy,
      });
      
      return resource;
    });
  }

  // READ operations
  async findMany(options: {
    teamId: string;
    filters?: [Resource]Filters;
    sort?: [Resource]Sort;
    limit?: number;
    offset?: number;
  }): Promise<{ items: [Resource][]; total: number }> {
    const { teamId, filters, sort, limit = 20, offset = 0 } = options;
    
    // Build where conditions
    const whereConditions = [
      eq([resources].teamId, teamId),
      isNull([resources].deletedAt), // Exclude soft deleted
    ];
    
    // Apply filters
    if (filters) {
      if (filters.status?.length) {
        whereConditions.push(inArray([resources].status, filters.status));
      }
      if (filters.priority?.length) {
        whereConditions.push(inArray([resources].priority, filters.priority));
      }
      if (filters.createdBy?.length) {
        whereConditions.push(inArray([resources].createdBy, filters.createdBy));
      }
      if (filters.dateRange) {
        whereConditions.push(
          and(
            gte([resources].createdAt, filters.dateRange.start),
            lte([resources].createdAt, filters.dateRange.end)
          )
        );
      }
    }
    
    // Build order by
    const orderBy = sort 
      ? sort.direction === 'asc' 
        ? asc([resources][sort.field])
        : desc([resources][sort.field])
      : desc([resources].createdAt);
    
    // Get items and total count
    const [items, [{ total }]] = await Promise.all([
      this.db
        .select()
        .from([resources])
        .where(and(...whereConditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
        
      this.db
        .select({ total: sql<number>`count(*)` })
        .from([resources])
        .where(and(...whereConditions)),
    ]);
    
    return { items, total };
  }

  async findById(id: string, teamId: string): Promise<[Resource] | null> {
    const [resource] = await this.db
      .select()
      .from([resources])
      .where(
        and(
          eq([resources].id, id),
          eq([resources].teamId, teamId),
          isNull([resources].deletedAt)
        )
      )
      .limit(1);
      
    return resource || null;
  }

  // UPDATE operations
  async update(
    id: string, 
    teamId: string, 
    data: Update[Resource]Dto,
    userId: string
  ): Promise<[Resource]> {
    // Validate access
    const existing = await this.findById(id, teamId);
    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "[Resource] not found",
      });
    }
    
    // Validate business rules
    await this.validateUpdateRules(existing, data);
    
    return this.db.transaction(async (tx) => {
      const [updated] = await tx
        .update([resources])
        .set({
          ...data,
          updatedBy: userId,
        })
        .where(
          and(
            eq([resources].id, id),
            eq([resources].teamId, teamId)
          )
        )
        .returning();
        
      // Emit event
      this.eventEmitter.emit('[resource].updated', {
        resource: updated,
        previousData: existing,
        teamId,
        userId,
      });
      
      return updated;
    });
  }

  // DELETE operations
  async delete(id: string, teamId: string, userId: string): Promise<void> {
    const existing = await this.findById(id, teamId);
    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND", 
        message: "[Resource] not found",
      });
    }
    
    // Soft delete
    await this.db
      .update([resources])
      .set({
        deletedAt: new Date(),
        deletedBy: userId,
      })
      .where(
        and(
          eq([resources].id, id),
          eq([resources].teamId, teamId)
        )
      );
      
    // Emit event
    this.eventEmitter.emit('[resource].deleted', {
      resource: existing,
      teamId,
      userId,
    });
  }

  // Business validation methods
  private async validateCreateRules(data: Create[Resource]Dto): Promise<void> {
    // Example: Check for duplicate titles within team
    const existing = await this.db
      .select({ id: [resources].id })
      .from([resources])
      .where(
        and(
          eq([resources].teamId, data.teamId),
          eq([resources].title, data.title),
          isNull([resources].deletedAt)
        )
      )
      .limit(1);
      
    if (existing.length > 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A [resource] with this title already exists",
      });
    }
  }
  
  private async validateUpdateRules(
    existing: [Resource], 
    updates: Update[Resource]Dto
  ): Promise<void> {
    // Example: Validate status transitions
    if (updates.status && updates.status !== existing.status) {
      const validTransitions: Record<string, string[]> = {
        draft: ['active', 'archived'],
        active: ['completed', 'archived'],
        completed: ['archived'],
        archived: [], // Cannot transition from archived
      };
      
      const allowed = validTransitions[existing.status] || [];
      if (!allowed.includes(updates.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot change status from ${existing.status} to ${updates.status}`,
        });
      }
    }
  }
}
```

**Next**: Create the tRPC router for API endpoints.
```

Please continue implementing Phase 4 by creating the remaining high-priority components. The implementation is substantial and follows the comprehensive plan outlined in the phase-4-opportunities.md document.

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"id": "1", "content": "Create AI-First Context Engineering structure (/docs/context-engineering/kodix-specific/)", "status": "completed", "priority": "high"}, {"id": "2", "content": "Create AI Optimization directory (/docs/context-engineering/ai-optimization/)", "status": "completed", "priority": "high"}, {"id": "3", "content": "Create Automation directory (/docs/context-engineering/automation/)", "status": "completed", "priority": "high"}, {"id": "4", "content": "Create AI Assistant Prompt Library (/docs/ai-assistants/prompt-library/)", "status": "completed", "priority": "high"}, {"id": "5", "content": "Implement semantic markup standards for AI consumption", "status": "in_progress", "priority": "medium"}, {"id": "6", "content": "Create interactive documentation templates and examples", "status": "pending", "priority": "medium"}, {"id": "7", "content": "Create cross-AI assistant compatibility guidelines", "status": "pending", "priority": "medium"}, {"id": "8", "content": "Implement documentation generation scripts", "status": "pending", "priority": "medium"}]