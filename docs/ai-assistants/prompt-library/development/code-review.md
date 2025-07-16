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
# Code Review Prompts

> Systematic prompts for AI-assisted code review following Kodix standards and best practices

## 🎯 Purpose

Provide comprehensive prompts for conducting thorough code reviews with AI assistance, ensuring adherence to Kodix patterns, security standards, and code quality requirements.

## 🔍 Comprehensive Code Review

### Full Code Review Prompt Template

```markdown
**Task**: Conduct a comprehensive code review for Kodix platform code

**Context**: Kodix platform using Next.js 15, tRPC v11, React 19, Drizzle ORM, MySQL

**Code to Review**: [PROVIDE_CODE_OR_FILE_PATH]

**Review Criteria**:
1. **Kodix Standards Compliance**
2. **Security & Team Isolation**
3. **Type Safety & Code Quality**
4. **Performance & Optimization**
5. **Testing & Documentation**

**Standards to Check**:
- No 'any' types in TypeScript
- Team-based data isolation (mandatory teamId filtering)
- Proper error handling with TRPCError
- ESLint rules compliance
- i18n for all user-facing strings
- Comprehensive input validation

**Security Focus**:
- Authentication and authorization checks
- Team isolation enforcement
- Input sanitization and validation
- SQL injection prevention
- XSS protection

**Output Format**:
1. **Overall Assessment** (Pass/Needs Work/Reject)
2. **Critical Issues** (Must fix before merge)
3. **Security Concerns** (Security vulnerabilities)
4. **Improvement Suggestions** (Best practices)
5. **Code Quality Score** (1-10 with reasoning)

Please provide specific line numbers and detailed explanations for each issue found.
```

## 🔒 Security-Focused Review

### Security Review Prompt

```markdown
**Task**: Security-focused code review for Kodix platform

**Code**: [CODE_TO_REVIEW]

**Security Checklist**:

**1. Authentication & Authorization**
- [ ] Uses protectedProcedure for sensitive operations
- [ ] Proper session validation
- [ ] Role-based access control
- [ ] Permission checks before data access

**2. Team Isolation**
- [ ] All queries filter by teamId
- [ ] No cross-team data access
- [ ] User can only access own team's data
- [ ] Admin operations properly scoped

**3. Input Validation**
- [ ] All inputs validated with Zod schemas
- [ ] UUID format validation
- [ ] String length limits enforced
- [ ] Enum values properly constrained

**4. Data Exposure**
- [ ] Sensitive fields excluded from responses
- [ ] No password or token leakage
- [ ] Proper error message sanitization
- [ ] No internal system information exposed

**5. SQL Injection Prevention**
- [ ] Parameterized queries only
- [ ] No dynamic SQL construction
- [ ] Drizzle ORM used correctly
- [ ] No raw SQL with user input

**Example Issues to Flag**:
```typescript
// ❌ Security Issues
// Missing team isolation
const users = await db.query.users.findMany(); // No teamId filter!

// Missing input validation
.input(z.object({
  id: z.string(), // Should be z.string().uuid()
}))

// Exposing sensitive data
return {
  ...user,
  password: user.password, // Should be excluded!
};

// ✅ Secure Implementation
const users = await db.query.users.findMany({
  where: eq(users.teamId, ctx.session.teamId), // Team isolation
});
```

**Report Format**:
- 🚨 **Critical**: Security vulnerabilities requiring immediate fix
- ⚠️ **High**: Security issues that should be addressed
- 💡 **Medium**: Security improvements recommended
- ✅ **Pass**: Security requirements met
```

## 🎨 Frontend Code Review

### React Component Review

