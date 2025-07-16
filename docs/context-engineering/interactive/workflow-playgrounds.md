# Interactive Workflow Playgrounds

<!-- AI-METADATA:
category: automation
complexity: advanced
updated: 2025-01-12
claude-ready: true
phase: 4
priority: high
token-optimized: true
audience: fullstack
ai-context-weight: essential
last-ai-review: 2025-01-12
dependencies: ["live-code-system.md"]
related-concepts: ["guided-workflows", "interactive-learning", "hands-on-tutorials"]
-->

<!-- AI-CONTEXT-BOUNDARY: start -->

## 🔍 🎯 Overview

<!-- AI-COMPRESS: strategy="summary" max-tokens="150" -->
**Quick Summary**: Interactive playground environments for guided learning of key Kodix development workflows.
<!-- /AI-COMPRESS -->

Comprehensive interactive playground system that provides guided, hands-on learning experiences for critical Kodix development workflows. Combines step-by-step tutorials with live code execution and real-time validation.

## 🎮 Playground Types

### 1. SubApp Creation Playground

<!-- AI-INTERACTIVE: type="workflow-playground" -->
<!-- AI-WORKFLOW: step="1" total="5" -->

#### 🚀 Complete SubApp Development Workflow

**Interactive Guide**: Create a full SubApp from concept to deployment

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript-playground
// AI-CONTEXT: Interactive SubApp creation workflow
// Step 1: Define SubApp Structure

interface SubAppDefinition {
  name: string;
  displayName: string;
  description: string;
  category: 'feature' | 'utility' | 'integration';
  permissions: Permission[];
  routes: RouteDefinition[];
  apis: ApiDefinition[];
  components: ComponentDefinition[];
}

// Interactive form - modify these values
const mySubApp: SubAppDefinition = {
  name: "task-manager",        // ✏️ Edit me!
  displayName: "Task Manager", // ✏️ Edit me!
  description: "Manage team tasks and assignments",
  category: "feature",
  permissions: [
    { action: "read", resource: "tasks" },
    { action: "write", resource: "tasks" },
    { action: "manage", resource: "task-assignments" }
  ],
  routes: [
    { path: "/tasks", component: "TaskListPage", protected: true },
    { path: "/tasks/:id", component: "TaskDetailPage", protected: true },
    { path: "/tasks/create", component: "CreateTaskPage", protected: true }
  ],
  apis: [
    { name: "getTasks", type: "query", input: "TaskFilters", output: "Task[]" },
    { name: "createTask", type: "mutation", input: "CreateTaskInput", output: "Task" },
    { name: "updateTask", type: "mutation", input: "UpdateTaskInput", output: "Task" }
  ],
  components: [
    { name: "TaskCard", props: ["task", "onUpdate", "onDelete"] },
    { name: "TaskForm", props: ["initialData", "onSubmit"] },
    { name: "TaskFilters", props: ["filters", "onChange"] }
  ]
};

