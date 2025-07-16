<!-- AI-METADATA:
category: overview
complexity: basic
updated: 2025-07-13
claude-ready: true
priority: high
token-optimized: true
audience: all
ai-context-weight: important
-->

# ⚙️ Kodix Core Services

## 📖 Overview

This section documents the architecture, implementation, and planning of **Core Services** in the Kodix platform. Core Services represent the foundational business logic layer that manages platform-wide entities like users, teams, permissions, apps, notifications, and configurations.

**Current State**: Core Services exist as a conceptual layer implemented through repository patterns, service abstractions, and tRPC APIs, providing production-ready functionality across all SubApps.

**Future Vision**: Evolution toward a centralized CoreService gateway that provides unified access to all core platform functionality.

---

## 🎯 Core Documentation

### 📋 **[Core Services Overview](./core-services-overview.md)**
**The definitive guide to Core Services in Kodix**

- Complete analysis of current implementations vs conceptual design
- Production-ready service catalog with maturity assessments
- Architecture patterns and integration points
- Future roadmap and centralization strategy

### 🏗️ **Individual Core Services**

1. **[User and Team Management](./01-user-and-team-management/README.md)**
   - User lifecycle, team management, invitation system
   - **Status**: ✅ Production Ready

2. **[Permissions Management](./02-permissions-management/README.md)**
   - Role-based access control, app-level and team-level permissions
   - **Status**: ✅ Production Ready

3. **[App Management](./03-app-management/README.md)**
   - SubApp lifecycle, installation, configuration management
   - **Status**: ✅ Production Ready

4. **[Notification Center](./04-notification-center/README.md)**
   - Notification creation, delivery, push token management
   - **Status**: ✅ Production Ready (Basic)

5. **[Configuration System](./05-configuration-system/README.md)**
   - Team-level and user-level app configurations
   - **Status**: ✅ Production Ready

---

## 🚀 Future Planning

### **[Future Core Service Architecture](./planning/future-core-service.md)**
- Centralized CoreService gateway design
- Migration strategy from current distributed approach
- Implementation roadmap and benefits analysis

### **[Lessons Learned](./lessons-learned.md)**
- Implementation insights and best practices
- Type safety patterns and Promise handling
- Performance optimization strategies

---

## 🔗 Related Documentation

- **[Platform Architecture](../architecture/README.md)** - Overall system design patterns
- **[SubApp Documentation](../subapps/README.md)** - SubApp integration with Core Services
- **[Development Standards](../documentation-standards/README.md)** - Documentation and coding standards

---

**Note**: This directory serves as the source of truth for Core Services architecture. Implementation-specific documentation is located within respective package directories (e.g., `packages/db/` for repositories, `packages/api/` for services).
