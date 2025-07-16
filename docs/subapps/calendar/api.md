# Calendar SubApp - API Documentation

<!-- AI-METADATA:
category: reference
complexity: intermediate
updated: 2025-07-13
claude-ready: true
priority: medium
token-optimized: true
audience: developers
ai-context-weight: medium
-->

<!-- AI-CONTEXT-BOUNDARY: start -->

## 🔍 Overview

Complete API reference for the Calendar SubApp tRPC endpoints. All endpoints enforce team isolation and provide type-safe communication between frontend and backend.

**Base Route**: `app.calendar`  
**Authentication**: Required (protectedProcedure)  
**Team Isolation**: All operations filtered by `activeTeamId`

## 📋 Event Management Endpoints

### `getAll`

Retrieve all events for a specific date range with team isolation.

**Type**: `query`  
**Procedure**: `protectedProcedure`

```typescript
// Input Schema
input: z.object({
  dateStart: z.date(),
  dateEnd: z.date()
})

// Output Schema
output: z.array(CalendarEventSchema)

// Usage Example
const { data: events } = api.app.calendar.getAll.useQuery({
  dateStart: startOfDay(selectedDate),
  dateEnd: endOfDay(selectedDate)
});
```

**Query Logic**:
```typescript
export const getAll = protectedProcedure
  .input(GetCalendarEventsSchema)
  .query(async ({ ctx, input }) => {
    const teamId = ctx.session.user.activeTeamId;
    
    // Get events with composite resolution
    return await calendarService.getEventsForDateRange(
      teamId,
      input.dateStart,
      input.dateEnd
    );
  });
```

**Response Structure**:
```typescript
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  dateStart: Date;
  type: 'NORMAL' | 'CRITICAL';
  teamId: string;
  createdBy: string;
  
  // Recurrence information
  isRecurrence: boolean;
  rule?: string;
  originalDate?: Date;
  
  // Exception information
  isException: boolean;
  exceptionId?: string;
  
  // Series information
  seriesId?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

---

### `create`

Create a new event or recurring event series.

**Type**: `mutation`  
**Procedure**: `protectedProcedure`

```typescript
// Input Schema
input: z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  dateStart: z.date(),
  type: z.enum(['NORMAL', 'CRITICAL']).default('NORMAL'),
  rule: z.string().refine(validateRRule, {
    message: 'Invalid recurrence rule format'
  }).optional(),
  dateUntil: z.date().optional()
})

// Output Schema
output: EventMasterSchema

// Usage Example
const createMutation = api.app.calendar.create.useMutation({
  onSuccess: () => {
    toast.success('Event created successfully');
    utils.app.calendar.getAll.invalidate();
  }
});

createMutation.mutate({
  title: "Weekly Team Meeting",
  description: "Regular team standup meeting",
  dateStart: new Date("2025-07-15T09:00:00"),
  type: "NORMAL",
  rule: "FREQ=WEEKLY;BYDAY=MO" // Every Monday
});
```

**Validation Rules**:
- **Title**: Required, 1-255 characters
- **Description**: Optional, max 1000 characters
- **Date**: Must be valid future date
- **Rule**: Must be valid RRule format if provided
- **Type**: Must be NORMAL or CRITICAL

**RRule Validation**:
```typescript
function validateRRule(rule: string): boolean {
  try {
    new RRule(RRule.fromString(rule));
    return true;
  } catch (error) {
    return false;
  }
}
```

---

### `edit`

Edit an existing event with scope-based modifications.

**Type**: `mutation`  
**Procedure**: `protectedProcedure`

```typescript
// Input Schema
input: z.object({
  id: z.string(),
  originalDate: z.date(),
  scope: z.enum(['single', 'thisAndFuture', 'all']),
  updates: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    newDate: z.date().optional(),
    type: z.enum(['NORMAL', 'CRITICAL']).optional()
  })
})

// Output Schema
output: z.object({
  success: z.boolean(),
  type: z.enum(['exception', 'series_split', 'master_update'])
})

// Usage Example
const editMutation = api.app.calendar.edit.useMutation({
  onSuccess: (result) => {
    toast.success(`Event updated (${result.type})`);
    utils.app.calendar.getAll.invalidate();
  }
});

