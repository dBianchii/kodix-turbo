<!-- AI-METADATA:
category: prompt-library
complexity: advanced
updated: 2025-01-12
claude-ready: true
phase: 4
priority: high
token-optimized: true
audience: developers
ai-context-weight: critical
-->

<!-- AI-CONTEXT-BOUNDARY: start -->
# SubApp Integration Prompts

> Systematic prompts for AI-assisted SubApp integration and inter-SubApp communication in the Kodix platform

## 🎯 Purpose

Provide comprehensive prompts for integrating SubApps within the Kodix ecosystem, establishing communication patterns, shared services, and maintaining architectural consistency across the platform.

## 🔗 SubApp Integration Planning

### Integration Architecture Analysis

```markdown
**Task**: Design integration strategy for SubApp in Kodix platform

**SubApp to Integrate**: [SUBAPP_NAME]
**Integration Context**: [EXISTING_SUBAPPS]

**Integration Planning Framework**:

**1. Integration Requirements Analysis**
- [ ] Identify data sharing needs
- [ ] Define communication patterns
- [ ] Analyze dependency requirements
- [ ] Plan shared service usage

**2. Architectural Compatibility**
- [ ] Ensure Next.js 15 App Router compatibility
- [ ] Verify tRPC v11 integration patterns
- [ ] Confirm team isolation compliance
- [ ] Validate performance implications

**3. Integration Patterns**
- [ ] Event-driven communication design
- [ ] Shared state management strategy
- [ ] Cross-SubApp navigation planning
- [ ] Data synchronization approach

**4. Testing Strategy**
- [ ] Integration testing approach
- [ ] End-to-end testing scenarios
- [ ] Performance testing plans
- [ ] Security testing requirements

**Integration Analysis Template**:
```typescript
// Integration planning for Calendar-Todo SubApp integration

interface IntegrationPlan {
  sourceSubApp: 'calendar';
  targetSubApp: 'todo';
  integrationPoints: {
    // Event creation in calendar should create related todos
    eventToTodo: {
      trigger: 'calendar:event-created';
      action: 'todo:create-related-task';
      dataFlow: CalendarEvent => TodoTask;
    };
    
    // Todo completion should update calendar event status
    todoCompletion: {
      trigger: 'todo:task-completed';
      action: 'calendar:update-event-status';
      dataFlow: TodoTask => CalendarEventStatus;
    };
  };
  
  sharedServices: {
    // Shared notification service
    notifications: 'core:notification-service';
    // Shared user/team management
    userManagement: 'core:user-service';
    // Shared configuration
    configuration: 'core:config-service';
  };
  
  dependencies: {
    // Calendar depends on core services
    calendar: ['core:user-service', 'core:notification-service'];
    // Todo depends on calendar for event integration
    todo: ['core:user-service', 'calendar:event-service'];
  };
}

// Example integration implementation
class SubAppIntegrationService {
  constructor(
    private eventBus: EventBus,
    private calendarService: CalendarService,
    private todoService: TodoService
  ) {
    this.setupIntegrationHandlers();
  }
  
  private setupIntegrationHandlers(): void {
    // Calendar -> Todo integration
    this.eventBus.on('calendar:event-created', this.handleEventCreated.bind(this));
    this.eventBus.on('calendar:event-updated', this.handleEventUpdated.bind(this));
    
    // Todo -> Calendar integration
    this.eventBus.on('todo:task-completed', this.handleTaskCompleted.bind(this));
    this.eventBus.on('todo:task-deadline-changed', this.handleDeadlineChanged.bind(this));
  }
  
