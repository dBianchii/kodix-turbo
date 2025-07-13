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
# SubApp Testing Prompts

> Comprehensive prompts for AI-assisted testing strategies and implementation for SubApps in the Kodix platform

## 🎯 Purpose

Provide systematic prompts for creating comprehensive test suites for SubApps, covering unit tests, integration tests, end-to-end tests, and SubApp-specific testing patterns including team isolation and cross-SubApp communication.

## 🧪 Comprehensive SubApp Testing Strategy

### Testing Framework Planning

```markdown
**Task**: Design comprehensive testing strategy for Kodix SubApp

**SubApp**: [SUBAPP_NAME]
**Testing Scope**: [UNIT|INTEGRATION|E2E|ALL]

**SubApp Testing Framework**:

**1. Testing Layers**
- [ ] Unit tests for business logic
- [ ] Integration tests for API endpoints
- [ ] Component tests for UI elements
- [ ] End-to-end tests for user workflows
- [ ] Cross-SubApp integration tests

**2. Team Isolation Testing**
- [ ] Data isolation verification
- [ ] Permission boundary testing
- [ ] Cross-team access prevention
- [ ] Admin scope limitation testing

**3. Performance Testing**
- [ ] API response time testing
- [ ] Database query optimization
- [ ] Frontend rendering performance
- [ ] Load testing for concurrent users

**4. Security Testing**
- [ ] Authentication flow testing
- [ ] Authorization boundary testing
- [ ] Input validation testing
- [ ] XSS and injection prevention

**Testing Strategy Template**:
```typescript
// Comprehensive testing strategy for Calendar SubApp

