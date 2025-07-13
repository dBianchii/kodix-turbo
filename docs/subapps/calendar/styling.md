# Calendar SubApp - Styling Documentation

<!-- AI-METADATA:
category: design
complexity: basic
updated: 2025-07-13
claude-ready: true
priority: low
token-optimized: true
audience: developers
ai-context-weight: low
-->

<!-- AI-CONTEXT-BOUNDARY: start -->

## 🔍 Overview

The Calendar SubApp follows **Kodix Design System principles** with Tailwind CSS utilities and shadcn/ui components for consistent, accessible, and responsive design.

**Design Approach**: Mobile-first responsive design with touch-friendly interactions and semantic color usage.

## 🎨 Design System Integration

### Core Technologies

```typescript
// Styling stack
const stylingStack = {
  "CSS Framework": "Tailwind CSS v3.4",
  "Component Library": "shadcn/ui",
  "Icons": "Lucide React",
  "Fonts": "Geist Sans (Primary), Geist Mono (Code)",
  "Theme System": "CSS Variables with dark/light mode",
  "Responsive": "Mobile-first breakpoints"
};
```

### Color Palette Usage

```css
/* Calendar-specific color variables */
:root {
  /* Event type colors */
  --calendar-normal: hsl(var(--primary));
  --calendar-critical: hsl(var(--destructive));
  --calendar-exception: hsl(var(--warning));
  
  /* State colors */
  --calendar-past: hsl(var(--muted));
  --calendar-today: hsl(var(--accent));
  --calendar-future: hsl(var(--foreground));
  
  /* Interactive states */
  --calendar-hover: hsl(var(--accent) / 0.1);
  --calendar-selected: hsl(var(--primary) / 0.1);
}
```

### Typography Scale

```typescript
// Calendar typography classes
const typographyScale = {
  "Calendar Title": "text-2xl font-semibold tracking-tight",
  "Event Title": "text-sm font-medium",
  "Event Description": "text-xs text-muted-foreground",
  "Date Display": "text-lg font-medium",
  "Time Display": "text-sm text-muted-foreground",
  "Table Headers": "text-xs font-medium uppercase tracking-wide",
  "Form Labels": "text-sm font-medium",
  "Helper Text": "text-xs text-muted-foreground"
};
```

## 📱 Responsive Design

### Breakpoint Strategy

```css
/* Tailwind breakpoints for calendar */
.calendar-responsive {
  /* Mobile: Single column, card-based layout */
  @apply flex flex-col gap-2;
  
  /* Tablet: Compact table with essential columns */
  @media (min-width: 768px) {
    @apply grid;
  }
  
  /* Desktop: Full table with all columns */
  @media (min-width: 1024px) {
    @apply table;
  }
  
  /* Large Desktop: Wider spacing, more content per row */
  @media (min-width: 1440px) {
    @apply gap-4;
  }
}
```

### Mobile Layout Components

```typescript
// Mobile event card styling
function MobileEventCard({ event }: { event: CalendarEvent }) {
  return (
    <Card className={cn(
      "p-4 transition-colors",
      "hover:bg-accent/50",
      "active:bg-accent",
      "touch-manipulation", // Optimize for touch
      event.type === 'CRITICAL' && "border-destructive/20"
    )}>
      <div className="flex items-start justify-between gap-3">
        {/* Event content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            {event.type === 'CRITICAL' && (
              <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
            )}
            <h3 className="font-medium text-sm truncate">{event.title}</h3>
          </div>
          
          <p className="text-xs text-muted-foreground">
            {format(event.dateStart, 'h:mm a')}
          </p>
          
          {event.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          )}
        </div>
        
        {/* Touch-friendly action button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 flex-shrink-0 touch-manipulation"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
```

### Desktop Table Styling

