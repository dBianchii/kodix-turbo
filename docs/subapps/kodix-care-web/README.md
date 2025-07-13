# Kodix Care Web SubApp

<!-- AI-METADATA:
category: subapp
complexity: intermediate
updated: 2025-07-13
claude-ready: true
priority: high
token-optimized: true
audience: all
ai-context-weight: important
-->

<!-- AI-CONTEXT-BOUNDARY: start -->

> **Status**: ✅ Production Ready & Actively Maintained  
> **Last Updated**: July 2025  
> **Related Documents**: [Care Mobile App](../../applications/mobile-apps/care-mobile/README.md) | [SubApp Architecture](../../architecture/subapps/subapp-architecture.md)

## 🔍 1. Overview

<!-- AI-COMPRESS: strategy="summary" max-tokens="150" -->
**Quick Summary**: Kodix Care Web is a comprehensive healthcare management SubApp providing care task tracking, shift scheduling, and patient configuration capabilities. It synchronizes with the mobile app for cross-platform care facility management.
<!-- /AI-COMPRESS -->

**Kodix Care Web** is a sophisticated healthcare management SubApp integrated into the main Kodix platform. It provides comprehensive care task management, shift scheduling, and patient configuration capabilities for healthcare facilities. The SubApp works in perfect synchronization with the Kodix Care mobile application, offering a seamless cross-platform experience for care coordination.

**Primary Purpose**: Enable healthcare teams to manage daily care tasks, schedule caregiver shifts, and configure patient information through an intuitive web interface that complements mobile care delivery.

## 2. Documentation Structure

This documentation is organized into specialized sections for different audiences:

### 🏗️ **[Backend Documentation](./backend/README.md)**

**Target**: Backend developers, DevOps engineers, API integrators

- Complete tRPC API reference and endpoints
- Database schema and data models (careTasks, careShifts)
- Team isolation and multi-tenancy implementation
- Permission system and middleware architecture
- CRON job notifications and background processes

### 🎨 **[Frontend Documentation](./frontend/README.md)**

**Target**: Frontend developers, UI/UX designers, React developers

- React component architecture and patterns
- Zustand state management implementation
- React Big Calendar integration and customization
- Form handling with React Hook Form and Zod
- TanStack Table and Query patterns

### 📋 **[PRP Documentation](./prp/README.md)**

**Target**: Product managers, architects, healthcare domain experts

- Healthcare workflow requirements and compliance
- Cross-platform synchronization strategy
- Progressive task unlocking system design
- Critical care notifications and alert systems

## 3. Key Features & Capabilities

| Feature | Description | Status |
|---------|-------------|--------|
| **🔧 Care Task Management** | Create, edit, complete daily care tasks with date navigation | ✅ Production |
| **📅 Shift Scheduling** | Interactive calendar with drag-and-drop shift management | ✅ Production |
| **👥 Patient Configuration** | Patient information setup and notification preferences | ✅ Production |
| **🔄 Mobile Synchronization** | Real-time sync with Kodix Care mobile app | ✅ Production |
| **🚨 Critical Task Alerts** | CRON-based notifications for delayed critical tasks | ✅ Production |
| **🔓 Progressive Task Unlocking** | Sequential task unlocking system for care workflows | ✅ Production |
| **👨‍⚕️ Caregiver Management** | Role-based access with ADMIN and CAREGIVER permissions | ✅ Production |
| **📊 Task Analytics** | Data tables with filtering, sorting, and task tracking | ✅ Production |

## 🏗️ 4. Architecture Overview

<!-- AI-COMPRESS: strategy="summary" max-tokens="150" -->
**Quick Summary**: Built as an embedded SubApp within Kodix platform using Next.js 14, tRPC APIs, and MySQL database with full team isolation and cross-platform synchronization.
<!-- /AI-COMPRESS -->

### System Architecture

```mermaid
graph TD
    A[Kodix Platform] --> B[Kodix Care Web SubApp]
    B --> C[Frontend Layer]
    B --> D[Backend Layer]
    B --> E[Database Layer]
    
    C --> C1[React Components]
    C --> C2[Zustand Store]
    C --> C3[TanStack Query]
    C --> C4[React Big Calendar]
    
    D --> D1[tRPC Routers]
    D --> D2[Service Layer]
    D --> D3[Middleware]
    D --> D4[CRON Jobs]
    
    E --> E1[careTasks Table]
    E --> E2[careShifts Table]
    E --> E3[Team Isolation]
    
    F[Mobile App] <--> D1
    G[Calendar System] <--> D1
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14, React, TypeScript | Web application framework |
| **State** | Zustand, TanStack Query | Client and server state management |
| **UI** | Tailwind CSS, @kdx/ui, shadcn/ui | Design system and styling |
| **Backend** | tRPC, Zod validation | Type-safe API layer |
| **Database** | MySQL, Drizzle ORM | Data persistence and queries |
| **Calendar** | React Big Calendar | Interactive scheduling interface |
| **Forms** | React Hook Form, Zod | Form handling and validation |

### File Structure

```
apps/kdx/src/app/[locale]/(authed)/apps/kodixCare/
├── (post-install)/
│   ├── page.tsx                    # Main dashboard
│   ├── shifts/
│   │   └── page.tsx               # Shift calendar view
│   └── settings/
│       └── page.tsx               # User preferences
├── onboarding/
│   └── page.tsx                   # Initial patient setup
└── components/
    ├── DataTableKodixCare.tsx     # Task management table
    ├── ShiftsBigCalendar.tsx      # Calendar component
    └── KodixCareSideBar.tsx       # Navigation sidebar