describe('Calendar SubApp - Comprehensive Test Suite', () => {
  // Test environment setup
  beforeAll(async () => {
    await setupTestDatabase();
    await seedTestData();
    await initializeTestServices();
  });
  
  afterAll(async () => {
    await cleanupTestDatabase();
    await shutdownTestServices();
  });
  
  describe('Unit Tests - Business Logic', () => {
    describe('CalendarService', () => {
      it('should create event with proper team isolation', async () => {
        const service = new CalendarService(mockDb, mockEventBus);
        
        const eventData = {
          title: 'Team Meeting',
          startDate: new Date('2024-01-15T10:00:00Z'),
          endDate: new Date('2024-01-15T11:00:00Z'),
          teamId: 'team-1',
          createdBy: 'user-1',
        };
        
        const result = await service.createEvent(eventData);
        
        expect(result).toMatchObject({
          id: expect.any(String),
          title: 'Team Meeting',
          teamId: 'team-1',
          createdBy: 'user-1',
        });
        
        // Verify team isolation
        expect(result.teamId).toBe(eventData.teamId);
      });
      
      it('should prevent cross-team event access', async () => {
        const service = new CalendarService(mockDb, mockEventBus);
        
        // Create event for team-1
        const event = await service.createEvent({
          title: 'Team 1 Event',
          teamId: 'team-1',
          startDate: new Date(),
          endDate: new Date(),
          createdBy: 'user-1',
        });
        
        // Try to access from team-2 user
        await expect(
          service.getEvent(event.id, 'team-2')
        ).rejects.toThrow('Event not found');
      });
    });
  });
  
  describe('Integration Tests - API Endpoints', () => {
    describe('Calendar tRPC Router', () => {
      it('should handle event creation flow', async () => {
        const caller = appRouter.createCaller({
          session: mockTeam1AdminSession,
          db: testDb,
        });
        
        const eventInput = {
          title: 'Integration Test Event',
          description: 'Test event for integration testing',
          startDate: new Date('2024-01-15T10:00:00Z'),
          endDate: new Date('2024-01-15T11:00:00Z'),
          attendees: ['user-2', 'user-3'],
        };
        
        const result = await caller.calendar.create(eventInput);
        
        expect(result).toMatchObject({
          id: expect.any(String),
          title: eventInput.title,
          teamId: mockTeam1AdminSession.teamId,
        });
        
        // Verify event was persisted
        const persistedEvent = await caller.calendar.getById({
          id: result.id,
        });
        
        expect(persistedEvent).toMatchObject(result);
      });
      
      it('should enforce team isolation in API calls', async () => {
        // Create event as team-1
        const team1Caller = appRouter.createCaller({
          session: mockTeam1UserSession,
          db: testDb,
        });
        
        const event = await team1Caller.calendar.create({
          title: 'Team 1 Private Event',
          startDate: new Date(),
          endDate: new Date(),
        });
        
        // Try to access as team-2
        const team2Caller = appRouter.createCaller({
          session: mockTeam2UserSession,
          db: testDb,
        });
        
        await expect(
          team2Caller.calendar.getById({ id: event.id })
        ).rejects.toThrow(TRPCError);
      });
    });
  });
  
  describe('Component Tests - UI Elements', () => {
    describe('CalendarView Component', () => {
      it('should render calendar with events', async () => {
        const mockEvents = [
          {
            id: '1',
            title: 'Test Event',
            startDate: new Date(),
            endDate: new Date(),
            teamId: 'team-1',
          },
        ];
        
        render(
          <CalendarView 
            events={mockEvents}
            onEventClick={jest.fn()}
            onEventCreate={jest.fn()}
          />
        );
        
        expect(screen.getByText('Test Event')).toBeInTheDocument();
      });
      
      it('should handle event creation', async () => {
        const onEventCreate = jest.fn();
        
        render(
          <CalendarView 
            events={[]}
            onEventClick={jest.fn()}
            onEventCreate={onEventCreate}
          />
        );
        
        // Simulate date selection and event creation
        const dateCell = screen.getByTestId('calendar-date-15');
        fireEvent.click(dateCell);
        
        const createButton = screen.getByText('Create Event');
        fireEvent.click(createButton);
        
        expect(onEventCreate).toHaveBeenCalledWith({
          date: expect.any(Date),
        });
      });
    });
  });
  
  describe('E2E Tests - User Workflows', () => {
    it('should complete full event creation workflow', async () => {
      await page.goto('/calendar');
      
      // Navigate to event creation
      await page.click('[data-testid="create-event-button"]');
      
      // Fill event form
      await page.fill('[data-testid="event-title"]', 'E2E Test Event');
      await page.fill('[data-testid="event-description"]', 'Created via E2E test');
      await page.selectOption('[data-testid="event-duration"]', '60');
      
      // Set date and time
      await page.click('[data-testid="start-date-picker"]');
      await page.click('[data-testid="date-today"]');
      await page.selectOption('[data-testid="start-time"]', '10:00');
      
      // Add attendees
      await page.click('[data-testid="add-attendees"]');
      await page.selectOption('[data-testid="attendee-select"]', 'user-2');
      
      // Submit form
      await page.click('[data-testid="create-event-submit"]');
      
      // Verify event appears in calendar
      await expect(page.locator('[data-testid="calendar-event"]')).toContainText('E2E Test Event');
      
      // Verify event details
      await page.click('[data-testid="calendar-event"]');
      await expect(page.locator('[data-testid="event-modal-title"]')).toContainText('E2E Test Event');
    });
  });
});
```

**Testing Coverage Goals**:
- **Unit Tests**: 90%+ code coverage
- **Integration Tests**: All API endpoints covered
- **Component Tests**: All UI components tested
- **E2E Tests**: Critical user flows covered
```

## 🔒 Team Isolation Testing

### Security Boundary Testing

```markdown
**Task**: Implement comprehensive team isolation testing for SubApp

**SubApp**: [SUBAPP_NAME]
**Security Focus**: Team-based data isolation and access control

**Team Isolation Testing Framework**:

**1. Data Isolation Tests**
- [ ] Cross-team data access prevention
- [ ] Team-scoped query verification
- [ ] Admin privilege scope testing
- [ ] Data leakage prevention

**2. Permission Boundary Tests**
- [ ] Role-based access control
- [ ] Resource ownership validation
- [ ] API endpoint authorization
- [ ] UI element visibility

**3. Security Integration Tests**
- [ ] Authentication flow testing
- [ ] Session management testing
- [ ] CSRF protection testing
- [ ] XSS prevention testing

**Example Team Isolation Tests**:
```typescript
// Comprehensive team isolation testing suite