  private async handleEventCreated(event: CalendarEventCreatedEvent): Promise<void> {
    // Create related todo task when calendar event is created
    if (event.payload.requiresPreparation) {
      await this.todoService.createTask({
        title: `Prepare for: ${event.payload.title}`,
        description: `Preparation task for calendar event: ${event.payload.title}`,
        dueDate: new Date(event.payload.startDate.getTime() - 24 * 60 * 60 * 1000), // 1 day before
        teamId: event.payload.teamId,
        relatedEventId: event.payload.id,
        priority: 'medium',
        tags: ['auto-generated', 'event-preparation'],
      });
    }
  }
}
```

**Integration Success Criteria**:
1. **Seamless data flow** between SubApps
2. **Preserved team isolation** across integration points
3. **Performance maintained** with minimal overhead
4. **Consistent user experience** across integrated features
```

## 🚌 Event-Driven Integration

### Inter-SubApp Communication Patterns

```markdown
**Task**: Implement event-driven communication between SubApps

**Integration Scenario**: [COMMUNICATION_REQUIREMENTS]

**Event-Driven Architecture Framework**:

**1. Event Definition & Schema**
- [ ] Define event types and payloads
- [ ] Implement event validation schemas
- [ ] Design event versioning strategy
- [ ] Plan event ordering and delivery

**2. Event Bus Implementation**
- [ ] Type-safe event bus design
- [ ] Event subscription management
- [ ] Error handling and retry logic
- [ ] Event persistence and replay

**3. Cross-SubApp Event Patterns**
- [ ] Request-Response patterns
- [ ] Publish-Subscribe patterns
- [ ] Event sourcing implementation
- [ ] Saga pattern for complex workflows

**Example Event System Implementation**:
```typescript
// Event-driven integration system for Kodix SubApps

// 1. Event Type Definitions
interface BaseEvent {
  id: string;
  type: string;
  source: string;
  timestamp: Date;
  teamId: string;
  userId: string;
  version: number;
}

interface CalendarEventCreated extends BaseEvent {
  type: 'calendar:event-created';
  payload: {
    eventId: string;
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    attendees: string[];
    location?: string;
    requiresPreparation?: boolean;
    metadata: Record<string, unknown>;
  };
}

interface TodoTaskCompleted extends BaseEvent {
  type: 'todo:task-completed';
  payload: {
    taskId: string;
    title: string;
    completedAt: Date;
    relatedEventId?: string;
    completionNotes?: string;
    metadata: Record<string, unknown>;
  };
}

// 2. Type-Safe Event Bus
class TypedEventBus {
  private handlers = new Map<string, Set<Function>>();
  private middlewares: EventMiddleware[] = [];
  
  // Type-safe event emission
  async emit<T extends BaseEvent>(event: T): Promise<void> {
    // Apply middlewares (validation, logging, etc.)
    const processedEvent = await this.applyMiddlewares(event);
    
    // Get handlers for this event type
    const eventHandlers = this.handlers.get(event.type) || new Set();
    
    // Execute handlers concurrently with error isolation
    const results = await Promise.allSettled(
      Array.from(eventHandlers).map(handler => handler(processedEvent))
    );
    
    // Log any handler failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Event handler ${index} failed for ${event.type}:`, result.reason);
      }
    });
  }
  
  // Type-safe event subscription
  on<T extends BaseEvent>(
    eventType: T['type'],
    handler: (event: T) => Promise<void> | void
  ): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    
    this.handlers.get(eventType)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }
  
  // Event persistence for replay and debugging
  private async persistEvent(event: BaseEvent): Promise<void> {
    await db.insert(eventStore).values({
      id: event.id,
      type: event.type,
      source: event.source,
      teamId: event.teamId,
      userId: event.userId,
      payload: JSON.stringify(event),
      version: event.version,
      createdAt: event.timestamp,
    });
  }
}

// 3. SubApp Integration Handlers
class CalendarTodoIntegration {
  constructor(
    private eventBus: TypedEventBus,
    private todoService: TodoService,
    private calendarService: CalendarService
  ) {
    this.setupEventHandlers();
  }
  
  private setupEventHandlers(): void {
    // Calendar events create related todos
    this.eventBus.on('calendar:event-created', async (event: CalendarEventCreated) => {
      await this.handleCalendarEventCreated(event);
    });
    
    // Todo completion updates calendar events
    this.eventBus.on('todo:task-completed', async (event: TodoTaskCompleted) => {
      await this.handleTodoTaskCompleted(event);
    });
  }
  
