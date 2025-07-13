# Component Reference - Kodix Care Web

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

Complete reference for all React components in the Kodix Care Web SubApp, including props, usage patterns, and integration examples.

## 📋 Core Components

### DataTableKodixCare

**Purpose**: Main task management interface with advanced filtering, sorting, and CRUD operations.

**Location**: `apps/kdx/src/app/[locale]/(authed)/apps/kodixCare/components/DataTableKodixCare.tsx`

```typescript
interface DataTableKodixCareProps {
  className?: string;
}

// Usage
export default function TasksPage() {
  return (
    <div className="container mx-auto py-6">
      <DataTableKodixCare />
    </div>
  );
}
```

**Features**:
- Multi-select rows with bulk actions
- Column sorting and filtering
- Progressive task unlocking UI
- Real-time task completion
- Critical task highlighting
- Date-based task filtering

**Key Integrations**:
- TanStack Table for data management
- Zustand store for UI state
- TanStack Query for server state
- shadcn/ui components for UI

---

### ShiftsBigCalendar

**Purpose**: Interactive calendar interface for shift scheduling with drag-and-drop functionality.

**Location**: `apps/kdx/src/app/[locale]/(authed)/apps/kodixCare/components/ShiftsBigCalendar.tsx`

```typescript
interface ShiftsBigCalendarProps {
  className?: string;
}

// Usage
export default function ShiftsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Shift Management</h1>
      <ShiftsBigCalendar />
    </div>
  );
}
```

**Features**:
- Drag-and-drop shift scheduling
- Multiple calendar views (month, week, day)
- Caregiver color coding
- Shift overlap detection
- Real-time shift updates
- Responsive design for different screen sizes

**Dependencies**:
- React Big Calendar
- date-fns for date manipulation
- TanStack Query for data fetching
- Custom hooks for shift management

---

### KodixCareSideBar

**Purpose**: Navigation sidebar with care-specific navigation and status indicators.

**Location**: `apps/kdx/src/app/[locale]/(authed)/apps/kodixCare/components/KodixCareSideBar.tsx`

```typescript
interface KodixCareSideBarProps {
  className?: string;
}

// Usage (automatically included in layout)
export default function KodixCareLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <KodixCareSideBar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

**Navigation Items**:
- **Main**: Task management dashboard
- **Shifts**: Calendar-based shift management
- **Settings**: User preferences and configuration

**Features**:
- Active route highlighting
- Responsive collapse on mobile
- Healthcare-themed icons
- Integration with Next.js App Router

## 🚀 Task Management Components

### CreateCareTaskCredenza

**Purpose**: Modal dialog for creating new care tasks with comprehensive form validation.

```typescript
interface CreateCareTaskCredenzaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
}

// Usage
function TaskCreateButton() {
  const [showCreate, setShowCreate] = useState(false);
  
  return (
    <>
      <Button onClick={() => setShowCreate(true)}>
        Create Task
      </Button>
      <CreateCareTaskCredenza
        open={showCreate}
        onOpenChange={setShowCreate}
        defaultDate={new Date()}
      />
    </>
  );
}
```

**Form Fields**:
- **Title**: Required, 1-255 characters
- **Description**: Optional, up to 1000 characters
- **Details**: Optional, up to 2000 characters
- **Date**: Required, date picker with validation
- **Type**: Normal or Critical priority level

**Validation**: Uses Zod schema validation with real-time feedback

---

### EditCareTaskCredenza

**Purpose**: Modal dialog for editing existing care tasks.

```typescript
interface EditCareTaskCredenzaProps {
  task: CareTask;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Usage with store integration
function TaskEditButton({ task }: { task: CareTask }) {
  const store = useCareTaskStore();
  const isEditing = store.currentlyEditing === task.id;
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => store.setCurrentlyEditing(task.id)}
      >
        Edit
      </Button>
      <EditCareTaskCredenza
        task={task}
        open={isEditing}
        onOpenChange={() => store.setCurrentlyEditing(undefined)}
      />
    </>
  );
}
```

**Features**:
- Pre-populated form fields
- Optimistic updates
- Real-time validation
- Change tracking and confirmation

---

### TaskCompletionButton

**Purpose**: Interactive button for marking tasks as complete with visual feedback.

```typescript
interface TaskCompletionButtonProps {
  task: CareTask;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

// Usage
function TaskRow({ task }: { task: CareTask }) {
  return (
    <div className="flex items-center justify-between">
      <span>{task.title}</span>
      <TaskCompletionButton task={task} size="sm" />
    </div>
  );
}
```

**States**:
- **Pending**: Shows "Complete" button
- **Loading**: Shows spinner during API call
- **Completed**: Shows completion timestamp and user

**Features**:
- Optimistic updates for immediate feedback
- Error handling with rollback
- Accessibility support with ARIA labels

---

### UnlockMoreTasksCredenza

**Purpose**: Modal for progressive task unlocking system.

```typescript
interface UnlockMoreTasksCredenzaProps {
  selectedDate: Date | false;
  onClose: () => void;
}

// Usage with store
function useTaskUnlocking() {
  const store = useCareTaskStore();
  
  return {
    selectedDate: store.unlockMoreTasksCredenzaWithDateOpen,
    onClose: () => store.setUnlockMoreTasksCredenzaWithDateOpen(false)
  };
}
```

**Workflow**:
1. User clicks "Unlock More Tasks" button
2. Date selection modal appears
3. User confirms date selection
4. Tasks up to selected date become available
5. UI updates to reflect new task availability

## 📅 Calendar Components

### ShiftCreateModal

**Purpose**: Modal for creating new caregiver shifts with validation.

```typescript
interface ShiftCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStart?: Date;
  defaultEnd?: Date;
}

