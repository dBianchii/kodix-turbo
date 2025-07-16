<!-- AI-METADATA:
category: context-map
complexity: advanced
updated: 2025-01-12
claude-ready: true
phase: 4
priority: high
token-optimized: true
audience: ai-assistants
ai-context-weight: critical
-->

<!-- AI-CONTEXT-BOUNDARY: start -->
# Architecture Context Maps

> Visual and structured context maps for understanding Kodix architecture patterns

## 🎯 Purpose

Provide AI assistants with comprehensive architectural context through visual maps and structured relationships, enabling better understanding of system design and component interactions.

## 🗺️ System Architecture Map

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        NC[Next.js Client]
        RC[React Components]
        TQ[TanStack Query]
        ZS[Zustand Stores]
    end
    
    subgraph "API Layer"
        TR[tRPC Routers]
        MW[Middleware]
        VAL[Validation Layer]
    end
    
    subgraph "Service Layer"
        BS[Business Services]
        ES[Event System]
        CS[Cache Service]
    end
    
    subgraph "Data Layer"
        DR[Drizzle ORM]
        DB[(MySQL Database)]
        RD[(Redis Cache)]
    end
    
    NC --> TR
    RC --> TQ
    TQ --> TR
    ZS --> RC
    
    TR --> MW
    MW --> VAL
    VAL --> BS
    
    BS --> ES
    BS --> CS
    BS --> DR
    
    DR --> DB
    CS --> RD
    
    style NC fill:#e1f5e1
    style TR fill:#ffe1e1
    style BS fill:#e1e1ff
    style DB fill:#fff1e1
```

### Context for AI Assistants

```markdown
When working with Kodix architecture:

**Layer Responsibilities**:
1. **Client Layer**: UI rendering, user interactions, client state
2. **API Layer**: Request handling, validation, authentication
3. **Service Layer**: Business logic, cross-cutting concerns
4. **Data Layer**: Persistence, caching, database operations

**Data Flow**:
1. User interaction → React Component
2. Component → TanStack Query → tRPC Client
3. tRPC Client → API Router → Middleware
4. Middleware → Validation → Service Layer
5. Service Layer → Data Layer → Database
6. Response flows back through the same path

**Key Architectural Decisions**:
- Type-safe end-to-end with TypeScript and tRPC
- Service layer for business logic separation
- Event-driven communication between modules
- Team-based data isolation at all layers
```

## 🔄 SubApp Integration Map

### SubApp Ecosystem

```mermaid
graph LR
    subgraph "Core Platform"
        CP[Core Services]
        AUTH[Authentication]
        PERM[Permissions]
        CONFIG[Configuration]
    end
    
    subgraph "SubApps"
        CAL[Calendar]
        TODO[Todo]
        CHAT[Chat]
        AI[AI Studio]
    end
    
    subgraph "Shared Services"
        NOTIF[Notifications]
        FILE[File Storage]
        SEARCH[Search]
        ANALYTICS[Analytics]
    end
    
    CAL --> CP
    TODO --> CP
    CHAT --> CP
    AI --> CP
    
    CAL --> NOTIF
    TODO --> NOTIF
    CHAT --> FILE
    AI --> SEARCH
    
    CAL -.-> TODO
    TODO -.-> CAL
    CHAT -.-> AI
    
    style CP fill:#ffe1e1
    style CAL fill:#e1f5e1
    style NOTIF fill:#e1e1ff
```

### Integration Context

```markdown
SubApp Integration Patterns:

**Direct Dependencies** (Solid Lines):
- All SubApps depend on Core Services
- SubApps use Shared Services as needed
- Authentication and Permissions are mandatory

**Indirect Communication** (Dotted Lines):
- Event-based communication between SubApps
- No direct imports between SubApps
- Loose coupling through events

**Integration Points**:
1. **Configuration**: Each SubApp registers its config schema
2. **Navigation**: SubApps register navigation entries
3. **Permissions**: SubApps define required permissions
4. **Events**: SubApps can emit and listen to events

