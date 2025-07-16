# API Reference - Kodix Care Web

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

Complete API reference for the Kodix Care Web tRPC endpoints. All endpoints require authentication and enforce team isolation for healthcare data privacy.

**Base Route**: `kodixCare`  
**Authentication**: Required (protectedProcedure)  
**Team Isolation**: All operations filtered by `teamId`

## 📋 Care Task Management

### `careTask.getCareTasks`

Get care tasks for a date range with team isolation.

**Type**: `query`  
**Middleware**: `kodixCareInstalled`, `kodixCarePermission`

```typescript
// Input Schema
input: z.object({
  dateStart: z.date(),
  dateEnd: z.date(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
})

// Output Schema
output: z.array(z.object({
  id: z.string(),
  teamId: z.string(),
  title: z.string(),
  description: z.string(),
  details: z.string(),
  date: z.date(),
  type: z.enum(['NORMAL', 'CRITICAL']),
  doneAt: z.date().nullable(),
  doneByUserId: z.string().nullable(),
  eventMasterId: z.string().nullable(),
  createdFromCalendar: z.boolean(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
}))

// Usage Example
const tasks = await api.kodixCare.careTask.getCareTasks.useQuery({
  dateStart: new Date('2025-07-01'),
  dateEnd: new Date('2025-07-31')
});
```

**Response Behavior**:
- Returns tasks sorted by date (descending), then by creation time (ascending)
- Automatically filters by current user's teamId
- Includes completion status and user attribution
- Supports pagination with limit/offset

---

### `careTask.createCareTask`

Create a new care task for the current team.

**Type**: `mutation`  
**Middleware**: `kodixCareInstalled`, `kodixCarePermission`

```typescript
// Input Schema
input: z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000),
  details: z.string().max(2000),
  date: z.date(),
  type: z.enum(['NORMAL', 'CRITICAL']),
  eventMasterId: z.string().optional() // For calendar integration
})

// Output Schema
output: CareTaskSchema

// Usage Example
const newTask = await api.kodixCare.careTask.createCareTask.mutate({
  title: "Morning Medication",
  description: "Administer morning medications",
  details: "Ensure patient takes all prescribed morning medications with water",
  date: new Date(),
  type: "CRITICAL"
});
```

**Business Logic**:
- Automatically sets `teamId` from session
- Sets `createdBy` to current user ID
- Generates unique `nanoid()` for task ID
- Sets `createdFromCalendar` to false for manual tasks

---

### `careTask.editCareTask`

Update an existing care task with team validation.

**Type**: `mutation`  
**Middleware**: `kodixCareInstalled`, `kodixCarePermission`

```typescript
// Input Schema
input: z.object({
  id: z.string(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  details: z.string().max(2000).optional(),
  date: z.date().optional(),
  type: z.enum(['NORMAL', 'CRITICAL']).optional()
})

// Output Schema
output: CareTaskSchema

// Usage Example
const updatedTask = await api.kodixCare.careTask.editCareTask.mutate({
  id: "task-123",
  title: "Updated Task Title",
  type: "NORMAL"
});
```

**Security**:
- Validates task belongs to user's team before update
- Returns 404 if task not found or not accessible
- Preserves audit fields (createdBy, createdAt)

---

### `careTask.deleteCareTask`

Delete a care task (ADMIN role required).

**Type**: `mutation`  
**Middleware**: `kodixCareInstalled`, `kodixCarePermission`  
**Permission**: ADMIN role only

```typescript
// Input Schema
input: z.object({
  id: z.string()
})

// Output Schema
output: z.object({
  success: z.boolean(),
  deletedId: z.string()
})

// Usage Example
const result = await api.kodixCare.careTask.deleteCareTask.mutate({
  id: "task-123"
});
```

**Permission Check**:
- Only users with ADMIN role can delete tasks
- Validates task exists and belongs to user's team
- Returns FORBIDDEN error for CAREGIVER role

---

### `careTask.completeCareTask`

Mark a care task as completed.

**Type**: `mutation`  
**Middleware**: `kodixCareInstalled`, `kodixCarePermission`

```typescript
// Input Schema
input: z.object({
  id: z.string()
})

// Output Schema
output: CareTaskSchema

// Usage Example
const completedTask = await api.kodixCare.careTask.completeCareTask.mutate({
  id: "task-123"
});
```

**Completion Logic**:
- Sets `doneAt` to current timestamp
- Sets `doneByUserId` to current user ID
- Validates task is not already completed
- Maintains audit trail of completion