  private async handleCalendarEventCreated(event: CalendarEventCreated): Promise<void> {
    const { payload } = event;
    
    // Only create preparation tasks for events that require them
    if (!payload.requiresPreparation) return;
    
    try {
      // Create preparation task
      const preparationTask = await this.todoService.createTask({
        title: `Prepare for: ${payload.title}`,
        description: `Preparation for calendar event: ${payload.title}`,
        dueDate: new Date(payload.startDate.getTime() - 24 * 60 * 60 * 1000),
        teamId: event.teamId,
        assignedTo: event.userId,
        priority: 'medium',
        tags: ['auto-generated', 'event-preparation'],
        metadata: {
          relatedEventId: payload.eventId,
          eventTitle: payload.title,
          eventStartDate: payload.startDate,
          source: 'calendar-integration',
        },
      });
      
      // Emit task creation event
      await this.eventBus.emit({
        id: crypto.randomUUID(),
        type: 'todo:task-created',
        source: 'calendar-integration',
        timestamp: new Date(),
        teamId: event.teamId,
        userId: event.userId,
        version: 1,
        payload: {
          taskId: preparationTask.id,
          relatedEventId: payload.eventId,
          autoGenerated: true,
        },
      } as TodoTaskCreated);
      
    } catch (error) {
      console.error('Failed to create preparation task:', error);
      // Could emit error event for monitoring
    }
  }
  
  private async handleTodoTaskCompleted(event: TodoTaskCompleted): Promise<void> {
    const { payload } = event;
    
    // Update related calendar event if exists
    if (payload.relatedEventId) {
      try {
        await this.calendarService.updateEventStatus(
          payload.relatedEventId,
          {
            preparationCompleted: true,
            preparationCompletedAt: payload.completedAt,
            preparationNotes: payload.completionNotes,
          }
        );
        
        // Emit calendar update event
        await this.eventBus.emit({
          id: crypto.randomUUID(),
          type: 'calendar:event-updated',
          source: 'todo-integration',
          timestamp: new Date(),
          teamId: event.teamId,
          userId: event.userId,
          version: 1,
          payload: {
            eventId: payload.relatedEventId,
            updateType: 'preparation-completed',
            preparationTaskId: payload.taskId,
          },
        } as CalendarEventUpdated);
        
      } catch (error) {
        console.error('Failed to update calendar event:', error);
      }
    }
  }
}

// 4. Event Middleware for Cross-Cutting Concerns
const validationMiddleware: EventMiddleware = async (event) => {
  // Validate event schema
  const schema = getEventSchema(event.type);
  return schema.parse(event);
};

const auditLogMiddleware: EventMiddleware = async (event) => {
  // Log events for audit trail
  await db.insert(auditLogs).values({
    id: crypto.randomUUID(),
    teamId: event.teamId,
    userId: event.userId,
    action: event.type,
    resourceType: 'event',
    resourceId: event.id,
    metadata: {
      eventType: event.type,
      source: event.source,
      payload: event.payload,
    },
    createdAt: event.timestamp,
  });
  
  return event;
};

const teamIsolationMiddleware: EventMiddleware = async (event) => {
  // Ensure events don't cross team boundaries
  if (!event.teamId) {
    throw new Error('Event missing teamId');
  }
  
  return event;
};
```

**Integration Benefits**:
1. **Loose coupling** between SubApps
2. **Scalable communication** patterns
3. **Event-driven architecture** best practices
4. **Type-safe** event handling
5. **Audit trail** for all inter-SubApp communications
```

## 🔧 Shared Service Integration

### Core Service Integration Patterns

