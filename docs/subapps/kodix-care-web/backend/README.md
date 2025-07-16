# Kodix Care Web - Backend Documentation

<!-- AI-METADATA:
category: architecture
complexity: intermediate
updated: 2025-07-13
claude-ready: true
priority: high
token-optimized: true
audience: developers
ai-context-weight: important
-->

<!-- AI-CONTEXT-BOUNDARY: start -->

> **Status**: ✅ Production Ready & Actively Maintained  
> **Last Updated**: July 2025  
> **Related Documents**: [API Reference](./api-reference.md) | [Database Schema](./database-schema.md)

## 🔍 1. Overview and Principles

<!-- AI-COMPRESS: strategy="summary" max-tokens="150" -->
**Quick Summary**: Kodix Care Web backend implements healthcare-specific business logic with tRPC APIs, MySQL database, and comprehensive team isolation. Features include care task management, shift scheduling, and automated critical task notifications.
<!-- /AI-COMPRESS -->

The Kodix Care Web backend is designed around **healthcare workflow requirements** with emphasis on:

- **Data Isolation**: Strict team-based multi-tenancy for patient privacy
- **Audit Trail**: Complete tracking of care actions with timestamps and user attribution
- **Real-time Synchronization**: Seamless data sharing between web and mobile platforms
- **Progressive Workflows**: Task unlocking system to enforce proper care sequences
- **Critical Care Alerts**: Automated notification system for delayed critical tasks

### Core Design Principles

1. **Healthcare Compliance**: All data operations respect healthcare privacy requirements
2. **Team Isolation**: Every query includes teamId filtering for multi-tenancy
3. **Permission-based Access**: Role-based operations (ADMIN vs CAREGIVER)
4. **Cross-platform Consistency**: Shared API endpoints for web and mobile
5. **Audit-first Design**: All care actions are logged and traceable

## 🏗️ 2. Core Service Architecture

### Router Structure

```typescript
// Main tRPC router organization
kodixCare: {
  careTask: {
    // Task management operations
    getCareTasks(dateRange)
    createCareTask(data)
    editCareTask(id, updates)
    deleteCareTask(id)
    syncCareTasksFromCalendar()
    unlockMoreTasks(timestamp)
  },
  
  // Shift management operations
  getAllCareShifts()
  createCareShift(data)
  editCareShift(id, updates)
  deleteCareShift(id)
  
  // Configuration and caregivers
  getAllCaregivers()
  updateConfiguration(config)
}
```

### Service Layer Architecture

```typescript
// Service layer with healthcare-specific patterns
export class CareTaskService {
  // All methods enforce team isolation
  async findByTeamAndDateRange(teamId: string, dateRange: DateRange) {
    return await db.query.careTasks.findMany({
      where: and(
        eq(careTasks.teamId, teamId), // Always required
        gte(careTasks.date, dateRange.start),
        lte(careTasks.date, dateRange.end)
      ),
      orderBy: [desc(careTasks.date), asc(careTasks.createdAt)]
    });
  }

  async completeTask(taskId: string, userId: string, teamId: string) {
    // Validate team access before completion
    const task = await this.findById(taskId, teamId);
    if (!task) throw new TRPCError({ code: 'NOT_FOUND' });
    
    return await db.update(careTasks)
      .set({
        doneAt: new Date(),
        doneByUserId: userId
      })
      .where(and(
        eq(careTasks.id, taskId),
        eq(careTasks.teamId, teamId) // Double verification
      ));
  }
}
```

### Middleware Architecture

```typescript
// Healthcare-specific middleware
export const kodixCareInstalledMiddleware = t.middleware(async ({ ctx, next }) => {
  // Verify app installation for team
  const installation = await getAppInstallationByTeamId(
    ctx.session.user.teamId,
    "1z50i9xblo4b" // Kodix Care app ID
  );
  
  if (!installation) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Kodix Care is not installed for this team'
    });
  }
  
  return next({ ctx: { ...ctx, installation } });
});

export const kodixCarePermissionMiddleware = t.middleware(async ({ ctx, next }) => {
  // Validate user has caregiver role
  const caregiver = await db.query.caregivers.findFirst({
    where: and(
      eq(caregivers.userId, ctx.session.user.id),
      eq(caregivers.teamId, ctx.session.user.teamId)
    )
  });
  
  if (!caregiver) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'User is not configured as a caregiver'
    });
  }
  
  return next({ ctx: { ...ctx, caregiver } });
});
```

## 🚀 3. Advanced Features

### Progressive Task Unlocking System

**Purpose**: Prevent completion of future tasks to maintain care workflow integrity.

```typescript
// Task unlocking logic
export const unlockMoreTasks = protectedProcedure
  .input(z.object({ selectedTimestamp: z.date() }))
  .mutation(async ({ ctx, input }) => {
    const { selectedTimestamp } = input;
    const teamId = ctx.session.user.teamId;
    
    // Update configuration to allow tasks up to selected date
    await db.update(appTeamConfigs)
      .set({
        config: {
          ...currentConfig,
          clonedCareTasksUntil: selectedTimestamp
        }
      })
      .where(and(
        eq(appTeamConfigs.teamId, teamId),
        eq(appTeamConfigs.appId, "1z50i9xblo4b")
      ));
      
    return { success: true, unlockedUntil: selectedTimestamp };
  });
```