describe('Team Isolation Security Tests', () => {
  let team1User: AuthUser;
  let team2User: AuthUser;
  let team1Admin: AuthUser;
  let team2Admin: AuthUser;
  
  beforeAll(async () => {
    // Setup test users in different teams
    team1User = await createTestUser('team-1', 'member');
    team2User = await createTestUser('team-2', 'member');
    team1Admin = await createTestUser('team-1', 'admin');
    team2Admin = await createTestUser('team-2', 'admin');
  });
  
  describe('Data Isolation Tests', () => {
    it('should prevent cross-team data access in queries', async () => {
      // Create data in team-1
      const team1Event = await createCalendarEvent({
        title: 'Team 1 Private Event',
        teamId: 'team-1',
        createdBy: team1User.id,
      });
      
      // Try to access from team-2
      const team2Caller = appRouter.createCaller({
        session: createSession(team2User),
        db: testDb,
      });
      
      // Should not find team-1 events
      const events = await team2Caller.calendar.getAll();
      expect(events).not.toContainEqual(
        expect.objectContaining({ id: team1Event.id })
      );
      
      // Direct access should fail
      await expect(
        team2Caller.calendar.getById({ id: team1Event.id })
      ).rejects.toThrow('Event not found');
    });
    
    it('should enforce team isolation in database queries', async () => {
      // Mock database to verify query filters
      const mockQuery = jest.spyOn(testDb.query.events, 'findMany');
      
      const caller = appRouter.createCaller({
        session: createSession(team1User),
        db: testDb,
      });
      
      await caller.calendar.getAll();
      
      // Verify teamId filter was applied
      expect(mockQuery).toHaveBeenCalledWith({
        where: expect.objectContaining({
          teamId: team1User.teamId,
        }),
      });
    });
    
    it('should prevent admin from accessing other teams', async () => {
      // Create data in team-2
      const team2Event = await createCalendarEvent({
        title: 'Team 2 Event',
        teamId: 'team-2',
        createdBy: team2User.id,
      });
      
      // Team-1 admin should not access team-2 data
      const team1AdminCaller = appRouter.createCaller({
        session: createSession(team1Admin),
        db: testDb,
      });
      
      await expect(
        team1AdminCaller.calendar.getById({ id: team2Event.id })
      ).rejects.toThrow('Event not found');
    });
    
    it('should maintain isolation in bulk operations', async () => {
      // Create events in both teams
      await createCalendarEvent({ teamId: 'team-1', title: 'Team 1 Event' });
      await createCalendarEvent({ teamId: 'team-2', title: 'Team 2 Event' });
      
      const team1Caller = appRouter.createCaller({
        session: createSession(team1User),
        db: testDb,
      });
      
      // Bulk update should only affect team-1 events
      const result = await team1Caller.calendar.bulkUpdate({
        filter: { status: 'draft' },
        update: { status: 'published' },
      });
      
      // Verify only team-1 events were updated
      const team1Events = await team1Caller.calendar.getAll();
      expect(team1Events.every(e => e.status === 'published')).toBe(true);
      
      // Team-2 events should remain unchanged
      const team2Caller = appRouter.createCaller({
        session: createSession(team2User),
        db: testDb,
      });
      
      const team2Events = await team2Caller.calendar.getAll();
      expect(team2Events.some(e => e.status === 'draft')).toBe(true);
    });
  });
  
  describe('Permission Boundary Tests', () => {
    it('should enforce role-based permissions', async () => {
      const memberCaller = appRouter.createCaller({
        session: createSession(team1User),
        db: testDb,
      });
      
      const adminCaller = appRouter.createCaller({
        session: createSession(team1Admin),
        db: testDb,
      });
      
      // Members should not access admin functions
      await expect(
        memberCaller.calendar.deleteAll()
      ).rejects.toThrow('Insufficient permissions');
      
      // Admins should have access
      await expect(
        adminCaller.calendar.deleteAll()
      ).resolves.not.toThrow();
    });
    
    it('should validate resource ownership', async () => {
      // User 1 creates event
      const user1Caller = appRouter.createCaller({
        session: createSession(team1User),
        db: testDb,
      });
      
      const event = await user1Caller.calendar.create({
        title: 'User 1 Event',
        startDate: new Date(),
        endDate: new Date(),
      });
      
      // User 2 (same team) tries to modify
      const anotherTeam1User = await createTestUser('team-1', 'member');
      const user2Caller = appRouter.createCaller({
        session: createSession(anotherTeam1User),
        db: testDb,
      });
      
      // Should prevent modification by non-owner
      await expect(
        user2Caller.calendar.update({
          id: event.id,
          title: 'Modified by User 2',
        })
      ).rejects.toThrow('Not authorized');
    });
  });
  
  describe('UI Permission Tests', () => {
    it('should hide admin UI elements from members', async () => {
      render(
        <CalendarApp user={team1User} />
      );
      
      // Admin buttons should not be visible
      expect(screen.queryByTestId('admin-panel')).not.toBeInTheDocument();
      expect(screen.queryByTestId('delete-all-events')).not.toBeInTheDocument();
      expect(screen.queryByTestId('export-team-data')).not.toBeInTheDocument();
    });
    
    it('should show admin UI elements to admins', async () => {
      render(
        <CalendarApp user={team1Admin} />
      );
      
      // Admin elements should be visible
      expect(screen.getByTestId('admin-panel')).toBeInTheDocument();
      expect(screen.getByTestId('team-settings')).toBeInTheDocument();
    });
    
    it('should respect event ownership in UI', async () => {
      const ownEvent = { id: '1', createdBy: team1User.id };
      const otherEvent = { id: '2', createdBy: 'other-user' };
      
      render(
        <EventList 
          events={[ownEvent, otherEvent]} 
          currentUser={team1User}
        />
      );
      
      // Should show edit button for own event
      expect(screen.getByTestId('edit-event-1')).toBeInTheDocument();
      
      // Should not show edit button for other's event
      expect(screen.queryByTestId('edit-event-2')).not.toBeInTheDocument();
    });
  });
});
```

**Security Testing Goals**:
1. **Zero cross-team data leakage**
2. **Proper permission enforcement**
3. **UI security boundary compliance**
4. **Admin privilege scope limitation**
```