---

### `careTask.syncCareTasksFromCalendar`

Sync care tasks from calendar events.

**Type**: `mutation`  
**Middleware**: `kodixCareInstalled`, `kodixCarePermission`

```typescript
// Input Schema
input: z.object({}) // No input required

// Output Schema
output: z.object({
  synced: z.number(),
  created: z.number(),
  updated: z.number()
})

// Usage Example
const syncResult = await api.kodixCare.careTask.syncCareTasksFromCalendar.mutate({});
```

**Sync Logic**:
- Fetches calendar events for the team
- Creates new tasks for new events
- Updates existing tasks for modified events
- Sets `createdFromCalendar` to true
- Uses `eventMasterId` for event linking

---

### `careTask.unlockMoreTasks`

Unlock tasks for a specific date (Progressive Task System).

**Type**: `mutation`  
**Middleware**: `kodixCareInstalled`, `kodixCarePermission`

```typescript
// Input Schema
input: z.object({
  selectedTimestamp: z.date()
})

// Output Schema
output: z.object({
  success: z.boolean(),
  unlockedUntil: z.date()
})

// Usage Example
const unlockResult = await api.kodixCare.careTask.unlockMoreTasks.mutate({
  selectedTimestamp: new Date('2025-07-15')
});
```

**Unlocking Logic**:
- Updates team configuration to allow tasks up to selected date
- Prevents completion of future tasks beyond unlocked date
- Maintains care workflow integrity

## 🗓️ Shift Management

### `getAllCareShifts`

Get all care shifts for the current team.

**Type**: `query`  
**Middleware**: `kodixCareInstalled`, `kodixCarePermission`

```typescript
// Input Schema
input: z.object({}) // No input required

// Output Schema
output: z.array(z.object({
  id: z.string(),
  caregiverId: z.string(),
  teamId: z.string(),
  startAt: z.date(),
  endAt: z.date(),
  checkIn: z.date().nullable(),
  checkOut: z.date().nullable(),
  notes: z.string().nullable(),
  createdById: z.string(),
  finishedByUserId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Populated relations
  caregiver: UserSchema,
  createdBy: UserSchema
}))

// Usage Example
const shifts = await api.kodixCare.getAllCareShifts.useQuery({});
```

**Response Details**:
- Returns all shifts for the team with caregiver information
- Includes check-in/check-out timestamps
- Sorted by start time (ascending)

---

### `createCareShift`

Create a new caregiver shift.

**Type**: `mutation`  
**Middleware**: `kodixCareInstalled`, `kodixCarePermission`

```typescript
// Input Schema
input: z.object({
  caregiverId: z.string(),
  startAt: z.date(),
  endAt: z.date(),
  notes: z.string().max(500).optional()
})

// Output Schema
output: CareShiftSchema

// Usage Example
const newShift = await api.kodixCare.createCareShift.mutate({
  caregiverId: "user-123",
  startAt: new Date('2025-07-15T08:00:00Z'),
  endAt: new Date('2025-07-15T16:00:00Z'),
  notes: "Morning shift with medication focus"
});
```

**Validation**:
- Validates caregiver belongs to team
- Ensures endAt is after startAt
- Checks for shift overlaps (optional business rule)

---

### `editCareShift`

Update an existing care shift.

**Type**: `mutation`  
**Middleware**: `kodixCareInstalled`, `kodixCarePermission`

```typescript
// Input Schema
input: z.object({
  id: z.string(),
  caregiverId: z.string().optional(),
  startAt: z.date().optional(),
  endAt: z.date().optional(),
  notes: z.string().max(500).optional(),
  checkIn: z.date().optional(),
  checkOut: z.date().optional()
})

// Output Schema
output: CareShiftSchema

// Usage Example
const updatedShift = await api.kodixCare.editCareShift.mutate({
  id: "shift-123",
  checkIn: new Date(), // Record check-in time
  notes: "Checked in on time"
});
```

**Update Logic**:
- Validates shift belongs to user's team
- Allows partial updates of shift fields
- Maintains audit trail of changes

---

### `deleteCareShift`

Delete a care shift (ADMIN role required).

**Type**: `mutation`  
**Middleware**: `kodixCareInstalled`, `kodixCarePermission`  
**Permission**: ADMIN role only

```typescript
// Input Schema
input: z.object({
  id: z.string()
})

// Output Schema
output: z.object({
  success: z.boolean(),
  deletedId: z.string()
})

// Usage Example
const result = await api.kodixCare.deleteCareShift.mutate({
  id: "shift-123"
});
```

