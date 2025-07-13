<!-- AI-METADATA:
category: context-pattern
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
# SubApp Context Patterns

> Specialized context templates for working with Kodix SubApp architecture

## 🎯 Purpose

Provide AI assistants with precise context for SubApp development, ensuring consistent implementation across all modular features.

## 🏗️ SubApp Architecture Context

### Core SubApp Structure

```markdown
You are implementing a SubApp in the Kodix platform. SubApps are modular, self-contained features that operate within the shared Kodix runtime.

**SubApp Principles**:
1. **Isolation**: Each SubApp is independent with its own routes, components, and state
2. **Team-based**: All data and operations are scoped to teams
3. **Configurable**: SubApps have their own configuration system
4. **Extensible**: Can be extended without modifying core code

**Standard SubApp Structure**:
\`\`\`
/apps/web/src/subapps/{subapp-name}/
├── components/          # UI components
│   ├── index.tsx       # Main component exports
│   └── ...
├── hooks/              # Custom React hooks
├── stores/             # Zustand state stores
├── utils/              # Utility functions
├── types/              # TypeScript types
├── config/             # SubApp configuration
│   └── index.ts        # Configuration schema
├── server/             # Server-side code
│   ├── router.ts       # tRPC router
│   └── service.ts      # Business logic
└── index.tsx           # SubApp entry point
\`\`\`
```

### SubApp Implementation Template

```markdown
When creating a new SubApp, follow this implementation pattern:

**1. Entry Point** (index.tsx):
\`\`\`typescript
import { SubAppConfig } from "@/types/subapp";
import { lazy } from "react";

export const CalendarSubApp: SubAppConfig = {
  name: "calendar",
  displayName: "Calendar",
  description: "Team calendar and event management",
  icon: "calendar",
  path: "/calendar",
  component: lazy(() => import("./components/CalendarView")),
  permissions: ["calendar.view"],
  settings: {
    defaultView: "month",
    showWeekends: true,
  },
};
\`\`\`

**2. Main Component**:
\`\`\`typescript
import { useSubAppConfig } from "@/hooks/useSubAppConfig";
import { useTeamContext } from "@/hooks/useTeamContext";
import { CalendarProvider } from "./CalendarProvider";

export default function CalendarView() {
  const config = useSubAppConfig("calendar");
  const { teamId } = useTeamContext();
  
  return (
    <CalendarProvider teamId={teamId} config={config}>
      {/* SubApp content */}
    </CalendarProvider>
  );
}
\`\`\`

**3. tRPC Router**:
\`\`\`typescript
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const calendarRouter = createTRPCRouter({
  findEvents: protectedProcedure
    .input(z.object({
      teamId: z.string().uuid(),
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ ctx, input }) => {
      // Implementation
    }),
});
\`\`\`
```

### SubApp Integration Context

```markdown
When integrating a SubApp with the Kodix platform:

**1. Navigation Integration**:
- Register in the main navigation menu
- Add to the SubApp registry
- Configure route permissions

**2. Data Integration**:
- Use shared data models where applicable
- Implement proper team isolation
- Follow event-driven patterns for cross-SubApp communication

**3. Configuration Integration**:
- Register SubApp-specific settings
- Implement configuration UI
- Handle configuration persistence

**4. Permission Integration**:
- Define SubApp-specific permissions
- Integrate with role-based access control
- Implement permission checks in UI and API

Example integration:
\`\`\`typescript
// In main app configuration
import { CalendarSubApp } from "@/subapps/calendar";
import { TodoSubApp } from "@/subapps/todo";

export const subApps = [
  CalendarSubApp,
  TodoSubApp,
  // ... other SubApps
];

// In navigation
const navigation = subApps
  .filter(app => hasPermission(app.permissions))
  .map(app => ({
    name: app.displayName,
    href: app.path,
    icon: app.icon,
  }));
\`\`\`
```

## 🔌 Common SubApp Patterns

### State Management Pattern

```markdown
For SubApp state management:

**1. Local State Store**:
\`\`\`typescript
import { create } from "zustand";
import { CalendarEvent } from "../types";

interface CalendarStore {
  events: CalendarEvent[];
  selectedDate: Date;
  view: "month" | "week" | "day";
  
  setEvents: (events: CalendarEvent[]) => void;
  selectDate: (date: Date) => void;
  changeView: (view: "month" | "week" | "day") => void;
}

export const useCalendarStore = create<CalendarStore>((set) => ({
  events: [],
  selectedDate: new Date(),
  view: "month",
  
  setEvents: (events) => set({ events }),
  selectDate: (date) => set({ selectedDate: date }),
  changeView: (view) => set({ view }),
}));
\`\`\`

**2. Data Fetching Hook**:
\`\`\`typescript
import { useTRPC } from "~/trpc/react";
import { useCalendarStore } from "../stores/calendarStore";

export function useCalendarEvents(teamId: string) {
  const trpc = useTRPC();
  const { selectedDate, setEvents } = useCalendarStore();
  
  const { data, isLoading } = trpc.calendar.findEvents.useQuery({
    teamId,
    startDate: startOfMonth(selectedDate),
    endDate: endOfMonth(selectedDate),
  });
  
  useEffect(() => {
    if (data) setEvents(data);
  }, [data, setEvents]);
  
  return { isLoading };
}
\`\`\`
```

### Cross-SubApp Communication

```markdown
For communication between SubApps:

**1. Event-Based Pattern**:
\`\`\`typescript
// Event emitter
import { EventEmitter } from "~/utils/events";

export const subAppEvents = new EventEmitter();

// In Calendar SubApp
subAppEvents.emit("calendar:eventCreated", {
  id: event.id,
  title: event.title,
  date: event.date,
});

// In Todo SubApp (listener)
useEffect(() => {
  const handler = (event: CalendarEvent) => {
    // Create related todo
  };
  
  subAppEvents.on("calendar:eventCreated", handler);
  return () => subAppEvents.off("calendar:eventCreated", handler);
}, []);
\`\`\`

**2. Shared Service Pattern**:
\`\`\`typescript
// Shared notification service
export class NotificationService {
  static notify(subApp: string, message: string) {
    // Central notification handling
  }
}

// Usage in any SubApp
NotificationService.notify("calendar", "Event created successfully");
\`\`\`
```

## 📋 SubApp Development Checklist

When implementing a SubApp, ensure:

- [ ] Proper folder structure following the pattern
- [ ] Entry point with SubAppConfig
- [ ] Main component with proper providers
- [ ] tRPC router with team isolation
- [ ] State management with Zustand
- [ ] i18n for all user-facing strings
- [ ] Permission checks on all operations
- [ ] Configuration schema and UI
- [ ] Error handling and loading states
- [ ] TypeScript types without 'any'
- [ ] Tests for critical functionality
- [ ] Documentation in /docs/subapps/{name}/

## 🔗 Related Resources

- [Stack Context Templates](./stack-context-templates.md)
- [Architecture Context Maps](./architecture-context-maps.md)
- [Development Context Flows](./development-context-flows.md)

<!-- AI-CONTEXT-BOUNDARY: end -->