### Calendar Integration System

```typescript
// Sync care tasks from calendar events
export const syncCareTasksFromCalendar = protectedProcedure
  .mutation(async ({ ctx }) => {
    const teamId = ctx.session.user.teamId;
    
    // Get calendar events for the team
    const events = await getCalendarEventsForTeam(teamId);
    
    // Convert events to care tasks
    const careTasks = events.map(event => ({
      id: nanoid(),
      teamId,
      eventMasterId: event.id,
      title: event.title,
      description: event.description || '',
      details: '',
      date: event.date,
      type: 'NORMAL' as const,
      createdBy: ctx.session.user.id,
      createdFromCalendar: true
    }));
    
    // Bulk insert with conflict resolution
    await db.insert(careTasksTable).values(careTasks).onDuplicateKeyUpdate({
      title: sql`VALUES(title)`,
      description: sql`VALUES(description)`,
      date: sql`VALUES(date)`
    });
    
    return { synced: careTasks.length };
  });
```

### Critical Task Notification System

```typescript
// CRON job for delayed critical task notifications
// File: apps/qstash/src/kodix-care/send-notifications-for-critical-tasks.ts

export async function sendCriticalTaskNotifications() {
  const delayThreshold = 30 * 60 * 1000; // 30 minutes
  const cutoffTime = new Date(Date.now() - delayThreshold);
  
  // Find overdue critical tasks
  const overdueTasks = await db.query.careTasks.findMany({
    where: and(
      eq(careTasks.type, 'CRITICAL'),
      isNull(careTasks.doneAt),
      lt(careTasks.date, cutoffTime)
    ),
    with: {
      team: true,
      createdByUser: true
    }
  });
  
  // Group by team for batch notifications
  const tasksByTeam = groupBy(overdueTasks, 'teamId');
  
  for (const [teamId, tasks] of Object.entries(tasksByTeam)) {
    await sendTeamNotification(teamId, {
      type: 'CRITICAL_TASKS_DELAYED',
      count: tasks.length,
      tasks: tasks.map(t => ({ id: t.id, title: t.title, overdueDuration: Date.now() - t.date.getTime() }))
    });
  }
}
```

## 🔒 4. Security & Isolation

### Team Isolation Implementation

```typescript
// Example of proper team isolation
export const getCareTasks = protectedProcedure
  .input(CareTaskFilterSchema)
  .query(async ({ ctx, input }) => {
    const teamId = ctx.session.user.teamId; // From session
    
    return await db.query.careTasks.findMany({
      where: and(
        eq(careTasks.teamId, teamId), // ALWAYS required
        gte(careTasks.date, input.dateStart),
        lte(careTasks.date, input.dateEnd)
      ),
      orderBy: [desc(careTasks.date)]
    });
  });
```

### Permission Validation

```typescript
// Role-based operation example
export const deleteCareTask = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // Only ADMIN role can delete tasks
    if (ctx.caregiver.role !== 'ADMIN') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only administrators can delete care tasks'
      });
    }
    
    // Verify task belongs to user's team
    const task = await db.query.careTasks.findFirst({
      where: and(
        eq(careTasks.id, input.id),
        eq(careTasks.teamId, ctx.session.user.teamId)
      )
    });
    
    if (!task) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }
    
    return await db.delete(careTasks)
      .where(eq(careTasks.id, input.id));
  });
```

### Input Validation

```typescript
// Comprehensive Zod schemas for healthcare data
export const CreateCareTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000),
  details: z.string().max(2000),
  date: z.date(),
  type: z.enum(['NORMAL', 'CRITICAL']),
  eventMasterId: z.string().optional()
});

export const CareShiftSchema = z.object({
  caregiverId: z.string().uuid(),
  startAt: z.date(),
  endAt: z.date().refine((endDate, ctx) => {
    return endDate > ctx.parent.startAt;
  }, 'End time must be after start time'),
  notes: z.string().max(500).optional()
});
```

## ⚡ 5. Performance Optimization

### Database Query Optimization

```typescript
// Optimized queries with proper indexing
export async function getCareTasksWithOptimization(
  teamId: string,
  dateRange: { start: Date; end: Date }
) {
  return await db.query.careTasks.findMany({
    where: and(
      eq(careTasks.teamId, teamId), // Uses idx_team_id index
      gte(careTasks.date, dateRange.start), // Uses idx_date index
      lte(careTasks.date, dateRange.end)
    ),
    orderBy: [desc(careTasks.date)],
    limit: 100 // Prevent massive result sets
  });
}
```

### Caching Strategy

