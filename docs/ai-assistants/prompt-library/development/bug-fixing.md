<!-- AI-METADATA:
category: prompt-library
complexity: intermediate
updated: 2025-01-12
claude-ready: true
phase: 4
priority: high
token-optimized: true
audience: developers
ai-context-weight: critical
-->

<!-- AI-CONTEXT-BOUNDARY: start -->
# Bug Fixing Prompts

> Systematic prompts for debugging and fixing issues in the Kodix platform

## 🎯 Purpose

Provide structured debugging approaches and proven prompts for efficiently identifying and resolving bugs in Kodix applications.

## 🔍 Systematic Debug Approach

### Universal Debug Prompt Template

```markdown
**Bug Report**: [BUG_DESCRIPTION]

**Context**: Kodix platform - Next.js 15, tRPC v11, React 19, Drizzle ORM, MySQL

**Error Details**:
- **Type**: [Frontend/Backend/Database/Build/Runtime]
- **Location**: [FILE:LINE or COMPONENT/API]
- **Message**: [EXACT_ERROR_MESSAGE]
- **Reproduction**: [STEPS_TO_REPRODUCE]
- **Environment**: [Development/Staging/Production]

**Debug Protocol**:
1. **Analyze the error** - understand the root cause
2. **Add strategic logging** - trace data flow
3. **Check common issues** - team isolation, validation, types
4. **Verify fix** - ensure no side effects
5. **Clean up** - remove temporary logs

**Constraints**:
- No 'any' types in solutions
- Maintain team isolation
- Follow existing patterns
- Preserve backward compatibility

**Reference Files**: [RELATED_FILES_TO_CHECK]

Please follow the debug protocol systematically and provide a complete fix.
```

## 🐛 Frontend Bug Fixes

### React Component Issues

```markdown
**Task**: Debug React component issue

**Issue**: [COMPONENT_PROBLEM_DESCRIPTION]
**Component**: [COMPONENT_NAME]
**Error**: [ERROR_MESSAGE]
**Browser Console**: [CONSOLE_ERRORS]

**Debug Steps**:
1. Check React DevTools for component state
2. Verify props are being passed correctly
3. Check for missing keys in lists
4. Validate hooks usage and dependencies
5. Ensure proper error boundaries

**Common Issues & Solutions**:

**Issue**: Component not re-rendering
```typescript
// ❌ Common mistake - direct state mutation
const [items, setItems] = useState([]);
items.push(newItem); // Wrong!

// ✅ Correct approach
setItems(prev => [...prev, newItem]);
```

**Issue**: Infinite re-renders
```typescript
// ❌ Missing dependency
useEffect(() => {
  fetchData();
}, []); // Missing dependency

// ✅ Correct dependencies
useEffect(() => {
  fetchData();
}, [teamId, filters]);
```

**Issue**: Stale closures
```typescript
// ❌ Stale closure
useEffect(() => {
  const interval = setInterval(() => {
    setCount(count + 1); // Stale count
  }, 1000);
  return () => clearInterval(interval);
}, []);

// ✅ Use functional update
useEffect(() => {
  const interval = setInterval(() => {
    setCount(prev => prev + 1);
  }, 1000);
  return () => clearInterval(interval);
}, []);
```

**Debug Pattern**:
1. Add console.logs to trace render cycles
2. Check if error boundaries are catching issues
3. Verify key props for list items
4. Test with React Strict Mode
5. Use React DevTools Profiler

Please analyze the issue and provide a fix following Kodix patterns.
```

### State Management Issues

```markdown
**Task**: Debug state management issue

**Issue**: [STATE_PROBLEM_DESCRIPTION]
**Store**: [ZUSTAND_STORE_NAME]
**Symptoms**: [OBSERVABLE_BEHAVIOR]

**Debug Steps**:
1. Check store initialization
2. Verify state updates are immutable
3. Check for circular dependencies
4. Validate persistence configuration
5. Test state synchronization

**Common Zustand Issues**:

**Issue**: State not persisting
```typescript
// ❌ Missing persist configuration
export const useStore = create((set) => ({
  value: 0,
  setValue: (value) => set({ value }),
}));