editMutation.mutate({
  id: "evt_123",
  originalDate: new Date("2025-07-15T09:00:00"),
  scope: "single",
  updates: {
    title: "Team Meeting (Rescheduled)",
    newDate: new Date("2025-07-15T10:00:00")
  }
});
```

**Edit Scopes**:

#### Single Occurrence (`single`)
- **Action**: Creates exception record
- **Effect**: Only selected occurrence modified
- **Database**: Inserts into `eventExceptions` table

```typescript
// Exception creation logic
async function createException(
  eventId: string,
  originalDate: Date,
  updates: EventUpdates,
  teamId: string
): Promise<void> {
  await db.insert(eventExceptions).values({
    id: nanoid(),
    eventMasterId: eventId,
    originalDate,
    newDate: updates.newDate || originalDate,
    title: updates.title,
    description: updates.description,
    type: updates.type
  });
}
```

#### This and Future (`thisAndFuture`)
- **Action**: Splits series at selected date
- **Effect**: Creates new master for future occurrences
- **Database**: Updates original master `dateUntil`, creates new master

```typescript
// Series splitting logic
async function splitSeries(
  eventId: string,
  splitDate: Date,
  updates: EventUpdates,
  teamId: string
): Promise<void> {
  // 1. End original series day before split
  const dayBefore = subDays(splitDate, 1);
  await db.update(eventMasters)
    .set({ dateUntil: dayBefore })
    .where(eq(eventMasters.id, eventId));
  
  // 2. Create new series starting from split date
  await db.insert(eventMasters).values({
    id: nanoid(),
    ...updates,
    dateStart: splitDate,
    teamId,
    createdBy: ctx.session.user.id
  });
}
```

#### All Occurrences (`all`)
- **Action**: Updates master event
- **Effect**: All occurrences reflect changes
- **Database**: Updates `eventMasters` record

```typescript
// Master update logic
async function updateMaster(
  eventId: string,
  updates: EventUpdates,
  teamId: string
): Promise<void> {
  await db.update(eventMasters)
    .set({
      title: updates.title,
      description: updates.description,
      type: updates.type,
      updatedAt: new Date()
    })
    .where(and(
      eq(eventMasters.id, eventId),
      eq(eventMasters.teamId, teamId)
    ));
}
```

---

### `cancel`

Cancel events with flexible scoping options.

**Type**: `mutation`  
**Procedure**: `protectedProcedure`

```typescript
// Input Schema
input: z.object({
  id: z.string(),
  originalDate: z.date(),
  scope: z.enum(['single', 'thisAndFuture', 'all'])
})

// Output Schema
output: z.object({
  success: z.boolean(),
  type: z.enum(['cancellation', 'series_end', 'master_delete'])
})

// Usage Example
const cancelMutation = api.app.calendar.cancel.useMutation({
  onSuccess: (result) => {
    toast.success(`Event cancelled (${result.type})`);
    utils.app.calendar.getAll.invalidate();
  }
});

cancelMutation.mutate({
  id: "evt_123",
  originalDate: new Date("2025-07-15T09:00:00"),
  scope: "single"
});
```

**Cancellation Scopes**:

#### Single Occurrence (`single`)
```typescript
// Creates cancellation record
await db.insert(eventCancellations).values({
  id: nanoid(),
  eventMasterId: eventId,
  originalDate: originalDate
});
```

#### This and Future (`thisAndFuture`)
```typescript
// Ends series at selected date
const dayBefore = subDays(originalDate, 1);
await db.update(eventMasters)
  .set({ dateUntil: dayBefore })
  .where(eq(eventMasters.id, eventId));
```

#### All Occurrences (`all`)
```typescript
// Deletes master record (cascades to exceptions and cancellations)
await db.delete(eventMasters)
  .where(eq(eventMasters.id, eventId));
```

## 🔧 Service Layer Architecture

### CalendarService Class

```typescript
export class CalendarService {
  async getEventsForDateRange(
    teamId: string,
    dateStart: Date,
    dateEnd: Date
  ): Promise<CalendarEvent[]> {
    // 1. Fetch event masters in date range
    const masters = await this.getEventMasters(teamId, dateStart, dateEnd);
    
    // 2. Fetch exceptions for these masters
    const exceptions = await this.getEventExceptions(
      masters.map(m => m.id),
      dateStart,
      dateEnd
    );
    
    // 3. Fetch cancellations for these masters
    const cancellations = await this.getEventCancellations(
      masters.map(m => m.id),
      dateStart,
      dateEnd
    );
    
    // 4. Resolve composite events
    return this.resolveCompositeEvents(
      masters,
      exceptions,
      cancellations,
      dateStart,
      dateEnd
    );
  }