```markdown
**Task**: Integrate SubApp with core Kodix services

**SubApp**: [SUBAPP_NAME]
**Required Services**: [CORE_SERVICES_LIST]

**Core Service Integration Framework**:

**1. Service Discovery & Registration**
- [ ] Service registry implementation
- [ ] Health check integration
- [ ] Load balancing configuration
- [ ] Failover strategy

**2. Authentication & Authorization**
- [ ] Single sign-on integration
- [ ] Permission service integration
- [ ] Role-based access control
- [ ] Team-based isolation

**3. Configuration Management**
- [ ] Environment-specific configs
- [ ] Feature flag integration
- [ ] Dynamic configuration updates
- [ ] Configuration validation

**Example Core Service Integration**:
```typescript
// Core service integration for SubApps

// 1. Service Registry and Dependency Injection
interface ServiceRegistry {
  userService: UserService;
  teamService: TeamService;
  notificationService: NotificationService;
  configService: ConfigService;
  permissionService: PermissionService;
  auditService: AuditService;
  cacheService: CacheService;
  eventBus: EventBus;
}

class SubAppServiceContainer {
  private services: Partial<ServiceRegistry> = {};
  
  register<K extends keyof ServiceRegistry>(
    serviceName: K,
    service: ServiceRegistry[K]
  ): void {
    this.services[serviceName] = service;
  }
  
  get<K extends keyof ServiceRegistry>(serviceName: K): ServiceRegistry[K] {
    const service = this.services[serviceName];
    if (!service) {
      throw new Error(`Service ${serviceName} not registered`);
    }
    return service;
  }
  
  // Initialize core services for SubApp
  async initializeCoreServices(): Promise<void> {
    // Register core services
    this.register('userService', new UserService(db, this.get('eventBus')));
    this.register('teamService', new TeamService(db, this.get('eventBus')));
    this.register('notificationService', new NotificationService(db, this.get('eventBus')));
    this.register('configService', new ConfigService(db, this.get('cacheService')));
    this.register('permissionService', new PermissionService(db, this.get('userService')));
    this.register('auditService', new AuditService(db));
    this.register('cacheService', new CacheService(redis));
    this.register('eventBus', new TypedEventBus());
    
    // Initialize services that have dependencies
    await Promise.all([
      this.get('userService').initialize(),
      this.get('teamService').initialize(),
      this.get('notificationService').initialize(),
    ]);
  }
}

// 2. Authentication Integration
class SubAppAuthenticationMiddleware {
  constructor(
    private userService: UserService,
    private permissionService: PermissionService
  ) {}
  
  async authenticate(request: AuthenticatedRequest): Promise<AuthContext> {
    // Extract session from request
    const sessionToken = this.extractSessionToken(request);
    if (!sessionToken) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }
    
    // Validate session
    const session = await this.userService.validateSession(sessionToken);
    if (!session) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid session',
      });
    }
    
    // Load user with team information
    const user = await this.userService.getUserById(session.userId);
    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not found',
      });
    }
    
    // Load user permissions
    const permissions = await this.permissionService.getUserPermissions(
      user.id,
      user.teamId
    );
    
    return {
      user,
      session,
      permissions,
      teamId: user.teamId,
    };
  }
  
  async authorize(
    context: AuthContext,
    requiredPermission: string,
    resourceId?: string
  ): Promise<boolean> {
    return await this.permissionService.hasPermission(
      context.user.id,
      context.teamId,
      requiredPermission,
      resourceId
    );
  }
}

// 3. Configuration Service Integration
class SubAppConfiguration {
  constructor(
    private configService: ConfigService,
    private subAppName: string
  ) {}
  
  async getConfig<T>(key: string, defaultValue?: T): Promise<T> {
    const fullKey = `${this.subAppName}.${key}`;
    return await this.configService.get(fullKey, defaultValue);
  }
  
  async setConfig<T>(key: string, value: T): Promise<void> {
    const fullKey = `${this.subAppName}.${key}`;
    await this.configService.set(fullKey, value);
  }
  
  // Get feature flags for SubApp
  async getFeatureFlags(): Promise<Record<string, boolean>> {
    return await this.configService.getFeatureFlags(this.subAppName);
  }
  