Example Integration Flow:
\`\`\`typescript
// Calendar emits event
subAppEvents.emit("calendar:meeting-scheduled", { 
  id, 
  attendees, 
  time 
});

// Todo listens and creates task
subAppEvents.on("calendar:meeting-scheduled", (data) => {
  createTodoForMeeting(data);
});
\`\`\`
```

## 📊 Data Flow Architecture

### Request Lifecycle Map

```mermaid
sequenceDiagram
    participant C as Client
    participant TQ as TanStack Query
    participant TC as tRPC Client
    participant TR as tRPC Router
    participant MW as Middleware
    participant S as Service
    participant D as Database
    
    C->>TQ: useQuery()
    TQ->>TC: Request with types
    TC->>TR: HTTP/WebSocket
    TR->>MW: Auth & Validation
    MW->>S: Business Logic
    S->>D: Query/Mutation
    D-->>S: Result
    S-->>MW: Processed Data
    MW-->>TR: Response
    TR-->>TC: Typed Response
    TC-->>TQ: Cache & Return
    TQ-->>C: UI Update
```

### Data Flow Context

```markdown
Understanding the request lifecycle:

**1. Client Initiation**:
- Component uses typed hooks
- TanStack Query manages caching
- Request includes team context

**2. API Processing**:
- tRPC ensures type safety
- Middleware handles auth/validation
- Router delegates to procedures

**3. Service Execution**:
- Business logic in service layer
- Database operations via Drizzle
- Event emission for side effects

**4. Response Handling**:
- Typed response back to client
- Automatic cache updates
- UI reactivity via React

**Error Handling at Each Stage**:
- Client: Error boundaries and fallbacks
- API: Structured error responses
- Service: Business rule validation
- Database: Transaction rollbacks
```

## 🏗️ Component Architecture Map

### Component Hierarchy

```mermaid
graph TD
    subgraph "App Layout"
        AL[App Layout]
        NAV[Navigation]
        MAIN[Main Content]
        SIDE[Sidebar]
    end
    
    subgraph "SubApp Components"
        SAR[SubApp Root]
        SAP[Provider]
        SAV[Views]
        SAC[Components]
    end
    
    subgraph "Shared Components"
        UI[UI Library]
        FORM[Form Components]
        TABLE[Data Tables]
        MODAL[Modals]
    end
    
    AL --> NAV
    AL --> MAIN
    AL --> SIDE
    
    MAIN --> SAR
    SAR --> SAP
    SAP --> SAV
    SAV --> SAC
    
    SAC --> UI
    SAC --> FORM
    SAC --> TABLE
    SAC --> MODAL
    
    style AL fill:#ffe1e1
    style SAR fill:#e1f5e1
    style UI fill:#e1e1ff
```

### Component Context

```markdown
Component Architecture Patterns:

**Layout Structure**:
- App Layout provides navigation and structure
- SubApps render in main content area
- Shared sidebar for cross-app features

**SubApp Components**:
- Root component handles initialization
- Provider supplies context and config
- Views represent different pages/routes
- Components are reusable UI pieces

**Shared Component Usage**:
\`\`\`typescript
// Import from UI library
import { Button, Card, Input } from "@/components/ui";
import { DataTable } from "@/components/data-table";
import { FormField } from "@/components/form";

// Use in SubApp component
export function EventList() {
  return (
    <Card>
      <DataTable
        columns={eventColumns}
        data={events}
        pagination
        search
      />
    </Card>
  );
}
\`\`\`

**Component Best Practices**:
1. Use shared components for consistency
2. Extend shared components, don't duplicate
3. Keep SubApp components focused
4. Implement proper TypeScript types
```

## 🔐 Security Architecture Map

### Security Layers