  private async getEventMasters(
    teamId: string,
    dateStart: Date,
    dateEnd: Date
  ): Promise<EventMaster[]> {
    return await db.query.eventMasters.findMany({
      where: and(
        eq(eventMasters.teamId, teamId),
        or(
          // Single events in range
          and(
            isNull(eventMasters.rule),
            gte(eventMasters.dateStart, dateStart),
            lte(eventMasters.dateStart, dateEnd)
          ),
          // Recurring events that might have occurrences in range
          and(
            isNotNull(eventMasters.rule),
            or(
              isNull(eventMasters.dateUntil),
              gte(eventMasters.dateUntil, dateStart)
            ),
            lte(eventMasters.dateStart, dateEnd)
          )
        )
      ),
      orderBy: asc(eventMasters.dateStart)
    });
  }

  private resolveCompositeEvents(
    masters: EventMaster[],
    exceptions: EventException[],
    cancellations: EventCancellation[],
    dateStart: Date,
    dateEnd: Date
  ): CalendarEvent[] {
    const resolvedEvents: CalendarEvent[] = [];
    
    for (const master of masters) {
      if (master.rule) {
        // Generate recurring occurrences
        const occurrences = this.generateOccurrences(master, dateStart, dateEnd);
        
        for (const occurrence of occurrences) {
          // Check if cancelled
          const isCancelled = cancellations.some(c =>
            c.eventMasterId === master.id &&
            c.originalDate.getTime() === occurrence.dateStart.getTime()
          );
          
          if (isCancelled) continue;
          
          // Check for exception
          const exception = exceptions.find(e =>
            e.eventMasterId === master.id &&
            e.originalDate.getTime() === occurrence.dateStart.getTime()
          );
          
          if (exception) {
            // Apply exception modifications
            resolvedEvents.push({
              ...occurrence,
              dateStart: exception.newDate,
              title: exception.title ?? occurrence.title,
              description: exception.description ?? occurrence.description,
              type: exception.type ?? occurrence.type,
              isException: true,
              exceptionId: exception.id
            });
          } else {
            resolvedEvents.push(occurrence);
          }
        }
      } else {
        // Single event
        if (isDateInRange(master.dateStart, dateStart, dateEnd)) {
          resolvedEvents.push({
            ...master,
            isRecurrence: false,
            isException: false
          });
        }
      }
    }
    
    return resolvedEvents.sort((a, b) => 
      a.dateStart.getTime() - b.dateStart.getTime()
    );
  }

  private generateOccurrences(
    master: EventMaster,
    dateStart: Date,
    dateEnd: Date
  ): CalendarEvent[] {
    const rule = new RRule(RRule.fromString(master.rule!), {
      dtstart: master.dateStart
    });
    
    const until = master.dateUntil || dateEnd;
    const occurrences = rule.between(dateStart, until, true);
    
    return occurrences.map(date => ({
      ...master,
      dateStart: date,
      isRecurrence: true,
      isException: false,
      originalDate: date,
      seriesId: master.id
    }));
  }
}
```

## 🔒 Security & Validation

### Team Isolation Enforcement

```typescript
// Middleware ensures all operations are team-scoped
export const calendarMiddleware = t.middleware(async ({ ctx, next }) => {
  const result = await next();
  
  // Validate team access for all returned data
  if (result.ok && result.data) {
    validateTeamAccess(result.data, ctx.session.user.activeTeamId);
  }
  
  return result;
});