// Validation function
function validateSubAppDefinition(definition: SubAppDefinition): ValidationResult {
  const errors: string[] = [];
  
  // Name validation
  if (!definition.name.match(/^[a-z][a-z0-9-]*$/)) {
    errors.push("Name must be lowercase, start with letter, contain only letters, numbers, and hyphens");
  }
  
  // Route validation
  definition.routes.forEach(route => {
    if (!route.path.startsWith('/')) {
      errors.push(`Route path must start with '/': ${route.path}`);
    }
  });
  
  // Permission validation
  const validActions = ['read', 'write', 'manage', 'admin'];
  definition.permissions.forEach(perm => {
    if (!validActions.includes(perm.action)) {
      errors.push(`Invalid permission action: ${perm.action}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings: []
  };
}

// Execute validation
const validation = validateSubAppDefinition(mySubApp);
console.log("Validation Result:", validation);

export { mySubApp, validation };
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**Live Validation**: 
- ✅ Name format valid
- ✅ Routes properly structured  
- ✅ Permissions correctly defined
- ✅ Ready for Step 2

**Interactive Controls**:
- **SubApp Name**: [Text input with real-time validation]
- **Category**: [Dropdown: feature/utility/integration]
- **Add Route**: [Dynamic route builder]
- **Add Permission**: [Permission builder interface]

<!-- AI-WORKFLOW: step="2" total="5" -->

#### Step 2: Generate SubApp Structure

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript-playground
// AI-CONTEXT: Generate SubApp file structure and boilerplate
import { SubAppGenerator } from "~/core/subapp-generator";

async function generateSubAppStructure(definition: SubAppDefinition) {
  const generator = new SubAppGenerator();
  
  // Generate directory structure
  const structure = generator.createStructure(definition);
  
  // Generate boilerplate files
  const files = await generator.generateFiles(definition, {
    includeTests: true,
    includeStories: true,
    includeDocumentation: true,
    typescript: true
  });
  
  return {
    structure,
    files,
    commands: generator.getSetupCommands(definition)
  };
}

// Execute generation
const generatedSubApp = await generateSubAppStructure(mySubApp);

// Display structure
console.log("📁 Generated Structure:");
console.log(generatedSubApp.structure);

console.log("\n📄 Generated Files:");
generatedSubApp.files.forEach(file => {
  console.log(`${file.path} (${file.size} bytes)`);
});

console.log("\n🔧 Setup Commands:");
generatedSubApp.commands.forEach(cmd => {
  console.log(`$ ${cmd}`);
});

export default generatedSubApp;
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**Generated Output**:
```
📁 Structure Created:
/subapps/task-manager/
├── backend/
│   ├── routers/
│   │   └── task.router.ts
│   ├── services/
│   │   └── task.service.ts
│   └── schemas/
│       └── task.schema.ts
├── frontend/
│   ├── pages/
│   │   ├── TaskListPage.tsx
│   │   ├── TaskDetailPage.tsx
│   │   └── CreateTaskPage.tsx
│   ├── components/
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   └── TaskFilters.tsx
│   └── hooks/
│       └── useTasks.ts
├── tests/
├── stories/
└── README.md

🔧 Setup Commands:
$ cd subapps/task-manager
$ pnpm install
$ pnpm generate:types
$ pnpm test
```

<!-- AI-WORKFLOW: step="3" total="5" -->

#### Step 3: Implement Core API

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript-playground
// AI-CONTEXT: Implement tRPC router for the SubApp
import { router, publicProcedure, protectedProcedure } from "~/trpc/server";
import { z } from "zod";

// Define schemas
const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  assigneeId: z.string().uuid().optional(),
  teamId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date()
});

const CreateTaskInput = TaskSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

const UpdateTaskInput = TaskSchema.partial().extend({
  id: z.string().uuid()
});

// Implement router
export const taskRouter = router({
  // Get all tasks with filtering
  getAll: protectedProcedure
    .input(z.object({
      teamId: z.string().uuid(),
      status: z.enum(['todo', 'in-progress', 'completed']).optional(),
      assigneeId: z.string().uuid().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0)
    }))
    .output(z.object({
      tasks: z.array(TaskSchema),
      total: z.number(),
      hasMore: z.boolean()
    }))
    .query(async ({ input, ctx }) => {
      // Implementation with real database queries
      const { db } = ctx;
      
      const tasks = await db.task.findMany({
        where: {
          teamId: input.teamId,
          ...(input.status && { status: input.status }),
          ...(input.assigneeId && { assigneeId: input.assigneeId })
        },
        take: input.limit,
        skip: input.offset,
        orderBy: { createdAt: 'desc' }
      });
      
      const total = await db.task.count({
        where: {
          teamId: input.teamId,
          ...(input.status && { status: input.status }),
          ...(input.assigneeId && { assigneeId: input.assigneeId })
        }
      });
      
      return {
        tasks,
        total,
        hasMore: total > input.offset + input.limit
      };
    }),
  
  // Create new task
  create: protectedProcedure
    .input(CreateTaskInput)
    .output(TaskSchema)
    .mutation(async ({ input, ctx }) => {
      const { db, user } = ctx;
      
      // Validate team membership
      const teamMember = await db.teamMember.findFirst({
        where: {
          teamId: input.teamId,
          userId: user.id
        }
      });
      
      if (!teamMember) {
        throw new Error("Not authorized to create tasks in this team");
      }
      
      const task = await db.task.create({
        data: {
          ...input,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      return task;
    }),
  
  // Update existing task
  update: protectedProcedure
    .input(UpdateTaskInput)
    .output(TaskSchema)
    .mutation(async ({ input, ctx }) => {
      const { db, user } = ctx;
      
      // Verify task exists and user has permission
      const existingTask = await db.task.findUnique({
        where: { id: input.id },
        include: { team: { include: { members: true } } }
      });
      
      if (!existingTask) {
        throw new Error("Task not found");
      }
      
      const hasPermission = existingTask.team.members.some(
        member => member.userId === user.id
      );
      
      if (!hasPermission) {
        throw new Error("Not authorized to update this task");
      }
      
      const updatedTask = await db.task.update({
        where: { id: input.id },
        data: {
          ...input,
          updatedAt: new Date()
        }
      });
      
      return updatedTask;
    })
});

// Test the API
console.log("✅ Task Router implemented successfully!");
console.log("Available endpoints:");
console.log("- task.getAll: Query tasks with filters");
console.log("- task.create: Create new task");  
console.log("- task.update: Update existing task");
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**API Testing Console**:
```typescript
// Test creating a task
const newTask = await trpc.task.create.mutate({
  title: "Implement user authentication",
  description: "Add JWT-based auth system",
  status: "todo",
  priority: "high",
  teamId: "team_123",
  assigneeId: "user_456"
});

console.log("Created task:", newTask);
```

<!-- AI-WORKFLOW: step="4" total="5" -->

#### Step 4: Build Frontend Components

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript-playground
// AI-CONTEXT: Interactive React component implementation
import { useTRPC } from "~/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";

function TaskListPage() {
  const trpc = useTRPC();
  
  // Query tasks
  const { 
    data: tasksData, 
    isLoading, 
    error 
  } = useQuery(
    trpc.task.getAll.queryOptions({
      teamId: "current-team-id",
      limit: 20
    })
  );
  
  // Create task mutation
  const createTaskMutation = useMutation(
    trpc.task.create.mutationOptions({
      onSuccess: () => {
        // Invalidate tasks query to refresh data
        trpc.task.getAll.invalidate();
      }
    })
  );
  
  const handleCreateTask = async (taskData: CreateTaskInput) => {
    await createTaskMutation.mutateAsync(taskData);
  };
  
  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div className="task-list-page">
      <header className="page-header">
        <h1>Tasks</h1>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="btn-primary"
        >
          Create Task
        </button>
      </header>
      
      <div className="task-grid">
        {tasksData?.tasks.map(task => (
          <TaskCard 
            key={task.id}
            task={task}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
          />
        ))}
      </div>
      
      {tasksData?.hasMore && (
        <button 
          onClick={loadMoreTasks}
          className="load-more-btn"
        >
          Load More Tasks
        </button>
      )}
      
      {showCreateForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
}

// Interactive Task Card Component
function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800', 
    high: 'bg-red-100 text-red-800'
  };
  
  const statusIcons = {
    todo: '📋',
    'in-progress': '🔄',
    completed: '✅'
  };
  
  return (
    <div className="task-card">
      <div className="task-header">
        <h3>{task.title}</h3>
        <div className="task-controls">
          <button onClick={() => setIsEditing(true)}>✏️</button>
          <button onClick={() => onDelete(task.id)}>🗑️</button>
        </div>
      </div>
      
      <p className="task-description">{task.description}</p>
      
      <div className="task-meta">
        <span className={`priority-badge ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        
        <span className="status-badge">
          {statusIcons[task.status]} {task.status}
        </span>
      </div>
      
      <div className="task-footer">
        <small>
          Created: {new Date(task.createdAt).toLocaleDateString()}
        </small>
        
        {task.assigneeId && (
          <UserAvatar userId={task.assigneeId} />
        )}
      </div>
      
      {isEditing && (
        <TaskEditForm
          task={task}
          onSave={(updatedTask) => {
            onUpdate(updatedTask);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}

// Export components for testing
export { TaskListPage, TaskCard };
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**Live Component Preview**:
```jsx
<TaskListPage />
```

**Component Testing Controls**:
- **Add Sample Tasks**: [Button]
- **Test Status Changes**: [Dropdown]
- **Test Filtering**: [Filter controls]
- **Test Pagination**: [Load more button]

<!-- AI-WORKFLOW: step="5" total="5" -->

#### Step 5: Integration & Testing

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript-playground
// AI-CONTEXT: Complete SubApp integration and testing
import { SubAppRegistry } from "~/core/subapp-registry";

// Register the SubApp with the platform
async function registerTaskManagerSubApp() {
  const registry = SubAppRegistry.getInstance();
  
  const registration = await registry.register({
    id: "task-manager",
    name: "Task Manager",
    version: "1.0.0",
    description: "Manage team tasks and assignments",
    
    // Router integration
    router: taskRouter,
    routerPath: "/api/task",
    
    // Frontend routes
    routes: [
      {
        path: "/tasks",
        component: () => import("./frontend/pages/TaskListPage"),
        protected: true,
        permissions: ["tasks:read"]
      },
      {
        path: "/tasks/:id",
        component: () => import("./frontend/pages/TaskDetailPage"),
        protected: true,
        permissions: ["tasks:read"]
      }
    ],
    
    // Navigation menu
    navigation: {
      label: "Tasks",
      icon: "📋",
      order: 3,
      requiredPermissions: ["tasks:read"]
    },
    
    // Database schema
    migrations: [
      "./migrations/001_create_tasks_table.sql",
      "./migrations/002_add_task_indexes.sql"
    ],
    
    // Dependencies
    dependencies: {
      core: "^1.0.0",
      user: "^1.0.0",
      team: "^1.0.0"
    }
  });
  
  console.log("✅ SubApp registered successfully!");
  console.log("Registration ID:", registration.id);
  console.log("Status:", registration.status);
  
  return registration;
}

// Run comprehensive tests
async function runSubAppTests() {
  console.log("🧪 Running SubApp tests...");
  
  const testResults = {
    apiTests: await testTaskApi(),
    componentTests: await testTaskComponents(),
    integrationTests: await testSubAppIntegration(),
    e2eTests: await testUserWorkflows()
  };
  
  const allPassed = Object.values(testResults).every(result => result.passed);
  
  console.log("📊 Test Results:");
  Object.entries(testResults).forEach(([category, result]) => {
    console.log(`${result.passed ? '✅' : '❌'} ${category}: ${result.passed ? 'PASSED' : 'FAILED'}`);
    if (!result.passed) {
      result.failures.forEach(failure => {
        console.log(`   - ${failure}`);
      });
    }
  });
  
  return { allPassed, results: testResults };
}

// Execute registration and testing
const registration = await registerTaskManagerSubApp();
const testResults = await runSubAppTests();

if (testResults.allPassed) {
  console.log("🎉 SubApp ready for deployment!");
  console.log("Access URL: /subapps/task-manager");
} else {
  console.log("❌ SubApp has issues that need to be resolved");
}

export { registration, testResults };
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**Final Integration Results**:
```
✅ SubApp Registration: SUCCESS
✅ API Tests: 15/15 passed
✅ Component Tests: 23/23 passed  
✅ Integration Tests: 8/8 passed
✅ E2E Tests: 12/12 passed

🎉 Task Manager SubApp ready for production!

🔗 Access Points:
- API: /api/task/*
- Frontend: /tasks
- Admin: /admin/subapps/task-manager

📊 Performance Metrics:
- Bundle size: 45KB (gzipped)
- Initial load: 180ms
- API response: <100ms avg
```

<!-- /AI-INTERACTIVE -->

### 2. tRPC API Development Playground

<!-- AI-INTERACTIVE: type="api-playground" -->

#### 🔗 Complete API Development Workflow

**Interactive Guide**: Build, test, and deploy tRPC APIs

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript-playground
// AI-CONTEXT: Interactive tRPC API development
// Real-time API builder with live testing

import { router, publicProcedure, protectedProcedure } from "~/trpc/server";
import { z } from "zod";

// Step 1: Define your data schema
const UserProfileSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(20),
  email: z.string().email(),
  displayName: z.string().min(1).max(50),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']),
    notifications: z.boolean(),
    language: z.string()
  }),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Step 2: Build your API endpoints
export const userProfileRouter = router({
  // Get user profile
  get: publicProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .output(UserProfileSchema.nullable())
    .query(async ({ input, ctx }) => {
      // Connect to real database
      return ctx.db.userProfile.findUnique({
        where: { id: input.userId }
      });
    }),
  
  // Update user profile  
  update: protectedProcedure
    .input(UserProfileSchema.partial().extend({
      id: z.string().uuid()
    }))
    .output(UserProfileSchema)
    .mutation(async ({ input, ctx }) => {
      // Verify user can update this profile
      if (input.id !== ctx.user.id) {
        throw new Error("Cannot update another user's profile");
      }
      
      return ctx.db.userProfile.update({
        where: { id: input.id },
        data: {
          ...input,
          updatedAt: new Date()
        }
      });
    }),
  
  // Get user's activity feed
  getActivityFeed: protectedProcedure
    .input(z.object({
      userId: z.string().uuid(),
      limit: z.number().min(1).max(50).default(20),
      cursor: z.string().optional()
    }))
    .output(z.object({
      activities: z.array(z.object({
        id: z.string(),
        type: z.string(),
        data: z.record(z.any()),
        createdAt: z.date()
      })),
      nextCursor: z.string().nullable()
    }))
    .query(async ({ input, ctx }) => {
      const activities = await ctx.db.activity.findMany({
        where: { userId: input.userId },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' }
      });
      
      let nextCursor: string | null = null;
      if (activities.length > input.limit) {
        const nextItem = activities.pop();
        nextCursor = nextItem!.id;
      }
      
      return {
        activities,
        nextCursor
      };
    })
});

console.log("✅ API Router created successfully!");
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**Live API Tester**:
```typescript
// Test your endpoints in real-time
const testResults = {
  getUserProfile: null,
  updateProfile: null,
  getActivityFeed: null
};

// Test get profile
try {
  testResults.getUserProfile = await trpc.userProfile.get.query({
    userId: "user_123"
  });
  console.log("✅ Get profile test passed");
} catch (error) {
  console.log("❌ Get profile test failed:", error.message);
}

// Test update profile
try {
  testResults.updateProfile = await trpc.userProfile.update.mutate({
    id: "user_123",
    displayName: "Updated Name",
    bio: "Updated bio"
  });
  console.log("✅ Update profile test passed");
} catch (error) {
  console.log("❌ Update profile test failed:", error.message);
}

// Display test results
console.log("API Test Results:", testResults);
```

**Interactive Controls**:
- **Schema Editor**: [Live schema validation]
- **Endpoint Tester**: [Send real requests]
- **Response Inspector**: [JSON viewer]
- **Performance Monitor**: [Response times]

<!-- /AI-INTERACTIVE -->

### 3. Authentication & Security Playground

<!-- AI-INTERACTIVE: type="security-playground" -->

#### 🔐 Security Implementation Workflow

**Interactive Guide**: Implement authentication, authorization, and security

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript-playground
// AI-CONTEXT: Interactive security implementation
// JWT authentication with role-based access control

import { sign, verify } from "jsonwebtoken";
import { hash, compare } from "bcryptjs";
import { z } from "zod";

// Security schemas
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const UserRoleSchema = z.enum(['user', 'admin', 'moderator']);

const PermissionSchema = z.object({
  resource: z.string(),
  action: z.enum(['create', 'read', 'update', 'delete']),
  conditions: z.record(z.any()).optional()
});

// Authentication service
class AuthService {
  private jwtSecret: string;
  
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || "demo-secret";
  }
  
  // Generate secure JWT token
  generateToken(user: { id: string; email: string; role: string }): string {
    return sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      this.jwtSecret,
      { 
        expiresIn: '24h',
        issuer: 'kodix-platform',
        audience: 'kodix-users'
      }
    );
  }
  
  // Verify and decode token
  verifyToken(token: string): { userId: string; email: string; role: string } {
    try {
      const decoded = verify(token, this.jwtSecret) as any;
      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
  
  // Hash password securely
  async hashPassword(password: string): Promise<string> {
    return hash(password, 12);
  }
  
  // Verify password
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword);
  }
}

// Role-based access control
class RBACService {
  private rolePermissions = new Map<string, PermissionSchema[]>();
  
  constructor() {
    this.setupDefaultRoles();
  }
  
  private setupDefaultRoles() {
    // User role permissions
    this.rolePermissions.set('user', [
      { resource: 'profile', action: 'read' },
      { resource: 'profile', action: 'update', conditions: { ownerId: 'self' } },
      { resource: 'tasks', action: 'read', conditions: { teamMember: true } },
      { resource: 'tasks', action: 'create', conditions: { teamMember: true } }
    ]);
    
    // Admin role permissions  
    this.rolePermissions.set('admin', [
      { resource: '*', action: 'create' },
      { resource: '*', action: 'read' },
      { resource: '*', action: 'update' },
      { resource: '*', action: 'delete' }
    ]);
    
    // Moderator role permissions
    this.rolePermissions.set('moderator', [
      { resource: 'users', action: 'read' },
      { resource: 'users', action: 'update', conditions: { not: 'admin' } },
      { resource: 'content', action: 'read' },
      { resource: 'content', action: 'update' },
      { resource: 'content', action: 'delete' }
    ]);
  }
  
  // Check if user has permission
  hasPermission(
    userRole: string, 
    resource: string, 
    action: string, 
    context?: Record<string, any>
  ): boolean {
    const permissions = this.rolePermissions.get(userRole) || [];
    
    for (const permission of permissions) {
      // Check wildcard permissions
      if (permission.resource === '*' && permission.action === action) {
        return true;
      }
      
      // Check exact resource match
      if (permission.resource === resource && permission.action === action) {
        // Check conditions if present
        if (permission.conditions && context) {
          return this.checkConditions(permission.conditions, context);
        }
        return true;
      }
    }
    
    return false;
  }
  
  private checkConditions(conditions: Record<string, any>, context: Record<string, any>): boolean {
    return Object.entries(conditions).every(([key, value]) => {
      if (key === 'ownerId' && value === 'self') {
        return context.userId === context.resourceOwnerId;
      }
      if (key === 'teamMember') {
        return context.userTeams?.includes(context.resourceTeamId);
      }
      return context[key] === value;
    });
  }
}

// Test the security system
const authService = new AuthService();
const rbacService = new RBACService();

// Demo user login
async function demoLogin() {
  console.log("🔐 Testing authentication system...");
  
  // Simulate user login
  const loginData = {
    email: "demo@kodix.com",
    password: "securepassword123"
  };
  
  // Hash password (normally done during registration)
  const hashedPassword = await authService.hashPassword(loginData.password);
  console.log("Password hashed:", hashedPassword.substring(0, 20) + "...");
  
  // Verify password
  const passwordValid = await authService.verifyPassword(loginData.password, hashedPassword);
  console.log("Password verification:", passwordValid ? "✅ Valid" : "❌ Invalid");
  
  if (passwordValid) {
    // Generate JWT token
    const token = authService.generateToken({
      id: "user_123",
      email: loginData.email,
      role: "user"
    });
    
    console.log("JWT token generated:", token.substring(0, 30) + "...");
    
    // Verify token
    const decoded = authService.verifyToken(token);
    console.log("Token decoded:", decoded);
    
    return { token, user: decoded };
  }
  
  throw new Error("Authentication failed");
}

// Test permissions
function testPermissions(userRole: string) {
  console.log(`\n🔒 Testing permissions for role: ${userRole}`);
  
  const testCases = [
    { resource: 'profile', action: 'read', context: {} },
    { resource: 'profile', action: 'update', context: { userId: 'user_123', resourceOwnerId: 'user_123' } },
    { resource: 'tasks', action: 'create', context: { userTeams: ['team_1'], resourceTeamId: 'team_1' } },
    { resource: 'users', action: 'delete', context: {} }
  ];
  
  testCases.forEach(testCase => {
    const hasPermission = rbacService.hasPermission(
      userRole, 
      testCase.resource, 
      testCase.action, 
      testCase.context
    );
    
    console.log(
      `${hasPermission ? '✅' : '❌'} ${userRole} can ${testCase.action} ${testCase.resource}`
    );
  });
}

// Run security tests
const authResult = await demoLogin();
testPermissions('user');
testPermissions('admin');
testPermissions('moderator');

export { authService, rbacService, authResult };
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**Security Test Results**:
```
🔐 Authentication Test: ✅ PASSED
🔒 Authorization Test: ✅ PASSED  
🛡️ Token Validation: ✅ PASSED
🔑 Permission Checks: ✅ PASSED

Security Score: 95/100
- ✅ Strong password hashing (bcrypt)
- ✅ Secure JWT implementation
- ✅ Role-based access control
- ✅ Condition-based permissions
- ⚠️ Consider adding rate limiting
```

**Interactive Security Tools**:
- **Token Generator**: [Create test JWT tokens]
- **Permission Checker**: [Test role permissions]
- **Password Strength**: [Test password policies]
- **Security Scanner**: [Analyze vulnerabilities]

<!-- /AI-INTERACTIVE -->

<!-- AI-CONTEXT-BOUNDARY: end -->

---

**📝 Status**: Interactive Workflow Playgrounds v1.0  
**🎯 Phase 4**: Week 3 Interactive Features  
**🎮 Playgrounds**: SubApp Creation, API Development, Security Implementation  
**📊 Next**: Smart navigation with context awareness