```mermaid
graph TB
    subgraph "Request Security"
        REQ[Incoming Request]
        CORS[CORS Check]
        RATE[Rate Limiting]
        AUTH[Authentication]
    end
    
    subgraph "Application Security"
        PERM[Permission Check]
        TEAM[Team Isolation]
        VAL[Input Validation]
        SAN[Output Sanitization]
    end
    
    subgraph "Data Security"
        ENC[Encryption at Rest]
        TLS[TLS in Transit]
        AUDIT[Audit Logging]
        BACKUP[Secure Backups]
    end
    
    REQ --> CORS
    CORS --> RATE
    RATE --> AUTH
    
    AUTH --> PERM
    PERM --> TEAM
    TEAM --> VAL
    VAL --> SAN
    
    SAN --> ENC
    ENC --> TLS
    TLS --> AUDIT
    AUDIT --> BACKUP
    
    style AUTH fill:#ffe1e1
    style TEAM fill:#e1f5e1
    style ENC fill:#e1e1ff
```

### Security Context

```markdown
Security implementation at each layer:

**Request Security**:
\`\`\`typescript
// Middleware stack
export const secureRoute = t.procedure
  .use(corsMiddleware)
  .use(rateLimitMiddleware)
  .use(authMiddleware)
  .use(permissionMiddleware);
\`\`\`

**Application Security**:
\`\`\`typescript
// Team isolation in queries
const events = await db.query.events.findMany({
  where: and(
    eq(events.teamId, ctx.session.teamId),
    // other conditions
  ),
});

// Input validation
const createEventSchema = z.object({
  title: z.string().min(1).max(255),
  date: z.date().min(new Date()),
  teamId: z.string().uuid(),
});
\`\`\`

**Data Security**:
- All sensitive data encrypted at rest
- TLS for all external communications
- Comprehensive audit logging
- Regular automated backups
```

## 🚀 Deployment Architecture Map

### Infrastructure Overview

```mermaid
graph LR
    subgraph "Client Tier"
        CDN[CDN/Edge]
        SSG[Static Assets]
        PWA[PWA Cache]
    end
    
    subgraph "Application Tier"
        LB[Load Balancer]
        APP1[App Server 1]
        APP2[App Server 2]
        APPN[App Server N]
    end
    
    subgraph "Data Tier"
        CACHE[Redis Cluster]
        DB1[(Primary DB)]
        DB2[(Read Replica)]
        S3[Object Storage]
    end
    
    CDN --> LB
    LB --> APP1
    LB --> APP2
    LB --> APPN
    
    APP1 --> CACHE
    APP2 --> CACHE
    APPN --> CACHE
    
    APP1 --> DB1
    APP2 --> DB2
    APPN --> DB2
    
    APP1 --> S3
    
    style CDN fill:#e1f5e1
    style LB fill:#ffe1e1
    style DB1 fill:#e1e1ff
```

### Deployment Context

```markdown
Deployment Architecture Considerations:

**Scalability Patterns**:
- Horizontal scaling of application servers
- Read replicas for database scaling
- CDN for static asset delivery
- Redis cluster for session/cache

**High Availability**:
- Multiple app server instances
- Database replication
- Automated failover
- Health checks and monitoring

**Performance Optimization**:
- Edge caching for static assets
- Database query optimization
- Connection pooling
- Lazy loading of SubApps

**Deployment Commands**:
\`\`\`bash
# Build for production
pnpm build

# Run production server
pnpm start

# Deploy to staging
pnpm deploy:staging

# Deploy to production
pnpm deploy:production
\`\`\`
```

## 🔗 Context Map Usage

### For AI Assistants

1. **Reference specific maps** based on the task:
   - System Architecture for overall design
   - SubApp Integration for module work
   - Data Flow for API implementation
   - Component Architecture for UI work
   - Security Architecture for auth/permissions
   - Deployment Architecture for DevOps

2. **Combine multiple maps** for complex tasks:
   ```markdown
   For implementing a new secured API endpoint:
   - Reference Data Flow Architecture for request lifecycle
   - Reference Security Architecture for auth implementation
   - Reference System Architecture for layer responsibilities
   ```

3. **Use maps for validation**:
   - Ensure implementations follow architectural patterns
   - Verify security measures at each layer
   - Confirm proper data flow and isolation

## 🔗 Related Resources

- [Stack Context Templates](./stack-context-templates.md)
- [SubApp Context Patterns](./subapp-context-patterns.md)
- [Development Context Flows](./development-context-flows.md)

<!-- AI-CONTEXT-BOUNDARY: end -->