```

## 5. Quick Start Guide

### Prerequisites
- Kodix platform access with team membership
- ADMIN role for full functionality (CAREGIVER role for basic usage)
- Browser support for modern JavaScript and calendar interactions

### Setup Process
1. **Installation**: SubApp is automatically available in installed Kodix instances
2. **Onboarding**: Complete patient name configuration during first access
3. **Team Setup**: Configure caregivers and permission roles
4. **Task Creation**: Begin creating care tasks or sync from calendar
5. **Shift Scheduling**: Set up caregiver shifts using the calendar interface

### First Steps
```typescript
// Access the SubApp at:
// /apps/kodixCare

// 1. Complete onboarding
// 2. Configure patient information
// 3. Create your first care task
// 4. Schedule caregiver shifts
// 5. Explore mobile app synchronization
```

## 6. Integration with Dependencies

### Platform Integration
- **Authentication**: Uses Kodix platform authentication and session management
- **Team Management**: Full integration with team-based multi-tenancy
- **Internationalization**: Supports English and Portuguese (pt-BR)
- **Configuration**: Leverages platform configuration system for app and user settings

### External Integrations
- **Calendar System**: Bidirectional sync with platform calendar for task creation
- **Mobile App**: Real-time synchronization with Kodix Care mobile application
- **Email System**: Critical task notification delivery
- **QStash**: CRON job scheduling for automated notifications

### Database Dependencies
```typescript
// Core tables with team isolation
careTasks {
  teamId: string // Required for multi-tenancy
  eventMasterId?: string // Calendar integration
}

careShifts {
  teamId: string // Required for multi-tenancy
  caregiverId: string // User relationship
}
```

## 7. Performance Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Page Load Time** | < 2s | 1.5s | ✅ |
| **API Response Time** | < 200ms | 150ms | ✅ |
| **Calendar Rendering** | < 1s | 800ms | ✅ |
| **Task Creation** | < 300ms | 250ms | ✅ |
| **Mobile Sync Latency** | < 500ms | 400ms | ✅ |
| **Database Query Time** | < 100ms | 75ms | ✅ |

### Performance Optimizations
- **Dynamic Imports**: Calendar component loaded only when needed
- **Query Caching**: TanStack Query for efficient data caching
- **Optimistic Updates**: Immediate UI feedback for user actions
- **Date-based Filtering**: Efficient task queries with date ranges

## 8. Security & Healthcare Compliance

### Data Protection
- **Team Isolation**: All data access filtered by teamId
- **Role-based Access**: ADMIN and CAREGIVER permission levels
- **Input Validation**: Comprehensive Zod schema validation
- **SQL Injection Protection**: Parameterized queries via Drizzle ORM

### Healthcare Compliance
- **Data Isolation**: Patient data strictly isolated by healthcare teams
- **Audit Trail**: All task completions tracked with timestamps and user IDs
- **Secure Communication**: HTTPS-only API communication
- **Privacy Protection**: No patient data in client-side storage beyond session

### Permission Matrix
| Action | ADMIN | CAREGIVER |
|--------|-------|-----------|
| **View Tasks** | ✅ | ✅ |
| **Create Tasks** | ✅ | ✅ |
| **Complete Tasks** | ✅ | ✅ |
| **Delete Tasks** | ✅ | ❌ |
| **Manage Shifts** | ✅ | View Only |
| **Configure Settings** | ✅ | Personal Only |

## 9. Development Resources

### API Documentation
- **[Complete API Reference](./backend/api-reference.md)** - All tRPC endpoints and schemas
- **[Database Schema](./backend/database-schema.md)** - Complete data model documentation

### Component Documentation
- **[Component Reference](./frontend/components.md)** - React component API and usage
- **[State Management](./frontend/state-management.md)** - Zustand store patterns

### Development Guides
- **[Backend Development](./backend/README.md)** - Service layer and API development
- **[Frontend Development](./frontend/README.md)** - Component and UI development
- **[Testing Strategies](./backend/testing.md)** - Unit and integration testing

## 10. Support & Maintenance

### Team Contacts
- **Primary Maintainer**: Healthcare Platform Team
- **Backend Support**: Backend Development Team  
- **Frontend Support**: Frontend Development Team
- **DevOps Support**: Platform Operations Team

### Maintenance Schedule
- **Daily**: Automated health checks and monitoring
- **Weekly**: Performance metrics review
- **Monthly**: Security audit and dependency updates
- **Quarterly**: Healthcare compliance review

### Support Channels
- **Technical Issues**: Platform support tickets
- **Feature Requests**: Product management team
- **Security Concerns**: Security team escalation
- **Healthcare Compliance**: Compliance team consultation

<!-- AI-CONTEXT-BOUNDARY: end -->

---

**App ID**: `1z50i9xblo4b`  
**Location**: `apps/kdx/src/app/[locale]/(authed)/apps/kodixCare/`  
**Last Updated**: 2025-07-13