  // Get team-specific configuration
  async getTeamConfig<T>(teamId: string, key: string, defaultValue?: T): Promise<T> {
    const fullKey = `teams.${teamId}.${this.subAppName}.${key}`;
    return await this.configService.get(fullKey, defaultValue);
  }
}

// 4. Notification Service Integration
class SubAppNotifications {
  constructor(
    private notificationService: NotificationService,
    private subAppName: string
  ) {}
  
  async sendNotification(
    teamId: string,
    userId: string,
    notification: {
      type: string;
      title: string;
      message: string;
      data?: Record<string, unknown>;
      channels?: ('email' | 'push' | 'in-app')[];
    }
  ): Promise<void> {
    await this.notificationService.send({
      ...notification,
      source: this.subAppName,
      teamId,
      userId,
      createdAt: new Date(),
    });
  }
  
  async sendTeamNotification(
    teamId: string,
    notification: {
      type: string;
      title: string;
      message: string;
      data?: Record<string, unknown>;
      excludeUsers?: string[];
    }
  ): Promise<void> {
    await this.notificationService.sendToTeam({
      ...notification,
      source: this.subAppName,
      teamId,
      createdAt: new Date(),
    });
  }
}

// 5. Complete SubApp Integration Example
class CalendarSubAppIntegration {
  private services: ServiceRegistry;
  private auth: SubAppAuthenticationMiddleware;
  private config: SubAppConfiguration;
  private notifications: SubAppNotifications;
  
  constructor(serviceContainer: SubAppServiceContainer) {
    this.services = {
      userService: serviceContainer.get('userService'),
      teamService: serviceContainer.get('teamService'),
      notificationService: serviceContainer.get('notificationService'),
      configService: serviceContainer.get('configService'),
      permissionService: serviceContainer.get('permissionService'),
      auditService: serviceContainer.get('auditService'),
      cacheService: serviceContainer.get('cacheService'),
      eventBus: serviceContainer.get('eventBus'),
    };
    
    this.auth = new SubAppAuthenticationMiddleware(
      this.services.userService,
      this.services.permissionService
    );
    
    this.config = new SubAppConfiguration(
      this.services.configService,
      'calendar'
    );
    
    this.notifications = new SubAppNotifications(
      this.services.notificationService,
      'calendar'
    );
  }
  
  // tRPC router with integrated services
  createRouter() {
    return createTRPCRouter({
      createEvent: protectedProcedure
        .input(CreateEventSchema)
        .mutation(async ({ ctx, input }) => {
          // Authorization check
          const canCreateEvents = await this.auth.authorize(
            ctx.auth,
            'calendar:create-events'
          );
          
          if (!canCreateEvents) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Not authorized to create events',
            });
          }
          
          // Create event
          const event = await this.createCalendarEvent(input, ctx.auth.teamId);
          
          // Send notifications
          await this.notifications.sendTeamNotification(
            ctx.auth.teamId,
            {
              type: 'calendar:event-created',
              title: 'New Event Created',
              message: `${ctx.auth.user.name} created "${event.title}"`,
              data: { eventId: event.id },
            }
          );
          
          // Emit integration event
          await this.services.eventBus.emit({
            id: crypto.randomUUID(),
            type: 'calendar:event-created',
            source: 'calendar',
            timestamp: new Date(),
            teamId: ctx.auth.teamId,
            userId: ctx.auth.user.id,
            version: 1,
            payload: event,
          } as CalendarEventCreated);
          
          return event;
        }),
    });
  }
}
```

**Integration Architecture Benefits**:
1. **Centralized service management**
2. **Consistent authentication** across SubApps
3. **Shared configuration** management
4. **Unified notification** system
5. **Type-safe service** dependencies
```

## 🔗 Related Resources

- [SubApp Creation Prompts](./subapp-creation.md)
- [SubApp Testing Prompts](./subapp-testing.md)
- [Feature Implementation Prompts](../development/feature-implementation.md)

<!-- AI-CONTEXT-BOUNDARY: end -->