## 👥 Configuration & Caregivers

### `getAllCaregivers`

Get all caregivers for the current team.

**Type**: `query`  
**Middleware**: `kodixCareInstalled`, `kodixCarePermission`

```typescript
// Input Schema
input: z.object({}) // No input required

// Output Schema
output: z.array(z.object({
  id: z.string(),
  userId: z.string(),
  teamId: z.string(),
  role: z.enum(['ADMIN', 'CAREGIVER']),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Populated user information
  user: UserSchema
}))

// Usage Example
const caregivers = await api.kodixCare.getAllCaregivers.useQuery({});
```

**Response Details**:
- Returns all caregivers with user information
- Includes role assignments (ADMIN vs CAREGIVER)
- Filtered by team for privacy

---

### `updateConfiguration`

Update team configuration for Kodix Care.

**Type**: `mutation`  
**Middleware**: `kodixCareInstalled`, `kodixCarePermission`  
**Permission**: ADMIN role only

```typescript
// Input Schema
input: z.object({
  patientName: z.string().min(2).max(50),
  clonedCareTasksUntil: z.date().optional()
})

// Output Schema
output: z.object({
  success: z.boolean(),
  config: KodixCareConfigSchema
})

// Usage Example
const configResult = await api.kodixCare.updateConfiguration.mutate({
  patientName: "John Doe",
  clonedCareTasksUntil: new Date('2025-08-01')
});
```

## 🔐 Authentication & Permissions

### Required Headers

```typescript
// All requests require authentication
headers: {
  'Authorization': 'Bearer <session-token>',
  'Content-Type': 'application/json'
}
```

### Permission Levels

| Endpoint | ADMIN | CAREGIVER |
|----------|-------|-----------|
| **View Tasks** | ✅ | ✅ |
| **Create Tasks** | ✅ | ✅ |
| **Complete Tasks** | ✅ | ✅ |
| **Edit Tasks** | ✅ | ✅ |
| **Delete Tasks** | ✅ | ❌ |
| **View Shifts** | ✅ | ✅ |
| **Create Shifts** | ✅ | ❌ |
| **Edit Shifts** | ✅ | Check-in/out only |
| **Delete Shifts** | ✅ | ❌ |
| **Configuration** | ✅ | ❌ |

### Error Responses

```typescript
// Standard error format
{
  error: {
    code: 'FORBIDDEN' | 'NOT_FOUND' | 'BAD_REQUEST' | 'INTERNAL_SERVER_ERROR',
    message: string,
    data?: {
      code?: string,
      httpStatus?: number,
      path?: string,
      stack?: string
    }
  }
}

// Common error codes
- 'FORBIDDEN': Insufficient permissions or app not installed
- 'NOT_FOUND': Resource not found or not accessible to team
- 'BAD_REQUEST': Invalid input or business logic violation
- 'UNAUTHORIZED': Authentication required
```

## 🔧 Usage Patterns

### React Query Integration

```typescript
// Frontend hook patterns
export function useCareTasksForDateRange(dateStart: Date, dateEnd: Date) {
  return api.kodixCare.careTask.getCareTasks.useQuery(
    { dateStart, dateEnd },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}

export function useCreateCareTask() {
  const utils = api.useUtils();
  
  return api.kodixCare.careTask.createCareTask.useMutation({
    onSuccess: () => {
      // Invalidate task queries to refetch data
      utils.kodixCare.careTask.getCareTasks.invalidate();
    },
  });
}
```

### Optimistic Updates

```typescript
// Optimistic task completion
const completeTaskMutation = api.kodixCare.careTask.completeCareTask.useMutation({
  onMutate: async (variables) => {
    // Cancel outgoing refetches
    await utils.kodixCare.careTask.getCareTasks.cancel();
    
    // Snapshot previous value
    const previousTasks = utils.kodixCare.careTask.getCareTasks.getData();
    
    // Optimistically update
    utils.kodixCare.careTask.getCareTasks.setData(queryKey, (old) =>
      old?.map((task) =>
        task.id === variables.id
          ? { ...task, doneAt: new Date(), doneByUserId: currentUserId }
          : task
      )
    );
    
    return { previousTasks };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    utils.kodixCare.careTask.getCareTasks.setData(queryKey, context?.previousTasks);
  }
});
```

<!-- AI-CONTEXT-BOUNDARY: end -->

---

**API Version**: v1.0  
**tRPC Version**: v11  
**Last Updated**: 2025-07-13