```typescript
// Desktop table with proper spacing and alignment
function DesktopEventTable({ events }: { events: CalendarEvent[] }) {
  return (
    <Table className="min-w-full">
      <TableHeader>
        <TableRow className="hover:bg-transparent border-b">
          <TableHead className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
            Event
          </TableHead>
          <TableHead className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
            Time
          </TableHead>
          <TableHead className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
            Type
          </TableHead>
          <TableHead className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow
            key={event.id}
            className={cn(
              "border-b transition-colors",
              "hover:bg-muted/50",
              "data-[state=selected]:bg-muted"
            )}
          >
            <TableCell className="p-4">
              <EventTitleCell event={event} />
            </TableCell>
            <TableCell className="p-4">
              <EventTimeCell event={event} />
            </TableCell>
            <TableCell className="p-4">
              <EventTypeCell event={event} />
            </TableCell>
            <TableCell className="p-4 text-right">
              <EventActionsCell event={event} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## 🎯 Component Styling Patterns

### Event Type Indicators

```typescript
// Consistent event type styling across components
function EventTypeIndicator({ type }: { type: 'NORMAL' | 'CRITICAL' }) {
  const variants = {
    NORMAL: {
      icon: Calendar,
      className: "text-primary",
      label: "Normal"
    },
    CRITICAL: {
      icon: AlertTriangle,
      className: "text-destructive",
      label: "Critical"
    }
  };
  
  const variant = variants[type];
  const Icon = variant.icon;
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
      type === 'CRITICAL' 
        ? "bg-destructive/10 text-destructive" 
        : "bg-primary/10 text-primary"
    )}>
      <Icon className="h-3 w-3" />
      {variant.label}
    </div>
  );
}
```

### Date Navigation Controls

```typescript
// Clean, accessible date navigation styling
function DateNavigationControls({ 
  selectedDate, 
  onDateChange 
}: {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {/* Previous day button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDateChange(subDays(selectedDate, 1))}
        className={cn(
          "h-9 w-9 p-0",
          "hover:bg-accent",
          "focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous day</span>
      </Button>
      
      {/* Date picker trigger */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "min-w-[200px] justify-start text-left font-normal",
              "hover:bg-accent",
              "focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(selectedDate, 'PPP')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateChange(date)}
            initialFocus
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>
      
      {/* Next day button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDateChange(addDays(selectedDate, 1))}
        className={cn(
          "h-9 w-9 p-0",
          "hover:bg-accent",
          "focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next day</span>
      </Button>
      
      {/* Today button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDateChange(new Date())}
        className={cn(
          "h-9 px-3",
          "hover:bg-accent",
          "focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        Today
      </Button>
    </div>
  );
}
```

### Form Styling

```typescript
// Consistent form component styling
function EventForm({ 
  form, 
  onSubmit 
}: { 
  form: UseFormReturn<CreateEventInput>;
  onSubmit: (data: CreateEventInput) => void;
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Event Title
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter event title..."
                  {...field}
                  className={cn(
                    "h-10",
                    "focus-visible:ring-2 focus-visible:ring-ring",
                    "placeholder:text-muted-foreground"
                  )}
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />
        
        {/* Description field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Description
                <span className="text-muted-foreground font-normal ml-1">
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add event description..."
                  {...field}
                  className={cn(
                    "min-h-[80px] resize-none",
                    "focus-visible:ring-2 focus-visible:ring-ring",
                    "placeholder:text-muted-foreground"
                  )}
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />
        
        {/* Submit button */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" className="min-w-[100px]">
            Create Event
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

## 🎨 Modal and Dialog Styling

### Dialog Container Styling

```typescript
// Consistent dialog appearance across all modals
function CalendarDialog({ 
  children, 
  title, 
  description, 
  open, 
  onOpenChange 
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "sm:max-w-[600px]",
        "max-h-[90vh] overflow-auto",
        "gap-6"
      )}>
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="space-y-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Confirmation Dialog Styling

```typescript
// Destructive action confirmation styling
function CancelEventDialog({ 
  event, 
  open, 
  onOpenChange 
}: {
  event: CalendarEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Cancel Event
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            Are you sure you want to cancel <strong>"{event.title}"</strong>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="h-9">
            Keep Event
          </AlertDialogCancel>
          <AlertDialogAction 
            className={cn(
              "h-9 bg-destructive text-destructive-foreground",
              "hover:bg-destructive/90"
            )}
          >
            Cancel Event
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

## 📐 Layout and Spacing

### Container Layout

```css
/* Calendar page container */
.calendar-container {
  @apply flex h-full flex-col gap-4 p-4;
  
  /* Ensure proper spacing on different screen sizes */
  @screen sm {
    @apply gap-6 p-6;
  }
  
  @screen lg {
    @apply gap-8 p-8;
  }
}

/* Calendar header */
.calendar-header {
  @apply flex items-center justify-between gap-4;
  
  /* Stack on mobile */
  @screen max-sm {
    @apply flex-col items-start gap-3;
  }
}

/* Calendar content area */
.calendar-content {
  @apply flex-1 overflow-hidden;
}
```

### Grid and Flexbox Patterns

```typescript
// Responsive grid layout for calendar controls
function CalendarControls() {
  return (
    <div className={cn(
      "grid gap-4",
      "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      "items-center"
    )}>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Date Range</Label>
        <DateNavigationControls />
      </div>
      
      <div className="space-y-2">
        <Label className="text-sm font-medium">Quick Actions</Label>
        <div className="flex gap-2">
          <CreateEventButton />
          <QuickFilterButton />
        </div>
      </div>
      
      <div className="space-y-2 sm:col-span-2 lg:col-span-2">
        <Label className="text-sm font-medium">Search</Label>
        <SearchEventInput />
      </div>
    </div>
  );
}
```

## 🎯 Interactive States

### Button States

```css
/* Custom button variants for calendar actions */
.calendar-button {
  @apply inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors;
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring;
  @apply disabled:pointer-events-none disabled:opacity-50;
  
  /* Size variants */
  &.size-sm {
    @apply h-8 px-3 text-xs;
  }
  
  &.size-default {
    @apply h-9 px-4 py-2;
  }
  
  &.size-lg {
    @apply h-10 px-8;
  }
  
  /* Calendar-specific variants */
  &.variant-calendar-primary {
    @apply bg-primary text-primary-foreground hover:bg-primary/90;
  }
  
  &.variant-calendar-critical {
    @apply bg-destructive text-destructive-foreground hover:bg-destructive/90;
  }
  
  &.variant-calendar-ghost {
    @apply hover:bg-accent hover:text-accent-foreground;
  }
}
```

### Hover and Focus States

```typescript
// Consistent interactive states across calendar components
const interactiveStyles = {
  hover: "hover:bg-accent/50 transition-colors duration-150",
  focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  active: "active:bg-accent data-[state=open]:bg-accent",
  disabled: "disabled:pointer-events-none disabled:opacity-50"
};

// Apply to table rows
function EventTableRow({ event }: { event: CalendarEvent }) {
  return (
    <TableRow className={cn(
      "border-b cursor-pointer",
      interactiveStyles.hover,
      interactiveStyles.focus,
      interactiveStyles.active
    )}>
      {/* Row content */}
    </TableRow>
  );
}
```

## 🌗 Dark Mode Support

### Theme-Aware Styling

```css
/* Calendar-specific dark mode adjustments */
[data-theme="dark"] {
  .calendar-event-card {
    @apply bg-card border-border;
  }
  
  .calendar-critical-event {
    @apply bg-destructive/10 border-destructive/20;
  }
  
  .calendar-past-event {
    @apply opacity-60;
  }
  
  .calendar-today-indicator {
    @apply bg-accent border-accent-foreground/20;
  }
}

/* Light mode specific overrides */
[data-theme="light"] {
  .calendar-event-card {
    @apply bg-white border-gray-200;
  }
  
  .calendar-critical-event {
    @apply bg-red-50 border-red-200;
  }
}
```

### Theme Toggle Integration

```typescript
// Theme-aware calendar components
function ThemeAwareCalendar() {
  const { theme } = useTheme();
  
  return (
    <div className={cn(
      "calendar-container",
      theme === 'dark' && "dark:bg-background",
      theme === 'light' && "bg-white"
    )}>
      {/* Calendar content */}
    </div>
  );
}
```

## ⚡ Performance Optimizations

### CSS Optimization

```css
/* Optimize animations and transitions */
.calendar-animation {
  /* Use transform instead of changing layout properties */
  @apply transform transition-transform duration-200 ease-in-out;
  
  /* Prefer opacity changes over display changes */
  @apply transition-opacity duration-150;
  
  /* Enable hardware acceleration for smooth animations */
  will-change: transform, opacity;
}

/* Optimize for large lists */
.calendar-virtual-item {
  /* Contain layout recalculations */
  contain: layout style paint;
  
  /* Use transform for positioning */
  @apply absolute inset-x-0;
}
```

### Component Optimization

```typescript
// Memoized styled components for performance
const MemoizedEventCard = memo(function EventCard({ 
  event 
}: { 
  event: CalendarEvent 
}) {
  return (
    <Card className={cn(
      "p-4 transition-colors",
      "hover:bg-accent/50",
      event.type === 'CRITICAL' && "border-destructive/20"
    )}>
      {/* Card content */}
    </Card>
  );
});

// Use CSS modules for critical path styles
import styles from './calendar.module.css';

function OptimizedCalendar() {
  return (
    <div className={styles.calendarContainer}>
      {/* Content */}
    </div>
  );
}
```

## 📱 Touch and Accessibility

### Touch-Friendly Design

```css
/* Touch target optimization */
.calendar-touch-target {
  /* Minimum 44px touch target for accessibility */
  @apply min-h-[44px] min-w-[44px];
  
  /* Add touch-action for better gesture support */
  touch-action: manipulation;
  
  /* Improve touch feedback */
  @apply active:scale-95 transition-transform duration-100;
}

/* Swipe gesture support */
.calendar-swipeable {
  touch-action: pan-y; /* Allow vertical scroll, enable horizontal swipes */
  
  &.swiping {
    @apply transition-transform duration-200 ease-out;
  }
}
```

### Accessibility Enhancements

```typescript
// Screen reader friendly calendar components
function AccessibleEventTable({ events }: { events: CalendarEvent[] }) {
  return (
    <Table role="table" aria-label="Calendar events">
      <TableHeader>
        <TableRow role="row">
          <TableHead role="columnheader" aria-sort="none">
            Event Title
          </TableHead>
          <TableHead role="columnheader" aria-sort="ascending">
            Date & Time
          </TableHead>
          <TableHead role="columnheader">
            Type
          </TableHead>
          <TableHead role="columnheader">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event, index) => (
          <TableRow key={event.id} role="row">
            <TableCell role="gridcell">
              <span className="sr-only">Event:</span>
              {event.title}
            </TableCell>
            <TableCell role="gridcell">
              <time dateTime={event.dateStart.toISOString()}>
                {format(event.dateStart, 'PPp')}
              </time>
            </TableCell>
            <TableCell role="gridcell">
              <EventTypeIndicator type={event.type} />
            </TableCell>
            <TableCell role="gridcell">
              <EventActions event={event} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

<!-- AI-CONTEXT-BOUNDARY: end -->

---

**Design System**: Kodix UI with shadcn/ui components  
**CSS Framework**: Tailwind CSS v3.4  
**Last Updated**: 2025-07-13