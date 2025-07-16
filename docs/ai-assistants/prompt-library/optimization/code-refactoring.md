<!-- AI-METADATA:
category: prompt-library
complexity: intermediate
updated: 2025-01-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: developers
ai-context-weight: important
-->

<!-- AI-CONTEXT-BOUNDARY: start -->
# Code Refactoring Prompts

> Systematic prompts for AI-assisted code refactoring following Kodix patterns and modern best practices

## 🎯 Purpose

Provide comprehensive prompts for refactoring code across the Kodix stack, ensuring maintainability, performance, and adherence to established patterns while preserving functionality.

## 🔄 Component Refactoring

### React Component Modernization

```markdown
**Task**: Refactor React component to follow modern Kodix patterns

**Current Component**: [COMPONENT_CODE_TO_REFACTOR]

**Refactoring Checklist**:

**1. TypeScript Enhancement**
- [ ] Replace 'any' types with proper interfaces
- [ ] Add generic types where appropriate
- [ ] Implement proper prop validation
- [ ] Add return type annotations

**2. Performance Optimization**
- [ ] Identify unnecessary re-renders
- [ ] Implement memoization where needed
- [ ] Optimize event handlers
- [ ] Remove unused dependencies

**3. Modern React Patterns**
- [ ] Convert class components to hooks
- [ ] Use modern hook patterns
- [ ] Implement proper error boundaries
- [ ] Add proper loading states

**4. Kodix Standards Compliance**
- [ ] Follow naming conventions
- [ ] Implement proper i18n
- [ ] Use shadcn/ui components
- [ ] Add proper accessibility

**Refactoring Strategy**:
1. **Preserve functionality** - ensure no breaking changes
2. **Incremental improvement** - refactor step by step
3. **Test coverage** - maintain or improve test coverage
4. **Documentation** - update component documentation

**Example Refactoring**:
```typescript
// ❌ Before: Legacy component with issues
import React, { Component } from 'react';

interface Props {
  users: any[]; // Issue: 'any' type
  onUserSelect: (user: any) => void;
}

class UserList extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedUser: null,
      loading: false,
    };
  }
  
  // Issue: Method binding in render
  handleUserClick = (user: any) => {
    this.setState({ selectedUser: user });
    this.props.onUserSelect(user);
  };
  
  // Issue: No error handling
  async loadUsers() {
    this.setState({ loading: true });
    const users = await api.user.getAll(); // Issue: Direct api import
    this.setState({ users, loading: false });
  }
  
  render() {
    const { users } = this.props;
    const { selectedUser, loading } = this.state;
    
    return (
      <div>
        <h2>Users</h2> {/* Issue: Hardcoded string */}
        {loading && <div>Loading...</div>}
        {users.map(user => (
          <div key={user.id} onClick={() => this.handleUserClick(user)}>
            {user.name}
          </div>
        ))}
      </div>
    );
  }
}

// ✅ After: Modern refactored component
import { useState, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTRPC } from '@/hooks/use-trpc';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface UserListProps {
  teamId: string;
  onUserSelect: (user: User) => void;
  selectedUserId?: string;
}