```typescript
// TanStack Query integration for caching
export const careTaskRouter = createTRPCRouter({
  getCareTasks: protectedProcedure
    .input(CareTaskFilterSchema)
    .query(async ({ ctx, input }) => {
      // Results cached by React Query on frontend
      return await careTaskService.findByTeamAndDateRange(
        ctx.session.user.teamId,
        input
      );
    })
});
```

## 🛠️ 6. Development Guidelines

### Error Handling Patterns

```typescript
// Standardized error handling
export class CareTaskError extends Error {
  constructor(
    message: string,
    public code: 'TASK_NOT_FOUND' | 'TASK_LOCKED' | 'PERMISSION_DENIED',
    public taskId?: string
  ) {
    super(message);
    this.name = 'CareTaskError';
  }
}

// Usage in endpoints
try {
  const result = await careTaskService.completeTask(taskId, userId, teamId);
  return result;
} catch (error) {
  if (error instanceof CareTaskError) {
    throw new TRPCError({
      code: error.code === 'PERMISSION_DENIED' ? 'FORBIDDEN' : 'BAD_REQUEST',
      message: error.message,
      cause: error
    });
  }
  throw error;
}
```

### Testing Patterns

```typescript
// Example service test with team isolation
describe('CareTaskService', () => {
  it('should enforce team isolation', async () => {
    const task1 = await createTestTask({ teamId: 'team-1' });
    const task2 = await createTestTask({ teamId: 'team-2' });
    
    const team1Tasks = await careTaskService.findByTeam('team-1');
    const team2Tasks = await careTaskService.findByTeam('team-2');
    
    expect(team1Tasks.map(t => t.id)).toContain(task1.id);
    expect(team1Tasks.map(t => t.id)).not.toContain(task2.id);
    
    expect(team2Tasks.map(t => t.id)).toContain(task2.id);
    expect(team2Tasks.map(t => t.id)).not.toContain(task1.id);
  });
});
```

## 🔄 7. Migration Status

### Current Architecture State

- ✅ **Team Isolation**: All queries properly filtered by teamId
- ✅ **Permission System**: Role-based access control implemented
- ✅ **Data Validation**: Comprehensive Zod schema validation
- ✅ **Cross-platform API**: Shared endpoints for web and mobile
- ✅ **Audit Trail**: Complete action logging with user attribution
- ✅ **Critical Care Alerts**: CRON-based notification system

### Planned Improvements

- 📅 **Advanced Analytics**: Care workflow analytics and reporting
- 📅 **Enhanced Permissions**: Granular permission system for different care roles
- 📅 **Integration APIs**: External healthcare system integration capabilities
- 📅 **Performance Monitoring**: Detailed performance metrics and alerting

## 📊 8. API Development Patterns

### Standard Endpoint Structure

```typescript
// Pattern for all Kodix Care endpoints
export const careEndpoint = protectedProcedure
  .use(kodixCareInstalledMiddleware) // App installation check
  .use(kodixCarePermissionMiddleware) // Caregiver role check
  .input(ValidationSchema) // Comprehensive input validation
  .mutation/query(async ({ ctx, input }) => {
    const teamId = ctx.session.user.teamId; // Always from session
    
    // Business logic with team isolation
    const result = await service.performOperation(input, teamId);
    
    // Audit logging
    await auditLogger.log({
      action: 'OPERATION_NAME',
      userId: ctx.session.user.id,
      teamId,
      resourceId: result.id,
      timestamp: new Date()
    });
    
    return result;
  });
```

### Cross-platform Compatibility

```typescript
// Endpoints designed for both web and mobile consumption
export const createCareTask = protectedProcedure
  .input(CreateCareTaskSchema)
  .output(CareTaskSchema) // Consistent response format
  .mutation(async ({ ctx, input }) => {
    // Implementation works for both platforms
    const task = await careTaskService.create({
      ...input,
      teamId: ctx.session.user.teamId,
      createdBy: ctx.session.user.id
    });
    
    // Return format compatible with both web and mobile
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      date: task.date,
      type: task.type,
      createdAt: task.createdAt,
      doneAt: task.doneAt,
      doneByUserId: task.doneByUserId
    };
  });
```

## 📈 9. Monitoring & Observability

### Performance Metrics

```typescript
// Built-in performance monitoring
export const monitoredProcedure = protectedProcedure
  .use(async ({ next, path }) => {
    const start = Date.now();
    const result = await next();
    const duration = Date.now() - start;
    
    // Log slow operations
    if (duration > 500) {
      logger.warn(`Slow operation: ${path} took ${duration}ms`);
    }
    
    // Metrics collection
    metrics.histogram('care_operation_duration', duration, { operation: path });
    
    return result;
  });
```

### Health Checks

```typescript
// Health check endpoint for monitoring
export async function healthCheck() {
  return {
    status: 'healthy',
    timestamp: new Date(),
    services: {
      database: await checkDatabaseConnection(),
      cache: await checkCacheConnection(),
      notifications: await checkNotificationService()
    }
  };
}
```

<!-- AI-CONTEXT-BOUNDARY: end -->

---

**API Version**: v1.0  
**Database Schema**: MySQL with Drizzle ORM  
**Last Updated**: 2025-07-13