```markdown
**Task**: Review React component for Kodix standards

**Component**: [COMPONENT_CODE]

**Frontend Review Criteria**:

**1. Component Structure**
- [ ] Proper TypeScript interface for props
- [ ] No 'any' types used
- [ ] Loading and error states handled
- [ ] Skeleton components for loading states

**2. Data Fetching**
- [ ] Uses useTRPC() hook (not direct api import)
- [ ] Proper error handling with try-catch
- [ ] Loading states with user feedback
- [ ] Optimistic updates where appropriate

**3. UI/UX Standards**
- [ ] Uses shadcn/ui components as base
- [ ] Responsive design with Tailwind CSS
- [ ] Accessibility attributes (ARIA labels)
- [ ] Keyboard navigation support

**4. Internationalization**
- [ ] All strings use useTranslation hook
- [ ] No hardcoded text
- [ ] Proper key organization
- [ ] Pluralization handled correctly

**5. Performance**
- [ ] Memoization where appropriate (useMemo, useCallback)
- [ ] No unnecessary re-renders
- [ ] Lazy loading for heavy components
- [ ] Efficient list rendering with keys

**Example Review**:
```typescript
// ❌ Issues Found
function UserList({ teamId }: { teamId: any }) { // Issue: 'any' type
  const { data } = api.user.findMany.useQuery({ teamId }); // Issue: Direct api import
  
  return (
    <div>
      <h1>Users</h1> {/* Issue: Hardcoded string */}
      {data?.map(user => (
        <div key={user.id}>{user.name}</div> // Issue: Missing loading state
      ))}
    </div>
  );
}

// ✅ Fixed Version
interface UserListProps {
  teamId: string; // Fixed: Proper type
}

function UserList({ teamId }: UserListProps) {
  const { t } = useTranslation(); // Fixed: i18n
  const trpc = useTRPC(); // Fixed: Proper hook usage
  
  const { data, isLoading, error } = trpc.user.findMany.useQuery({
    teamId,
  });
  
  if (isLoading) return <UserListSkeleton />; // Fixed: Loading state
  if (error) return <div>{t('common.error')}: {error.message}</div>; // Fixed: Error handling
  
  return (
    <div>
      <h1>{t('users.title')}</h1> {/* Fixed: i18n */}
      {data?.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```
```

## 🔧 Backend Code Review

### API Endpoint Review

```markdown
**Task**: Review tRPC API endpoint implementation

**Endpoint**: [ROUTER_CODE]

**Backend Review Criteria**:

**1. tRPC Best Practices**
- [ ] Uses protectedProcedure for authenticated endpoints
- [ ] Proper input validation with Zod
- [ ] Consistent error handling with TRPCError
- [ ] Appropriate procedure type (query vs mutation)

**2. Service Layer Integration**
- [ ] Business logic in service classes
- [ ] Data access through repository pattern
- [ ] Proper dependency injection
- [ ] Clean separation of concerns

**3. Database Operations**
- [ ] Team isolation enforced
- [ ] Proper indexing considerations
- [ ] Transaction usage for multi-step operations
- [ ] Optimized queries (no N+1 problems)

**4. Error Handling**
- [ ] Comprehensive try-catch blocks
- [ ] Meaningful error messages
- [ ] Proper error codes (400, 401, 403, 404, 500)
- [ ] No sensitive information in errors

**Example Review**:
```typescript
// ❌ Issues Found
export const userRouter = createTRPCRouter({
  getUsers: publicProcedure // Issue: Should be protected
    .query(async ({ ctx }) => {
      return ctx.db.query.users.findMany(); // Issue: No team isolation
    }),
    
  createUser: protectedProcedure
    .input(z.object({
      name: z.string(), // Issue: No length validation
      email: z.string(), // Issue: No email validation
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.insert(users).values(input); // Issue: No error handling
      return user;
    }),
});

// ✅ Fixed Version
export const userRouter = createTRPCRouter({
  getUsers: protectedProcedure // Fixed: Protected
    .query(async ({ ctx }) => {
      try {
        return await ctx.db.query.users.findMany({
          where: eq(users.teamId, ctx.session.teamId), // Fixed: Team isolation
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch users",
        });
      }
    }),
    
  createUser: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255), // Fixed: Length validation
      email: z.string().email(), // Fixed: Email validation
      teamId: z.string().uuid(), // Fixed: Added teamId
    }))
    .mutation(async ({ ctx, input }) => {
      // Fixed: Team access validation
      if (input.teamId !== ctx.session.teamId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot create users for other teams",
        });
      }
      
      try {
        const service = new UserService(ctx.db);
        return await service.create(input); // Fixed: Service layer
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }
    }),
});
```
```