## 🔄 Cross-SubApp Integration Testing

### Inter-SubApp Communication Testing

```markdown
**Task**: Test communication and integration between SubApps

**SubApp Integration**: [SUBAPP_1] ↔ [SUBAPP_2]
**Communication Method**: [EVENT_BUS|API|SHARED_SERVICE]

**Integration Testing Framework**:

**1. Event-Driven Communication Tests**
- [ ] Event emission and handling
- [ ] Event payload validation
- [ ] Event ordering and sequencing
- [ ] Error handling and recovery

**2. Shared Service Integration Tests**
- [ ] Service dependency resolution
- [ ] Cross-SubApp data sharing
- [ ] Configuration management
- [ ] Authentication propagation

**3. Workflow Integration Tests**
- [ ] End-to-end user workflows
- [ ] Cross-SubApp navigation
- [ ] Data consistency across SubApps
- [ ] Performance impact assessment

**Example Integration Tests**:
```typescript
// Cross-SubApp integration testing

describe('Calendar-Todo Integration Tests', () => {
  let calendarService: CalendarService;
  let todoService: TodoService;
  let eventBus: TypedEventBus;
  let integrationService: CalendarTodoIntegration;
  
  beforeAll(async () => {
    eventBus = new TypedEventBus();
    calendarService = new CalendarService(testDb, eventBus);
    todoService = new TodoService(testDb, eventBus);
    integrationService = new CalendarTodoIntegration(
      eventBus,
      todoService,
      calendarService
    );
  });
  
  describe('Event-Driven Communication', () => {
    it('should create todo when calendar event requires preparation', async () => {
      // Setup event handlers
      const todoCreationSpy = jest.spyOn(todoService, 'createTask');
      
      // Create calendar event that requires preparation
      const calendarEvent = await calendarService.createEvent({
        title: 'Important Meeting',
        startDate: new Date('2024-01-15T10:00:00Z'),
        endDate: new Date('2024-01-15T11:00:00Z'),
        teamId: 'team-1',
        createdBy: 'user-1',
        requiresPreparation: true,
      });
      
      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify todo was created
      expect(todoCreationSpy).toHaveBeenCalledWith({
        title: 'Prepare for: Important Meeting',
        description: expect.stringContaining('Important Meeting'),
        dueDate: expect.any(Date),
        teamId: 'team-1',
        assignedTo: 'user-1',
        metadata: expect.objectContaining({
          relatedEventId: calendarEvent.id,
        }),
      });
    });
    
    it('should update calendar when related todo is completed', async () => {
      // Create calendar event
      const calendarEvent = await calendarService.createEvent({
        title: 'Meeting with Preparation',
        teamId: 'team-1',
        createdBy: 'user-1',
        requiresPreparation: true,
        startDate: new Date(),
        endDate: new Date(),
      });
      
      // Create related todo
      const todo = await todoService.createTask({
        title: 'Prepare presentation',
        teamId: 'team-1',
        assignedTo: 'user-1',
        metadata: { relatedEventId: calendarEvent.id },
      });
      
      // Complete the todo
      await todoService.completeTask(todo.id, {
        completionNotes: 'Presentation ready',
      });
      
      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify calendar event was updated
      const updatedEvent = await calendarService.getEventById(calendarEvent.id);
      expect(updatedEvent.preparationCompleted).toBe(true);
      expect(updatedEvent.preparationNotes).toBe('Presentation ready');
    });
    
    it('should handle event processing failures gracefully', async () => {
      // Mock todo service to fail
      jest.spyOn(todoService, 'createTask').mockRejectedValueOnce(
        new Error('Todo service unavailable')
      );
      
      // Create calendar event
      const calendarEvent = await calendarService.createEvent({
        title: 'Event with Failing Integration',
        teamId: 'team-1',
        createdBy: 'user-1',
        requiresPreparation: true,
        startDate: new Date(),
        endDate: new Date(),
      });
      
      // Event should still be created despite integration failure
      expect(calendarEvent.id).toBeDefined();
      
      // Verify error was logged but didn't crash the system
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create preparation task')
      );
    });
  });
  
  describe('Data Consistency Tests', () => {
    it('should maintain data consistency across SubApps', async () => {
      // Create calendar event
      const event = await calendarService.createEvent({
        title: 'Consistency Test Event',
        teamId: 'team-1',
        createdBy: 'user-1',
        requiresPreparation: true,
        startDate: new Date('2024-01-15T10:00:00Z'),
        endDate: new Date('2024-01-15T11:00:00Z'),
      });
      
      // Wait for integration processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get related todo
      const todos = await todoService.getTasksByTeam('team-1');
      const relatedTodo = todos.find(t => 
        t.metadata?.relatedEventId === event.id
      );
      
      expect(relatedTodo).toBeDefined();
      expect(relatedTodo?.title).toContain(event.title);
      expect(relatedTodo?.teamId).toBe(event.teamId);
      
      // Update calendar event
      await calendarService.updateEvent(event.id, {
        title: 'Updated Event Title',
      });
      
      // Verify consistency is maintained
      const updatedTodo = await todoService.getTaskById(relatedTodo!.id);
      expect(updatedTodo.title).toContain('Updated Event Title');
    });
    
    it('should handle cascading deletes properly', async () => {
      // Create event with related todo
      const event = await calendarService.createEvent({
        title: 'Event to Delete',
        teamId: 'team-1',
        createdBy: 'user-1',
        requiresPreparation: true,
        startDate: new Date(),
        endDate: new Date(),
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify todo was created
      const todos = await todoService.getTasksByTeam('team-1');
      const relatedTodo = todos.find(t => 
        t.metadata?.relatedEventId === event.id
      );
      expect(relatedTodo).toBeDefined();
      
      // Delete calendar event
      await calendarService.deleteEvent(event.id);
      
      // Verify related todo is handled (marked as orphaned or deleted)
      const updatedTodo = await todoService.getTaskById(relatedTodo!.id);
      expect(
        updatedTodo.status === 'cancelled' || 
        updatedTodo.metadata?.orphaned === true
      ).toBe(true);
    });
  });
  
  describe('Performance Integration Tests', () => {
    it('should handle high-volume event processing', async () => {
      const startTime = Date.now();
      const eventPromises = [];
      
      // Create 100 events concurrently
      for (let i = 0; i < 100; i++) {
        eventPromises.push(
          calendarService.createEvent({
            title: `Bulk Event ${i}`,
            teamId: 'team-1',
            createdBy: 'user-1',
            requiresPreparation: true,
            startDate: new Date(),
            endDate: new Date(),
          })
        );
      }
      
      await Promise.all(eventPromises);
      
      // Wait for all integration processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      // Should complete within reasonable time (10 seconds)
      expect(processingTime).toBeLessThan(10000);
      
      // Verify all todos were created
      const todos = await todoService.getTasksByTeam('team-1');
      const bulkTodos = todos.filter(t => t.title.includes('Bulk Event'));
      expect(bulkTodos).toHaveLength(100);
    });
  });
  
  describe('Error Recovery Tests', () => {
    it('should recover from temporary service failures', async () => {
      // Simulate service failure
      const originalMethod = todoService.createTask;
      let failureCount = 0;
      
      jest.spyOn(todoService, 'createTask').mockImplementation(async (...args) => {
        if (failureCount < 2) {
          failureCount++;
          throw new Error('Temporary service failure');
        }
        return originalMethod.apply(todoService, args);
      });
      
      // Create calendar event
      const event = await calendarService.createEvent({
        title: 'Recovery Test Event',
        teamId: 'team-1',
        createdBy: 'user-1',
        requiresPreparation: true,
        startDate: new Date(),
        endDate: new Date(),
      });
      
      // Wait for retry processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verify todo was eventually created
      const todos = await todoService.getTasksByTeam('team-1');
      const relatedTodo = todos.find(t => 
        t.metadata?.relatedEventId === event.id
      );
      
      expect(relatedTodo).toBeDefined();
    });
  });
});
```

**Integration Testing Benefits**:
1. **Reliable cross-SubApp communication**
2. **Data consistency across modules**
3. **Performance validation under load**
4. **Error recovery and resilience**
```

## 🚀 Performance Testing

### SubApp Performance Validation

```markdown
**Task**: Implement performance testing for SubApp components

**SubApp**: [SUBAPP_NAME]
**Performance Targets**: [RESPONSE_TIME|THROUGHPUT|MEMORY_USAGE]

**Performance Testing Framework**:

**1. API Performance Tests**
- [ ] Response time benchmarks
- [ ] Throughput testing
- [ ] Memory usage validation
- [ ] Database query optimization

**2. Frontend Performance Tests**
- [ ] Component rendering speed
- [ ] Bundle size validation
- [ ] User interaction responsiveness
- [ ] Memory leak detection

**3. Load Testing**
- [ ] Concurrent user simulation
- [ ] Stress testing scenarios
- [ ] Resource utilization monitoring
- [ ] Scalability validation

**Example Performance Tests**:
```typescript
// Performance testing suite for Calendar SubApp

describe('Calendar SubApp Performance Tests', () => {
  describe('API Performance', () => {
    it('should handle calendar queries within performance targets', async () => {
      const caller = appRouter.createCaller({
        session: mockUserSession,
        db: testDb,
      });
      
      // Warm up
      await caller.calendar.getAll();
      
      // Performance test
      const iterations = 100;
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        await caller.calendar.getAll();
      }
      
      const endTime = performance.now();
      const averageTime = (endTime - startTime) / iterations;
      
      // Should respond within 50ms on average
      expect(averageTime).toBeLessThan(50);
    });
    
    it('should handle concurrent requests efficiently', async () => {
      const callers = Array.from({ length: 50 }, () =>
        appRouter.createCaller({
          session: mockUserSession,
          db: testDb,
        })
      );
      
      const startTime = performance.now();
      
      // Execute 50 concurrent requests
      await Promise.all(
        callers.map(caller => caller.calendar.getAll())
      );
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should handle concurrent requests within 2 seconds
      expect(totalTime).toBeLessThan(2000);
    });
    
    it('should maintain performance with large datasets', async () => {
      // Create 1000 events
      const events = Array.from({ length: 1000 }, (_, i) => ({
        title: `Performance Test Event ${i}`,
        startDate: new Date(),
        endDate: new Date(),
        teamId: 'team-1',
        createdBy: 'user-1',
      }));
      
      await Promise.all(
        events.map(event => calendarService.createEvent(event))
      );
      
      const caller = appRouter.createCaller({
        session: mockUserSession,
        db: testDb,
      });
      
      // Test pagination performance
      const startTime = performance.now();
      const result = await caller.calendar.getAll({
        page: 1,
        limit: 50,
      });
      const endTime = performance.now();
      
      const queryTime = endTime - startTime;
      
      // Should still respond quickly with large dataset
      expect(queryTime).toBeLessThan(100);
      expect(result.events).toHaveLength(50);
    });
  });
  
  describe('Frontend Performance', () => {
    it('should render calendar component quickly', async () => {
      const events = Array.from({ length: 100 }, (_, i) => ({
        id: `event-${i}`,
        title: `Event ${i}`,
        startDate: new Date(),
        endDate: new Date(),
      }));
      
      const startTime = performance.now();
      
      render(<CalendarView events={events} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within 100ms
      expect(renderTime).toBeLessThan(100);
    });
    
    it('should handle user interactions responsively', async () => {
      render(<CalendarView events={[]} />);
      
      const dateCell = screen.getByTestId('calendar-date-15');
      
      const startTime = performance.now();
      fireEvent.click(dateCell);
      const endTime = performance.now();
      
      const interactionTime = endTime - startTime;
      
      // User interactions should be near-instant
      expect(interactionTime).toBeLessThan(16); // 60fps
    });
    
    it('should not have memory leaks', async () => {
      const { unmount } = render(<CalendarView events={[]} />);
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      // Render and unmount multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount: tempUnmount } = render(<CalendarView events={[]} />);
        tempUnmount();
      }
      
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be minimal
      expect(memoryIncrease).toBeLessThan(1024 * 1024); // Less than 1MB
      
      unmount();
    });
  });
  
  describe('Database Performance', () => {
    it('should optimize query execution plans', async () => {
      // Test complex query performance
      const startTime = performance.now();
      
      await testDb.query.events.findMany({
        where: and(
          eq(events.teamId, 'team-1'),
          gte(events.startDate, new Date('2024-01-01')),
          lte(events.endDate, new Date('2024-12-31'))
        ),
        with: {
          attendees: true,
          creator: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [events.startDate, events.title],
        limit: 100,
      });
      
      const endTime = performance.now();
      const queryTime = endTime - startTime;
      
      // Complex queries should complete within 50ms
      expect(queryTime).toBeLessThan(50);
    });
    
    it('should handle batch operations efficiently', async () => {
      const batchSize = 100;
      const events = Array.from({ length: batchSize }, (_, i) => ({
        id: crypto.randomUUID(),
        title: `Batch Event ${i}`,
        startDate: new Date(),
        endDate: new Date(),
        teamId: 'team-1',
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      
      const startTime = performance.now();
      
      // Batch insert
      await testDb.insert(events).values(events);
      
      const endTime = performance.now();
      const batchTime = endTime - startTime;
      
      // Batch operations should be efficient
      expect(batchTime).toBeLessThan(500);
      
      // Verify all events were inserted
      const insertedEvents = await testDb.query.events.findMany({
        where: eq(events.teamId, 'team-1'),
      });
      
      expect(insertedEvents).toHaveLength(batchSize);
    });
  });
});
```

**Performance Targets**:
- **API Response Time**: <50ms (average)
- **UI Rendering**: <100ms
- **User Interactions**: <16ms (60fps)
- **Memory Usage**: <1MB increase per operation
- **Concurrent Users**: 1000+ without degradation
```

## 🔗 Related Resources

- [SubApp Creation Prompts](./subapp-creation.md)
- [SubApp Integration Prompts](./subapp-integration.md)
- [Performance Analysis Prompts](../optimization/performance-analysis.md)

<!-- AI-CONTEXT-BOUNDARY: end -->