function validateTeamAccess(data: any, teamId: string): void {
  if (Array.isArray(data)) {
    data.forEach(item => {
      if (item.teamId && item.teamId !== teamId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied to team data'
        });
      }
    });
  } else if (data.teamId && data.teamId !== teamId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Access denied to team data'
    });
  }
}
```

### Input Validation Schemas

```typescript
// Comprehensive validation schemas
export const CreateCalendarEventSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .trim(),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  dateStart: z.date()
    .refine(date => date > new Date(), 'Event must be in the future'),
  type: z.enum(['NORMAL', 'CRITICAL'])
    .default('NORMAL'),
  rule: z.string()
    .refine(validateRRule, 'Invalid recurrence rule format')
    .optional(),
  dateUntil: z.date()
    .optional()
}).refine(data => {
  // Custom validation: dateUntil must be after dateStart
  if (data.dateUntil && data.dateUntil <= data.dateStart) {
    return false;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['dateUntil']
});

export const EditCalendarEventSchema = z.object({
  id: z.string().uuid('Invalid event ID'),
  originalDate: z.date(),
  scope: z.enum(['single', 'thisAndFuture', 'all']),
  updates: z.object({
    title: z.string()
      .min(1, 'Title is required')
      .max(255, 'Title must be less than 255 characters')
      .optional(),
    description: z.string()
      .max(1000, 'Description must be less than 1000 characters')
      .optional(),
    newDate: z.date().optional(),
    type: z.enum(['NORMAL', 'CRITICAL']).optional()
  })
}).refine(data => {
  // At least one update field must be provided
  const { title, description, newDate, type } = data.updates;
  return title || description || newDate || type;
}, {
  message: 'At least one field must be updated',
  path: ['updates']
});
```

## 📊 Performance Optimizations

### Query Optimization

```typescript
// Optimized database queries with proper indexing
const getEventsQuery = `
  SELECT 
    em.*,
    ee.id as exception_id,
    ee.originalDate as exception_original,
    ee.newDate as exception_new,
    ee.title as exception_title,
    ee.description as exception_description,
    ee.type as exception_type,
    ec.originalDate as cancelled_date
  FROM eventMasters em
  LEFT JOIN eventExceptions ee ON em.id = ee.eventMasterId
    AND ee.originalDate BETWEEN ? AND ?
  LEFT JOIN eventCancellations ec ON em.id = ec.eventMasterId
    AND ec.originalDate BETWEEN ? AND ?
  WHERE em.teamId = ?
    AND (
      (em.rule IS NULL AND em.dateStart BETWEEN ? AND ?) OR
      (em.rule IS NOT NULL AND (em.dateUntil IS NULL OR em.dateUntil >= ?))
    )
  ORDER BY em.dateStart ASC
`;

// Required indexes for optimal performance
const requiredIndexes = [
  'idx_eventMasters_team_date (teamId, dateStart)',
  'idx_eventMasters_team_until (teamId, dateUntil)',
  'idx_eventExceptions_master_original (eventMasterId, originalDate)',
  'idx_eventCancellations_master_original (eventMasterId, originalDate)'
];
```

### Cache Strategy

```typescript
// TanStack Query configuration for optimal caching
export const calendarQueryConfig = {
  staleTime: 10 * 1000, // 10 seconds
  cacheTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: false,
  refetchOnMount: 'always' as const,
  select: (data: CalendarEvent[]) => 
    data.sort((a, b) => a.dateStart.getTime() - b.dateStart.getTime())
};

// Selective cache invalidation
export function invalidateCalendarCache(
  affectedDates: Date[],
  teamId: string
) {
  const utils = api.useUtils();
  
  // Invalidate queries that overlap with affected dates
  affectedDates.forEach(date => {
    utils.app.calendar.getAll.invalidate({
      dateStart: startOfDay(date),
      dateEnd: endOfDay(date)
    });
  });
}
```

## 🔄 Error Handling

### API Error Responses

```typescript
// Standardized error handling
export const calendarErrorHandler = (error: TRPCError) => {
  switch (error.code) {
    case 'NOT_FOUND':
      return {
        message: 'Event not found or access denied',
        action: 'refresh_page'
      };
    
    case 'FORBIDDEN':
      return {
        message: 'You do not have permission to perform this action',
        action: 'check_permissions'
      };
    
    case 'BAD_REQUEST':
      return {
        message: 'Invalid input data',
        action: 'check_form_data',
        details: error.message
      };
    
    case 'INTERNAL_SERVER_ERROR':
      return {
        message: 'An unexpected error occurred',
        action: 'try_again_later'
      };
    
    default:
      return {
        message: 'An error occurred',
        action: 'contact_support'
      };
  }
};

// Error boundary for calendar operations
export function CalendarErrorBoundary({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <ErrorBoundary
      FallbackComponent={CalendarErrorFallback}
      onError={(error, errorInfo) => {
        logger.error('Calendar API error', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

<!-- AI-CONTEXT-BOUNDARY: end -->

---

**API Version**: v1.0  
**tRPC Version**: v11  
**Last Updated**: 2025-07-13