// Usage
function CalendarSlotHandler() {
  const [createShift, setCreateShift] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setCreateShift({ start, end });
  };
  
  return (
    <ShiftCreateModal
      open={!!createShift}
      onOpenChange={() => setCreateShift(null)}
      defaultStart={createShift?.start}
      defaultEnd={createShift?.end}
    />
  );
}
```

**Form Fields**:
- **Caregiver**: Dropdown selection from team caregivers
- **Start Time**: Date and time picker
- **End Time**: Date and time picker with validation
- **Notes**: Optional shift notes

**Validation**:
- End time must be after start time
- No overlapping shifts for same caregiver
- Valid caregiver selection required

---

### ShiftEditModal

**Purpose**: Modal for editing existing shifts with check-in/check-out functionality.

```typescript
interface ShiftEditModalProps {
  shift: CareShift;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Features**:
- All create fields available for editing
- Check-in/check-out timestamp recording
- Shift completion tracking
- Notes updating for shift reports

---

### CaregiverColorLegend

**Purpose**: Visual legend showing caregiver color assignments in calendar.

```typescript
interface CaregiverColorLegendProps {
  caregivers: Caregiver[];
  className?: string;
}

// Usage
function CalendarHeader() {
  const { data: caregivers = [] } = api.kodixCare.getAllCaregivers.useQuery();
  
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-2">Shift Calendar</h2>
      <CaregiverColorLegend caregivers={caregivers} />
    </div>
  );
}
```

**Features**:
- Consistent color assignment algorithm
- Accessible color combinations
- Responsive layout for different screen sizes

## ⚙️ Settings Components

### PatientConfigurationForm

**Purpose**: Form for configuring patient information and care settings.

```typescript
interface PatientConfigurationFormProps {
  initialConfig?: KodixCareConfig;
  onSave?: (config: KodixCareConfig) => void;
}

// Usage
function SettingsPage() {
  const { data: config } = api.kodixCare.getConfiguration.useQuery();
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Care Settings</h1>
      <PatientConfigurationForm initialConfig={config} />
    </div>
  );
}
```

**Configuration Fields**:
- **Patient Name**: 2-50 characters, no numbers allowed
- **Task Unlock Date**: Progressive unlocking configuration
- **Notification Preferences**: Critical task alert settings

**Validation**:
- Patient name format validation
- Date range validation for task unlocking
- Healthcare compliance checks

---

### NotificationPreferences

**Purpose**: Component for managing critical task notification settings.

```typescript
interface NotificationPreferencesProps {
  userId: string;
  teamId: string;
}
```

**Settings**:
- **Email Notifications**: Enable/disable email alerts
- **Critical Task Delays**: Notification timing preferences
- **Shift Reminders**: Upcoming shift notifications
- **Task Completion**: Confirmation notifications

## 🎨 UI Utility Components

### CareTaskSkeleton

**Purpose**: Loading skeleton for task list items.

```typescript
interface CareTaskSkeletonProps {
  count?: number;
  className?: string;
}

// Usage
function TaskList() {
  const { data: tasks, isLoading } = api.kodixCare.careTask.getCareTasks.useQuery();
  
  if (isLoading) {
    return <CareTaskSkeleton count={5} />;
  }
  
  return (
    <div>
      {tasks?.map(task => <TaskCard key={task.id} task={task} />)}
    </div>
  );
}
```

---

### CriticalTaskBadge

**Purpose**: Visual indicator for critical tasks with status awareness.

```typescript
interface CriticalTaskBadgeProps {
  task: CareTask;
  showOverdue?: boolean;
}

// Usage
function TaskListItem({ task }: { task: CareTask }) {
  return (
    <div className="flex items-center gap-2">
      <CriticalTaskBadge task={task} showOverdue />
      <span>{task.title}</span>
    </div>
  );
}
```

**Badge States**:
- **Critical**: Red badge for critical tasks
- **Overdue**: Red with alert icon for overdue critical tasks
- **Completed**: Green badge for completed critical tasks

---

### DateRangeSelector

**Purpose**: Date range picker for filtering tasks and shifts.

```typescript
interface DateRangeSelectorProps {
  value: {
    start: Date;
    end: Date;
  };
  onChange: (range: { start: Date; end: Date }) => void;
  maxDays?: number;
}

// Usage with store
function TaskFilters() {
  const store = useCareTaskStore();
  
  return (
    <DateRangeSelector
      value={store.input}
      onChange={store.setInput}
      maxDays={90}
    />
  );
}
```

**Features**:
- Preset ranges (Today, This Week, This Month)
- Custom date selection
- Validation for maximum range
- Keyboard navigation support

## 🔧 Hook Components

### useCareTaskStore

**Purpose**: Zustand store hook for task management state.

```typescript
interface CareTaskStore {
  input: {
    dateStart: Date;
    dateEnd: Date;
  };
  editDetailsOpen: boolean;
  currentlyEditing: string | undefined;
  unlockMoreTasksCredenzaWithDateOpen: Date | false;
  
  setInput: (input: Partial<CareTaskStore['input']>) => void;
  setEditDetailsOpen: (open: boolean) => void;
  setCurrentlyEditing: (taskId: string | undefined) => void;
  setUnlockMoreTasksCredenzaWithDateOpen: (date: Date | false) => void;
}

// Usage
function TaskComponent() {
  const store = useCareTaskStore();
  
  // Access state
  const { dateStart, dateEnd } = store.input;
  const isEditingTask = store.currentlyEditing;
  
  // Update state
  const handleDateChange = (start: Date, end: Date) => {
    store.setInput({ dateStart: start, dateEnd: end });
  };
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

### useOptimisticTaskUpdate

**Purpose**: Custom hook for optimistic task updates with error handling.

```typescript
function useOptimisticTaskUpdate() {
  const utils = api.useUtils();
  
  return api.kodixCare.careTask.completeCareTask.useMutation({
    onMutate: async (variables) => {
      // Optimistic update logic
      await utils.kodixCare.careTask.getCareTasks.cancel();
      const previous = utils.kodixCare.careTask.getCareTasks.getData();
      
      utils.kodixCare.careTask.getCareTasks.setData(undefined, (old) =>
        old?.map((task) =>
          task.id === variables.id
            ? { ...task, doneAt: new Date() }
            : task
        )
      );
      
      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      utils.kodixCare.careTask.getCareTasks.setData(undefined, context?.previous);
      toast.error('Failed to complete task');
    },
    onSuccess: () => {
      toast.success('Task completed successfully');
    }
  });
}
```

## 📱 Responsive Patterns

### Mobile-First Components

All components are designed with mobile-first responsive patterns:

```typescript
// Example responsive component structure
export function ResponsiveTaskCard({ task }: { task: CareTask }) {
  return (
    <Card className="p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{task.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-1">
            {task.description}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:flex-col sm:items-end">
          <CriticalTaskBadge task={task} />
          <TaskCompletionButton task={task} size="sm" />
        </div>
      </div>
    </Card>
  );
}
```

### Breakpoint Usage

```css
/* Tailwind breakpoints used throughout components */
sm: 640px   /* Tablet portrait */
md: 768px   /* Tablet landscape */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

<!-- AI-CONTEXT-BOUNDARY: end -->

---

**Component Library**: React 18 with TypeScript  
**UI Framework**: shadcn/ui with Tailwind CSS  
**Last Updated**: 2025-07-13