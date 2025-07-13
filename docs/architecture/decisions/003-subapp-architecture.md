<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="true" summary-threshold="low" -->category: architecture
complexity: intermediate
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: fullstack
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# ADR-003: SubApp Architecture Pattern

## Status
Accepted

**Date**: 2025-07-12  
**Stakeholders**: Architecture Team, Feature Teams, Product Team  
**Review Date**: 2025-12-12

## Context

### Background
The Kodix platform needed a scalable architecture that would allow:
- Multiple feature teams to work independently
- Modular development and deployment
- Clear ownership boundaries
- Shared infrastructure and components
- Flexible feature configuration per team/organization

### Problem Statement
We needed an architecture pattern that would support:
- Team-based feature isolation without sacrificing shared infrastructure
- Independent development cycles for different features
- Configuration flexibility for multi-tenant SaaS requirements
- Clear communication patterns between features
- Maintainable codebase as the platform grows

## Decision

We have adopted a **SubApp Architecture Pattern** with the following characteristics:

### Core Principles
- **Modular Isolation**: Each SubApp operates independently within the main application
- **Shared Infrastructure**: Common services, components, and utilities
- **Team Ownership**: Clear boundaries for feature team ownership
- **Configuration-Driven**: Runtime configuration for feature flags and team-specific settings

### SubApp Structure
```
apps/kdx/src/app/[locale]/(authed)/apps/
├── aiStudio/        # AI Studio SubApp
├── chat/           # Chat System SubApp
├── calendar/       # Calendar SubApp
├── todo/           # Todo Management SubApp
├── cupom/          # Coupon System SubApp
└── kodixCare/      # Kodix Care Web SubApp
```

### Technical Implementation
- **Frontend**: React components within Next.js app structure
- **Backend**: tRPC routers with service layer patterns
- **Database**: Isolated schemas with shared core tables
- **Routing**: Next.js App Router with dynamic SubApp routes
- **Configuration**: Environment and runtime configuration management

### Team-Based Isolation Model
- Each SubApp is owned by a specific feature team
- Independent development and testing cycles
- Shared core platform services and components
- Clear interfaces for inter-SubApp communication

## Options Considered

### Architecture Pattern Options

#### Option 1: SubApp Pattern (Selected)
- **Pros**: 
  - Team autonomy with shared infrastructure
  - Clear ownership boundaries
  - Gradual feature rollout capabilities
  - Shared component reuse
  - Consistent user experience
- **Cons**: 
  - Coordination required for shared components
  - Potential for feature coupling
  - Configuration complexity

#### Option 2: Microservices Architecture
- **Pros**: 
  - Complete team independence
  - Technology stack flexibility
  - Scalability per service
- **Cons**: 
  - Operational complexity
  - Network latency and reliability
  - Distributed system challenges
  - User experience fragmentation

#### Option 3: Monolithic Architecture
- **Pros**: 
  - Simple deployment and operations
  - Easy data consistency
  - Simple testing
- **Cons**: 
  - Team coordination bottlenecks
  - Technology stack lock-in
  - Scaling limitations
  - Merge conflicts and code ownership issues

### Configuration System Options

#### Option 1: Runtime Configuration with AppTeamConfig (Selected)
- **Pros**: 
  - Dynamic feature control
  - Team-specific customization
  - No deployment required for config changes
  - Multi-tenant support
- **Cons**: 
  - Runtime complexity
  - Potential performance impact
  - Configuration state management

#### Option 2: Build-time Configuration
- **Pros**: 
  - Better performance
  - Simpler runtime logic
- **Cons**: 
  - Requires deployment for changes
  - Less flexibility
  - Harder multi-tenancy support

#### Option 3: Environment Variables Only
- **Pros**: 
  - Simple implementation
  - Standard deployment pattern
- **Cons**: 
  - No team-specific configuration
  - Limited runtime flexibility
  - Poor multi-tenant support

## Consequences

### Positive
- **Team Velocity**: Teams can develop features independently
- **Scalability**: Architecture scales with team and feature growth
- **Flexibility**: Features can be enabled/disabled per team or organization
- **Maintainability**: Clear boundaries reduce cross-team dependencies
- **User Experience**: Consistent experience with modular functionality
- **Deployment**: Can deploy features independently with feature flags

### Negative
- **Complexity**: More complex than monolithic architecture
- **Coordination**: Requires coordination for shared components
- **Configuration**: Complex configuration management requirements
- **Testing**: More complex integration testing scenarios

### Neutral
- **Learning Curve**: Teams need to understand SubApp patterns
- **Documentation**: Requires comprehensive documentation of interfaces
- **Tooling**: May require specialized tooling for SubApp management

## Implementation

### Timeline
- **Phase 1** (Completed): Core SubApp infrastructure and patterns
- **Phase 2** (In Progress): Migration of existing features to SubApp pattern
- **Phase 3** (Planned): Advanced inter-SubApp communication patterns
- **Phase 4** (Future): Dynamic SubApp loading and plugin architecture

### Success Criteria
- All major features implemented as SubApps
- Teams can develop independently without blocking others
- Configuration system supports all multi-tenant requirements
- Performance requirements met with SubApp overhead
- Clear documentation and patterns established

### Rollback Plan
- SubApps can be consolidated into monolithic structure
- Database schemas can be merged if needed
- Configuration system can be simplified
- Routing can be simplified to direct routes

## Monitoring and Review

### Metrics
- Team velocity and independence metrics
- Feature deployment frequency
- Configuration usage and performance
- Inter-SubApp communication patterns
- Code ownership and contribution patterns

### Review Schedule
- **Monthly**: Team feedback and pattern refinement
- **Quarterly**: Architecture pattern effectiveness review
- **Next Review**: 2025-12-12

## References

- <!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
[SubApp Architecture Documentation](../subapps/subapp-architecture.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->
- [SubApp Configuration System](../subapps/subapp-configurations-system.md)
- [SubApp Inter-Dependencies](../subapps/subapp-inter-dependencies.md)
- [Team Structure Planning](internal-link)
- [Multi-Tenancy Requirements](internal-link)

---

**ADR Author**: Architecture Team  
**Review Committee**: CTO, Product Team, Engineering Leads  
**Implementation Owner**: Platform Team + Feature Teams