## 📊 Performance Review

### Performance Optimization Review

```markdown
**Task**: Review code for performance optimization

**Code**: [CODE_TO_REVIEW]

**Performance Checklist**:

**1. Database Performance**
- [ ] Proper indexes on queried fields
- [ ] Limit/offset for pagination
- [ ] Avoid N+1 query problems
- [ ] Efficient joins and relations

**2. Frontend Performance**
- [ ] Component memoization where needed
- [ ] Lazy loading for routes and components
- [ ] Efficient state updates
- [ ] Optimized re-renders

**3. API Performance**
- [ ] Response size optimization
- [ ] Caching strategies
- [ ] Batch operations where possible
- [ ] Async operations properly handled

**4. Bundle Performance**
- [ ] No unnecessary dependencies
- [ ] Tree-shaking friendly imports
- [ ] Dynamic imports for large modules
- [ ] Optimal chunk splitting

**Performance Issues to Flag**:
```typescript
// ❌ Performance Issues
// N+1 Query Problem
const users = await db.query.users.findMany();
for (const user of users) {
  const posts = await db.query.posts.findMany({
    where: eq(posts.userId, user.id), // N+1!
  });
}

// Unnecessary re-renders
function UserList({ users }) {
  return (
    <div>
      {users.map(user => (
        <UserCard 
          key={user.id} 
          user={user}
          onUpdate={() => updateUser(user.id)} // New function every render!
        />
      ))}
    </div>
  );
}

// ✅ Optimized Version
// Fixed: Use relations to avoid N+1
const usersWithPosts = await db.query.users.findMany({
  with: {
    posts: true,
  },
});

// Fixed: Memoized callback
function UserList({ users }) {
  const handleUpdate = useCallback((userId: string) => {
    updateUser(userId);
  }, [updateUser]);

  return (
    <div>
      {users.map(user => (
        <UserCard 
          key={user.id} 
          user={user}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
}
```
```

## 🧪 Testing Review

### Test Coverage Review

```markdown
**Task**: Review test coverage and quality

**Test Code**: [TEST_FILES]

**Testing Review Criteria**:

**1. Test Coverage**
- [ ] Unit tests for business logic
- [ ] Integration tests for API endpoints
- [ ] Component tests for UI behavior
- [ ] E2E tests for critical workflows

**2. Test Quality**
- [ ] Clear test descriptions
- [ ] Proper setup and teardown
- [ ] Isolated test cases
- [ ] Meaningful assertions

**3. Test Data**
- [ ] Realistic test data
- [ ] Team isolation in tests
- [ ] Mock data consistency
- [ ] Cleanup after tests

**4. Edge Cases**
- [ ] Error scenarios tested
- [ ] Boundary conditions
- [ ] Permission edge cases
- [ ] Data validation failures

**Test Issues to Flag**:
```typescript
// ❌ Test Issues
describe('UserService', () => {
  it('works', async () => { // Issue: Vague description
    const result = await userService.create({
      name: 'Test',
      // Issue: Missing required fields
    });
    expect(result).toBeTruthy(); // Issue: Weak assertion
  });
});

// ✅ Better Test
describe('UserService', () => {
  describe('create', () => {
    it('should create user with valid data and enforce team isolation', async () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        teamId: 'team-123',
      };
      
      const result = await userService.create(input);
      
      expect(result).toMatchObject({
        id: expect.any(String),
        name: 'John Doe',
        email: 'john@example.com',
        teamId: 'team-123',
        createdAt: expect.any(Date),
      });
    });
    
    it('should reject creation for different team', async () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        teamId: 'different-team',
      };
      
      await expect(userService.create(input))
        .rejects
        .toThrow('Cannot create users for other teams');
    });
  });
});
```
```

## 🔗 Related Resources

- [Feature Implementation Prompts](./feature-implementation.md)
- [Bug Fixing Prompts](./bug-fixing.md)
- [Architecture Decision Prompts](./architecture-decisions.md)

<!-- AI-CONTEXT-BOUNDARY: end -->