export const UserList = memo<UserListProps>(({ 
  teamId, 
  onUserSelect, 
  selectedUserId 
}) => {
  const { t } = useTranslation();
  const trpc = useTRPC();
  
  const { 
    data: users = [], 
    isLoading, 
    error 
  } = trpc.user.getByTeam.useQuery({ teamId });
  
  const handleUserClick = useCallback((user: User) => {
    onUserSelect(user);
  }, [onUserSelect]);
  
  if (error) {
    return (
      <Card className="p-4">
        <div className="text-destructive">
          {t('users.loadError')}: {error.message}
        </div>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">
          {t('users.title')}
        </h2>
        
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {users.map(user => (
              <UserCard
                key={user.id}
                user={user}
                isSelected={user.id === selectedUserId}
                onClick={handleUserClick}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

UserList.displayName = 'UserList';
```

**Improvements Made**:
1. Converted class to functional component with hooks
2. Added proper TypeScript interfaces
3. Implemented error handling and loading states
4. Used proper Kodix patterns (useTRPC, i18n)
5. Added memoization for performance
6. Used shadcn/ui components for consistency
```

## 🔧 Service Layer Refactoring

### Backend Service Modernization

```markdown
**Task**: Refactor backend service to follow Kodix service layer patterns

**Current Service**: [SERVICE_CODE_TO_REFACTOR]

**Service Refactoring Framework**:

**1. Architecture Improvements**
- [ ] Implement repository pattern
- [ ] Add proper dependency injection
- [ ] Separate business logic from data access
- [ ] Add proper error handling

**2. Type Safety Enhancement**
- [ ] Add comprehensive TypeScript types
- [ ] Implement input validation with Zod
- [ ] Add proper return type definitions
- [ ] Remove any 'any' types

**3. Team Isolation Enforcement**
- [ ] Add mandatory team filtering
- [ ] Implement permission checks
- [ ] Add audit logging
- [ ] Ensure data isolation

**4. Performance Optimization**
- [ ] Optimize database queries
- [ ] Add proper caching
- [ ] Implement batch operations
- [ ] Add query performance monitoring

**Example Service Refactoring**:
```typescript
// ❌ Before: Legacy service with issues
class UserService {
  constructor(private db: any) {} // Issue: 'any' type
  
  // Issue: No team isolation
  async getUsers(): Promise<any[]> {
    return await this.db.query.users.findMany();
  }
  
  // Issue: No validation, no error handling
  async createUser(data: any): Promise<any> {
    const user = await this.db.insert(users).values(data);
    return user;
  }
  
  // Issue: No permission checks
  async deleteUser(id: string): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }
}

// ✅ After: Modern service following Kodix patterns
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { Database } from '@/lib/db';
import { users, type User } from '@/lib/db/schema';
import { EventEmitter } from '@/lib/events';

// Proper validation schemas
const CreateUserSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  teamId: z.string().uuid(),
});

const UpdateUserSchema = CreateUserSchema.partial().extend({
  id: z.string().uuid(),
});

type CreateUserInput = z.infer<typeof CreateUserSchema>;
type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export class UserService {
  constructor(
    private db: Database,
    private eventEmitter: EventEmitter
  ) {}
  
  async getByTeam(teamId: string): Promise<User[]> {
    try {
      return await this.db.query.users.findMany({
        where: eq(users.teamId, teamId),
        orderBy: users.name,
        columns: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
          // Exclude sensitive fields
        },
      });
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch users',
        cause: error,
      });
    }
  }
  
  async create(input: CreateUserInput): Promise<User> {
    // Validate input
    const validatedData = CreateUserSchema.parse(input);
    
    try {
      // Check if email already exists in team
      const existingUser = await this.db.query.users.findFirst({
        where: and(
          eq(users.email, validatedData.email),
          eq(users.teamId, validatedData.teamId)
        ),
      });
      
      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email already exists in team',
        });
      }
      
      // Create user
      const [newUser] = await this.db.insert(users)
        .values({
          ...validatedData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      
      // Emit event for other systems
      this.eventEmitter.emit('user.created', {
        userId: newUser.id,
        teamId: newUser.teamId,
        action: 'user.created',
        timestamp: new Date(),
      });
      
      return newUser;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create user',
        cause: error,
      });
    }
  }
  
  async update(input: UpdateUserInput, requestingUserId: string): Promise<User> {
    const validatedData = UpdateUserSchema.parse(input);
    
    try {
      // Check if user exists and belongs to same team
      const existingUser = await this.db.query.users.findFirst({
        where: eq(users.id, validatedData.id),
      });
      
      if (!existingUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }
      
      // Permission check: users can only update their own profile
      // or admins can update any user in their team
      const requestingUser = await this.db.query.users.findFirst({
        where: eq(users.id, requestingUserId),
      });
      
      if (!requestingUser) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid requesting user',
        });
      }
      
      const canUpdate = requestingUser.id === existingUser.id ||
        (requestingUser.role === 'admin' && 
         requestingUser.teamId === existingUser.teamId);
      
      if (!canUpdate) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to update this user',
        });
      }
      
      // Update user
      const [updatedUser] = await this.db.update(users)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, validatedData.id))
        .returning();
      
      // Emit event
      this.eventEmitter.emit('user.updated', {
        userId: updatedUser.id,
        teamId: updatedUser.teamId,
        action: 'user.updated',
        timestamp: new Date(),
      });
      
      return updatedUser;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update user',
        cause: error,
      });
    }
  }
  
  async delete(id: string, requestingUserId: string): Promise<void> {
    try {
      // Check permissions and team isolation
      const userToDelete = await this.db.query.users.findFirst({
        where: eq(users.id, id),
      });
      
      if (!userToDelete) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }
      
      const requestingUser = await this.db.query.users.findFirst({
        where: eq(users.id, requestingUserId),
      });
      
      if (!requestingUser || 
          requestingUser.teamId !== userToDelete.teamId ||
          requestingUser.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to delete this user',
        });
      }
      
      // Soft delete (preserve data integrity)
      await this.db.update(users)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, id));
      
      // Emit event
      this.eventEmitter.emit('user.deleted', {
        userId: id,
        teamId: userToDelete.teamId,
        action: 'user.deleted',
        timestamp: new Date(),
      });
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete user',
        cause: error,
      });
    }
  }
}
```

**Improvements Made**:
1. Added comprehensive input validation with Zod
2. Implemented proper error handling with TRPCError
3. Added team isolation and permission checks
4. Included event emission for system integration
5. Used proper TypeScript types throughout
6. Added audit logging and soft deletes
```