// ✅ With proper persistence
export const useStore = create(
  persist(
    (set) => ({
      value: 0,
      setValue: (value) => set({ value }),
    }),
    {
      name: 'store-name',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

**Issue**: State mutations
```typescript
// ❌ Direct mutation
set((state) => {
  state.items.push(newItem); // Wrong!
  return state;
});

// ✅ Immutable update
set((state) => ({
  ...state,
  items: [...state.items, newItem],
}));
```

**Debug with DevTools**:
```typescript
// Add this for development debugging
export const useStore = create(
  devtools(
    persist(
      (set) => ({
        // store definition
      }),
      { name: 'store-name' }
    ),
    { name: 'store-debug' }
  )
);
```

Please identify the state management issue and provide a fix.
```

## 🔧 Backend Bug Fixes

### tRPC API Issues

```markdown
**Task**: Debug tRPC API issue

**Issue**: [API_PROBLEM_DESCRIPTION]
**Endpoint**: [ROUTER.PROCEDURE]
**Error**: [TRPC_ERROR_MESSAGE]
**Status Code**: [HTTP_STATUS]

**Debug Steps**:
1. Check procedure authentication
2. Verify input validation schemas
3. Test team isolation logic
4. Check database queries
5. Validate error handling

**Common tRPC Issues**:

**Issue**: UNAUTHORIZED errors
```typescript
// ❌ Missing authentication
export const userRouter = createTRPCRouter({
  getUsers: publicProcedure // Wrong!
    .query(async ({ ctx }) => {
      // This should be protected
    }),
});

// ✅ Proper authentication
export const userRouter = createTRPCRouter({
  getUsers: protectedProcedure
    .query(async ({ ctx }) => {
      // ctx.session is guaranteed to exist
    }),
});
```

**Issue**: Team isolation failures
```typescript
// ❌ Missing team isolation
.query(async ({ ctx, input }) => {
  return ctx.db.query.users.findMany(); // Wrong! No team filter
});

// ✅ Proper team isolation
.query(async ({ ctx, input }) => {
  return ctx.db.query.users.findMany({
    where: eq(users.teamId, ctx.session.teamId),
  });
});
```

**Issue**: Validation errors
```typescript
// ❌ Weak validation
.input(z.object({
  id: z.string(), // Should validate UUID format
}))

// ✅ Strong validation
.input(z.object({
  id: z.string().uuid("Invalid user ID format"),
  teamId: z.string().uuid("Invalid team ID format"),
}))
```

**Debug Logging**:
```typescript
.query(async ({ ctx, input }) => {
  console.log('[DEBUG] Input:', input);
  console.log('[DEBUG] Session:', ctx.session);
  
  try {
    const result = await service.getData(input);
    console.log('[DEBUG] Result:', result);
    return result;
  } catch (error) {
    console.error('[DEBUG] Error:', error);
    throw error;
  }
});
```

Please identify the API issue and provide a fix with proper error handling.
```

### Database Query Issues

```markdown
**Task**: Debug database query issue

**Issue**: [DATABASE_PROBLEM_DESCRIPTION]
**Query**: [DRIZZLE_QUERY]
**Error**: [SQL_ERROR_MESSAGE]
**Performance**: [SLOW/TIMEOUT/DEADLOCK]

**Debug Steps**:
1. Check query syntax and joins
2. Verify indexes are being used
3. Test query performance
4. Check for N+1 problems
5. Validate transaction handling

**Common Database Issues**:

**Issue**: Missing indexes
```sql
-- ❌ Slow query without index
SELECT * FROM users WHERE team_id = ? AND created_at > ?;

-- ✅ Add compound index
CREATE INDEX idx_users_team_created ON users(team_id, created_at);
```

```typescript
// Corresponding Drizzle schema
export const users = mysqlTable("users", {
  // ... fields
}, (table) => ({
  teamCreatedIdx: index("idx_users_team_created").on(table.teamId, table.createdAt),
}));
```

**Issue**: N+1 Query Problem
```typescript
// ❌ N+1 problem
const users = await db.query.users.findMany();
for (const user of users) {
  const posts = await db.query.posts.findMany({
    where: eq(posts.userId, user.id),
  });
}

// ✅ Use joins or batch queries
const usersWithPosts = await db.query.users.findMany({
  with: {
    posts: true,
  },
});
```

**Issue**: Transaction deadlocks
```typescript
// ❌ Inconsistent lock order
async function transferPoints(fromUserId, toUserId, amount) {
  await db.transaction(async (tx) => {
    await tx.update(users).set({ points: sql`points - ${amount}` })
      .where(eq(users.id, fromUserId));
    await tx.update(users).set({ points: sql`points + ${amount}` })
      .where(eq(users.id, toUserId));
  });
}

// ✅ Consistent lock order
async function transferPoints(fromUserId, toUserId, amount) {
  const [firstId, secondId] = [fromUserId, toUserId].sort();
  
  await db.transaction(async (tx) => {
    // Lock in consistent order
    await tx.select().from(users)
      .where(inArray(users.id, [firstId, secondId]))
      .for('update');
      
    // Then perform updates
    // ... update logic
  });
}
```

**Performance Debugging**:
```typescript
// Add query logging
const start = Date.now();
const result = await db.query.users.findMany({
  where: eq(users.teamId, teamId),
});
console.log(`Query took ${Date.now() - start}ms`);

// Log the SQL
console.log('SQL:', db.query.users.findMany({
  where: eq(users.teamId, teamId),
}).toSQL());
```

Please analyze the database issue and provide an optimized solution.
```

## 🎨 UI/UX Bug Fixes

### Styling and Layout Issues

```markdown
**Task**: Debug UI styling issue

**Issue**: [UI_PROBLEM_DESCRIPTION]
**Component**: [COMPONENT_NAME]
**Browser**: [CHROME/FIREFOX/SAFARI]
**Viewport**: [DESKTOP/TABLET/MOBILE]

**Debug Steps**:
1. Check browser DevTools for CSS issues
2. Verify Tailwind classes are applied
3. Test responsive breakpoints
4. Check for CSS specificity conflicts
5. Validate accessibility

**Common UI Issues**:

**Issue**: Layout breaks on mobile
```typescript
// ❌ Not responsive
<div className="flex w-full">
  <div className="w-1/3">Sidebar</div>
  <div className="w-2/3">Content</div>
</div>

// ✅ Responsive design
<div className="flex flex-col lg:flex-row w-full">
  <div className="w-full lg:w-1/3">Sidebar</div>
  <div className="w-full lg:w-2/3">Content</div>
</div>
```

**Issue**: Dark mode not working
```typescript
// ❌ Hard-coded colors
<div className="bg-white text-black">
  Content
</div>

// ✅ Theme-aware colors
<div className="bg-background text-foreground">
  Content
</div>
```

**Issue**: Component overflow
```typescript
// ❌ No overflow handling
<div className="w-64">
  <p>{veryLongText}</p>
</div>

// ✅ Proper overflow handling
<div className="w-64">
  <p className="truncate" title={veryLongText}>
    {veryLongText}
  </p>
</div>
```

**Debug CSS with DevTools**:
1. Inspect element to see computed styles
2. Check for CSS conflicts
3. Verify Tailwind classes are loaded
4. Test with different screen sizes
5. Validate contrast ratios

Please identify the UI issue and provide a fix following design system patterns.
```

### Accessibility Issues

```markdown
**Task**: Fix accessibility issue

**Issue**: [A11Y_PROBLEM_DESCRIPTION]
**WCAG Level**: [A/AA/AAA]
**Assistive Technology**: [SCREEN_READER/KEYBOARD/VOICE]

**Debug Steps**:
1. Test with screen reader (NVDA/JAWS/VoiceOver)
2. Check keyboard navigation
3. Verify color contrast ratios
4. Test focus management
5. Validate ARIA attributes

**Common A11Y Fixes**:

**Issue**: Missing ARIA labels
```typescript
// ❌ No accessible name
<Button onClick={onDelete}>
  <TrashIcon />
</Button>

// ✅ Proper ARIA label
<Button 
  onClick={onDelete}
  aria-label={t('common.delete', { item: itemName })}
>
  <TrashIcon />
</Button>
```

**Issue**: Poor focus management
```typescript
// ❌ No focus management
function Modal({ isOpen, onClose }) {
  return (
    <div className={isOpen ? 'block' : 'hidden'}>
      <div className="modal-content">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

// ✅ Proper focus management
function Modal({ isOpen, onClose }) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);
  
  return (
    <div 
      className={isOpen ? 'block' : 'hidden'}
      role="dialog"
      aria-modal="true"
      ref={modalRef}
      tabIndex={-1}
    >
      <div className="modal-content">
        <Button onClick={onClose}>
          {t('common.close')}
        </Button>
      </div>
    </div>
  );
}
```

**Issue**: Keyboard navigation problems
```typescript
// ❌ Missing keyboard support
<div onClick={handleClick}>
  Clickable item
</div>

// ✅ Keyboard accessible
<div 
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  tabIndex={0}
  role="button"
>
  Clickable item
</div>
```

Please fix the accessibility issue following WCAG guidelines.
```

## 🔒 Security Bug Fixes

### Security Vulnerability Fixes

```markdown
**Task**: Fix security vulnerability

**Vulnerability**: [SECURITY_ISSUE_DESCRIPTION]
**Severity**: [LOW/MEDIUM/HIGH/CRITICAL]
**Attack Vector**: [XSS/SQL_INJECTION/CSRF/AUTH_BYPASS]

**Security Review Steps**:
1. Validate input sanitization
2. Check authentication/authorization
3. Verify team isolation
4. Test for injection attacks
5. Review data exposure

**Common Security Fixes**:

**Issue**: Missing input validation
```typescript
// ❌ No validation
.mutation(async ({ ctx, input }) => {
  const user = await ctx.db.query.users.findFirst({
    where: eq(users.id, input.userId), // Potential injection
  });
});

// ✅ Proper validation
.input(z.object({
  userId: z.string().uuid("Invalid user ID"),
}))
.mutation(async ({ ctx, input }) => {
  const user = await ctx.db.query.users.findFirst({
    where: eq(users.id, input.userId),
  });
});
```

**Issue**: Team isolation bypass
```typescript
// ❌ Missing team check
.mutation(async ({ ctx, input }) => {
  return ctx.db.update(documents)
    .set(input.updates)
    .where(eq(documents.id, input.id)); // Can update any document!
});

// ✅ Proper team isolation
.mutation(async ({ ctx, input }) => {
  return ctx.db.update(documents)
    .set(input.updates)
    .where(and(
      eq(documents.id, input.id),
      eq(documents.teamId, ctx.session.teamId) // Team isolation
    ));
});
```

**Issue**: Data exposure
```typescript
// ❌ Exposing sensitive data
.query(async ({ ctx }) => {
  return ctx.db.query.users.findMany({
    columns: {
      password: false, // Good
      // But missing other sensitive fields
    },
  });
});

// ✅ Explicit field selection
.query(async ({ ctx }) => {
  return ctx.db.query.users.findMany({
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      // Explicitly exclude sensitive fields
      password: false,
      apiKey: false,
      resetToken: false,
    },
  });
});
```

Please fix the security vulnerability following security best practices.
```

## 📊 Performance Bug Fixes

### Performance Optimization

```markdown
**Task**: Fix performance issue

**Issue**: [PERFORMANCE_PROBLEM_DESCRIPTION]
**Metric**: [LOAD_TIME/MEMORY_USAGE/CPU_USAGE]
**Target**: [PERFORMANCE_GOAL]

**Performance Debug Steps**:
1. Profile with browser DevTools
2. Check bundle size analysis
3. Measure Core Web Vitals
4. Analyze database queries
5. Review caching strategies

**Common Performance Fixes**:

**Issue**: Large bundle size
```typescript
// ❌ Importing entire library
import { format, parse, isValid } from 'date-fns';

// ✅ Tree-shakable imports
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import isValid from 'date-fns/isValid';
```

**Issue**: Unnecessary re-renders
```typescript
// ❌ Creating objects in render
function UserList({ users }) {
  return (
    <div>
      {users.map(user => (
        <UserCard 
          key={user.id} 
          user={user}
          actions={{ edit: () => {}, delete: () => {} }} // New object every render!
        />
      ))}
    </div>
  );
}

// ✅ Memoized callbacks
function UserList({ users }) {
  const actions = useMemo(() => ({
    edit: (id) => {},
    delete: (id) => {},
  }), []);
  
  return (
    <div>
      {users.map(user => (
        <UserCard 
          key={user.id} 
          user={user}
          actions={actions}
        />
      ))}
    </div>
  );
}
```

**Issue**: Inefficient queries
```typescript
// ❌ Loading unnecessary data
const { data: users } = trpc.user.findMany.useQuery({
  teamId,
  // Loading all fields and related data
});

// ✅ Selective loading
const { data: users } = trpc.user.findMany.useQuery({
  teamId,
  select: {
    id: true,
    name: true,
    email: true,
    // Only fields needed for the UI
  },
});
```

Please identify the performance bottleneck and provide an optimized solution.
```

## 🔗 Related Resources

- [Feature Implementation Prompts](./feature-implementation.md)
- [Code Review Prompts](./code-review.md)
- [Architecture Decision Prompts](./architecture-decisions.md)

<!-- AI-CONTEXT-BOUNDARY: end -->