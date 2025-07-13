# Calendar SubApp - Routes Documentation

<!-- AI-METADATA:
category: reference
complexity: basic
updated: 2025-07-13
claude-ready: true
priority: medium
token-optimized: true
audience: developers
ai-context-weight: medium
-->

<!-- AI-CONTEXT-BOUNDARY: start -->

## 🔍 Overview

The Calendar SubApp follows a **single-page application architecture** with modal-based interactions. All functionality is accessible through the main calendar route with client-side state management for different views and actions.

## 📍 Route Structure

### Primary Route

```
/[locale]/(authed)/apps/calendar
```

**File Location**: `apps/kdx/src/app/[locale]/(authed)/apps/calendar/page.tsx`

**Route Type**: Server Component (Static Layout) + Client Component (Interactive Features)

**Purpose**: Main calendar interface with event management capabilities

### Route Breakdown

#### Locale Parameter
- **Parameter**: `[locale]`
- **Type**: Dynamic route segment
- **Examples**: `en`, `pt-BR`, `es`
- **Purpose**: Internationalization support via next-intl
- **Validation**: Must match configured locales in Kodix platform

#### Authentication Group
- **Group**: `(authed)`
- **Purpose**: Ensures user authentication before calendar access
- **Middleware**: Platform authentication middleware
- **Redirect**: Unauthenticated users redirected to login

#### App Namespace
- **Path**: `apps/calendar`
- **Purpose**: SubApp identification within Kodix platform
- **Context**: Provides app-specific context and permissions

## 🏗️ Component Architecture

### Server Component Structure

```typescript
// apps/kdx/src/app/[locale]/(authed)/apps/calendar/page.tsx
export default async function CalendarPage() {
  return (
    <div className="flex h-full flex-col gap-4">
      {/* Static header with app branding */}
      <div className="flex items-center gap-2">
        <IconKodixApp size="sm" />
        <CreateEventDialogButton />
      </div>
      
      {/* Interactive calendar component */}
      <DataTableCalendar />
    </div>
  );
}
```

**Server Component Responsibilities**:
- Static layout rendering
- App icon and branding display
- Initial page structure
- Client component hydration preparation

### Client Component Integration

```typescript
// _components/data-table-calendar.tsx
"use client";

export function DataTableCalendar() {
  // All interactive functionality handled in client component
  return (
    <div className="space-y-4">
      <DateNavigationControls />
      <EventDataTable />
      <EventModals />
    </div>
  );
}
```

## 🚀 Navigation Patterns

### URL State Management

The Calendar SubApp uses **client-side state management** instead of URL parameters for state persistence:

```typescript
// State managed in React components, not URL
interface CalendarState {
  selectedDate: Date;           // Current viewing date
  showCreateDialog: boolean;    // Create event modal state
  editingEvent: Event | null;   // Event being edited
  cancelingEvent: Event | null; // Event being cancelled
}

// Navigation through date selection
function navigateToDate(date: Date) {
  setSelectedDate(date);
  // Triggers API call for new date
  // No URL change required
}
```

**Benefits of Client-Side State**:
- Faster navigation (no page reloads)
- Smooth transitions between dates
- Maintains form state during navigation
- Optimistic updates for better UX

### Deep Linking Considerations

While the current implementation uses client-side state, **future deep linking** could be implemented:

```typescript
// Future URL structure for deep linking
const futureRoutes = {
  "/apps/calendar": "Today's events",
  "/apps/calendar?date=2025-07-15": "Specific date",
  "/apps/calendar?date=2025-07-15&event=evt_123": "Specific event focus",
  "/apps/calendar?view=week": "Week view (future feature)",
  "/apps/calendar?filter=critical": "Filtered view (future feature)"
};

// URL state synchronization (potential future implementation)
function useURLState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const selectedDate = useMemo(() => {
    const dateParam = searchParams.get('date');
    return dateParam ? new Date(dateParam) : new Date();
  }, [searchParams]);
  
  const updateURL = useCallback((date: Date) => {
    const params = new URLSearchParams(searchParams);
    params.set('date', format(date, 'yyyy-MM-dd'));
    router.push(`/apps/calendar?${params.toString()}`);
  }, [searchParams, router]);
  
  return { selectedDate, updateURL };
}
```

## 🔐 Route Protection

### Authentication Requirements

```typescript
// Route is protected by (authed) group
// Middleware chain:
// 1. next-intl locale detection
// 2. Platform authentication check
// 3. Session validation
// 4. Team context establishment

export const middleware = createMiddleware({
  locales: ['en', 'pt-BR'],
  defaultLocale: 'en',
  // Authentication middleware applied to (authed) routes
});
```

### App Installation Validation

```typescript
// Calendar-specific access validation
// Performed in tRPC procedures, not route level
export const calendarProcedure = protectedProcedure
  .use(async ({ ctx, next }) => {
    // Check if calendar app is installed for user's team
    const installation = await getAppInstallation(
      ctx.session.user.activeTeamId,
      'calendar'
    );
    
    if (!installation) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Calendar app not installed for this team'
      });
    }
    
    return next();
  });
```

## 📱 Mobile Route Behavior

### Responsive Route Handling

The calendar route **adapts to different screen sizes** without separate mobile routes:

```typescript
// Same route, different rendering based on viewport
function ResponsiveCalendarLayout() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  if (isMobile) {
    return <MobileCalendarView />;
  }
  
  return <DesktopCalendarView />;
}
```

### Touch Navigation

```typescript
// Mobile-specific navigation enhancements
function useTouchNavigation() {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const minSwipeDistance = 50;
  
  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      // Navigate to next day
      setSelectedDate(date => addDays(date, 1));
    }
    
    if (isRightSwipe) {
      // Navigate to previous day
      setSelectedDate(date => subDays(date, 1));
    }
  };
  
  return { onTouchStart, onTouchMove, onTouchEnd };
}
```

## 🔄 Route Transitions

### Page Transitions

Since the calendar is a **single-page application**, transitions happen through:

1. **Component State Changes**: Modal appearances/disappearances
2. **Data Loading States**: Skeleton screens during API calls
3. **Optimistic Updates**: Immediate UI feedback
4. **Error States**: Error boundaries and fallback UI

```typescript
// Transition states in calendar
interface TransitionStates {
  loading: boolean;           // Data fetching state
  creating: boolean;          // Event creation state
  editing: boolean;           // Event editing state
  cancelling: boolean;        // Event cancellation state
  error: Error | null;        // Error state
}

// Smooth transitions with loading states
function CalendarWithTransitions() {
  const { data: events, isLoading } = useCalendarEvents(selectedDate);
  
  if (isLoading) {
    return <CalendarSkeleton />;
  }
  
  return (
    <div className="transition-opacity duration-200">
      <EventTable events={events} />
    </div>
  );
}
```

### Modal Route Patterns

```typescript
// Modal state management without route changes
function useModalRouting() {
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  
  const openModal = (type: ModalType, data?: any) => {
    setActiveModal(type);
    // Could potentially update URL for deep linking
    // history.pushState({ modal: type }, '', location.href);
  };
  
  const closeModal = () => {
    setActiveModal(null);
    // Could restore URL state
    // history.back();
  };
  
  return { activeModal, openModal, closeModal };
}
```

## 🧭 Navigation Integration

### Platform Navigation

The calendar integrates with **Kodix platform navigation**:

```typescript
// Breadcrumb integration
function CalendarBreadcrumbs() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/apps">Apps</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Calendar</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
```

### Cross-SubApp Navigation

```typescript
// Navigation to related SubApps
function CrossAppNavigation() {
  const router = useRouter();
  
  const navigateToKodixCare = (eventId: string) => {
    // Navigate to Kodix Care with calendar event context
    router.push(`/apps/kodixCare?eventId=${eventId}`);
  };
  
  const navigateToTodo = (eventTitle: string) => {
    // Create todo from calendar event
    router.push(`/apps/todo?title=${encodeURIComponent(eventTitle)}`);
  };
  
  return { navigateToKodixCare, navigateToTodo };
}
```

## 🔧 Route Configuration

### Next.js App Router Setup

```typescript
// Route configuration in Next.js App Router
const routeConfig = {
  // File-based routing structure
  path: "apps/kdx/src/app/[locale]/(authed)/apps/calendar/page.tsx",
  
  // Route groups
  groups: ["(authed)"],
  
  // Dynamic segments
  segments: ["[locale]"],
  
  // Middleware application
  middleware: ["locale", "auth", "team-context"],
  
  // Component type
  type: "server-component"
};
```

### Route Metadata

```typescript
// Metadata for SEO and platform integration
export const metadata: Metadata = {
  title: "Calendar | Kodix",
  description: "Manage events and schedules with advanced recurrence patterns",
  robots: {
    index: false, // Internal app, no SEO indexing
    follow: false
  }
};

// Dynamic metadata based on locale
export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return {
    title: params.locale === 'pt-BR' ? "Calendário | Kodix" : "Calendar | Kodix",
    description: params.locale === 'pt-BR' 
      ? "Gerencie eventos e horários com padrões de recorrência avançados"
      : "Manage events and schedules with advanced recurrence patterns"
  };
}
```

## 📊 Route Analytics

### Performance Monitoring

```typescript
// Route performance tracking
function useRouteAnalytics() {
  useEffect(() => {
    // Track page load time
    const startTime = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime;
      
      // Send analytics
      analytics.track('calendar_page_load', {
        loadTime,
        locale: params.locale,
        teamId: session.user.activeTeamId
      });
    };
  }, []);
  
  // Track user interactions
  const trackNavigation = (action: string, data?: any) => {
    analytics.track('calendar_navigation', {
      action,
      data,
      timestamp: new Date().toISOString()
    });
  };
  
  return { trackNavigation };
}
```

### Route Health Monitoring

```typescript
// Monitor route health and errors
function RouteHealthMonitor() {
  useEffect(() => {
    const errorHandler = (error: Error) => {
      // Log route-specific errors
      logger.error('Calendar route error', {
        error: error.message,
        stack: error.stack,
        route: '/apps/calendar',
        userAgent: navigator.userAgent
      });
    };
    
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);
}
```

<!-- AI-CONTEXT-BOUNDARY: end -->

---

**Route Pattern**: Single Page Application with Modal Interactions  
**Framework**: Next.js 14 App Router  
**Last Updated**: 2025-07-13