## 🗄️ Database Schema Refactoring

### Schema Modernization

```markdown
**Task**: Refactor database schema to follow Kodix patterns

**Current Schema**: [SCHEMA_TO_REFACTOR]

**Schema Refactoring Guidelines**:

**1. Team Isolation Enhancement**
- [ ] Add teamId to all tenant-scoped tables
- [ ] Create proper foreign key relationships
- [ ] Add indexes for team-based queries
- [ ] Implement soft deletes where appropriate

**2. Performance Optimization**
- [ ] Analyze and optimize indexes
- [ ] Add composite indexes for common queries
- [ ] Optimize column types and sizes
- [ ] Add database constraints

**3. Data Integrity**
- [ ] Add proper constraints and validations
- [ ] Implement cascade rules
- [ ] Add audit fields (createdAt, updatedAt, deletedAt)
- [ ] Ensure referential integrity

**Example Schema Refactoring**:
```typescript
// ❌ Before: Legacy schema with issues
export const users = mysqlTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  // Issue: No team isolation
  // Issue: No audit fields
  // Issue: No proper constraints
});

export const posts = mysqlTable("posts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }),
  content: text("content"),
  userId: varchar("user_id", { length: 255 }),
  // Issue: No team isolation
  // Issue: No proper foreign keys
});

// ✅ After: Modern schema following Kodix patterns
export const teams = mysqlTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  settings: json("settings").default({}),
  
  // Audit fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => ({
  slugIdx: index("teams_slug_idx").on(table.slug),
  createdAtIdx: index("teams_created_at_idx").on(table.createdAt),
}));

export const users = mysqlTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  avatar: varchar("avatar", { length: 500 }),
  role: mysqlEnum("role", ["member", "admin", "owner"]).default("member"),
  
  // Authentication
  passwordHash: varchar("password_hash", { length: 255 }),
  emailVerified: boolean("email_verified").default(false),
  
  // Audit fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => ({
  // Team isolation index (most important)
  teamIdIdx: index("users_team_id_idx").on(table.teamId),
  
  // Unique constraint: email per team
  teamEmailUnique: unique("users_team_email_unique").on(table.teamId, table.email),
  
  // Query optimization indexes
  emailIdx: index("users_email_idx").on(table.email),
  roleIdx: index("users_role_idx").on(table.role),
  createdAtIdx: index("users_created_at_idx").on(table.createdAt),
  
  // Foreign key relationships
  teamFk: foreignKey({
    columns: [table.teamId],
    foreignColumns: [teams.id],
    name: "users_team_fk"
  }).onDelete("cascade"),
}));

export const posts = mysqlTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").notNull(),
  userId: uuid("user_id").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content"),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft"),
  
  // SEO fields
  slug: varchar("slug", { length: 200 }),
  excerpt: text("excerpt"),
  
  // Metadata
  tags: json("tags").default([]),
  metadata: json("metadata").default({}),
  
  // Audit fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
  publishedAt: timestamp("published_at"),
}, (table) => ({
  // Team isolation (most important)
  teamIdIdx: index("posts_team_id_idx").on(table.teamId),
  
  // User posts lookup
  userIdIdx: index("posts_user_id_idx").on(table.userId),
  
  // Composite indexes for common queries
  teamUserIdx: index("posts_team_user_idx").on(table.teamId, table.userId),
  teamStatusIdx: index("posts_team_status_idx").on(table.teamId, table.status),
  
  // Published posts query optimization
  publishedAtIdx: index("posts_published_at_idx").on(table.publishedAt),
  
  // SEO optimization
  slugIdx: index("posts_slug_idx").on(table.slug),
  
  // Foreign key relationships
  teamFk: foreignKey({
    columns: [table.teamId],
    foreignColumns: [teams.id],
    name: "posts_team_fk"
  }).onDelete("cascade"),
  
  userFk: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "posts_user_fk"
  }).onDelete("cascade"),
}));

// Relations for type safety
export const teamsRelations = relations(teams, ({ many }) => ({
  users: many(users),
  posts: many(posts),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  team: one(teams, {
    fields: [users.teamId],
    references: [teams.id],
  }),
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  team: one(teams, {
    fields: [posts.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));
```

**Schema Improvements**:
1. Added proper team isolation with teamId fields
2. Implemented comprehensive indexing strategy
3. Added audit fields for all tables
4. Created proper foreign key relationships
5. Used appropriate data types (UUID, enums, JSON)
6. Added soft delete capability
7. Optimized for common query patterns
```

## 🔗 Related Resources

- [Performance Analysis Prompts](./performance-analysis.md)
- [Security Review Prompts](./security-review.md)
- [Feature Implementation Prompts](../development/feature-implementation.md)

<!-- AI-CONTEXT-BOUNDARY: end -->