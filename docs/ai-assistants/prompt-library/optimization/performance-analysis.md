<!-- AI-METADATA:
category: prompt-library
complexity: intermediate
updated: 2025-01-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: developers
ai-context-weight: important
-->

<!-- AI-CONTEXT-BOUNDARY: start -->
# Performance Analysis Prompts

> Systematic prompts for AI-assisted performance analysis and optimization in the Kodix platform

## 🎯 Purpose

Provide comprehensive prompts for analyzing and optimizing performance across the Kodix stack, from frontend rendering to database queries, ensuring scalable and efficient implementations.

## ⚡ Frontend Performance Analysis

### React Component Performance

```markdown
**Task**: Analyze React component performance in Kodix platform

**Component Code**: [COMPONENT_TO_ANALYZE]

**Performance Analysis Framework**:

**1. Rendering Performance**
- [ ] Unnecessary re-renders identification
- [ ] Component memoization opportunities
- [ ] State management efficiency
- [ ] Prop drilling issues

**2. Bundle Impact**
- [ ] Component size analysis
- [ ] Import efficiency
- [ ] Code splitting opportunities
- [ ] Tree-shaking effectiveness

**3. User Experience Metrics**
- [ ] First Contentful Paint (FCP)
- [ ] Largest Contentful Paint (LCP)
- [ ] Cumulative Layout Shift (CLS)
- [ ] Time to Interactive (TTI)

**Analysis Questions**:
1. What causes unnecessary re-renders?
2. Which operations are computationally expensive?
3. How can we optimize data fetching?
4. What are the bundle size implications?

**Output Format**:
- **Performance Score** (1-10 with detailed reasoning)
- **Critical Issues** (immediate optimizations needed)
- **Optimization Opportunities** (potential improvements)
- **Implementation Plan** (step-by-step optimization strategy)

**Example Analysis**:
```typescript
// ❌ Performance Issues
function UserList({ teamId }: { teamId: string }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Issue: Expensive operation on every render
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Issue: New function created on every render
  const handleUserClick = (userId: string) => {
    navigate(`/users/${userId}`);
  };
  
  return (
    <div>
      {filteredUsers.map(user => (
        <UserCard 
          key={user.id} 
          user={user}
          onClick={handleUserClick} // Causes unnecessary re-renders
        />
      ))}
    </div>
  );
}

// ✅ Optimized Version
function UserList({ teamId }: { teamId: string }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fixed: Memoized filtering
  const filteredUsers = useMemo(() => 
    users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [users, searchTerm]
  );
  
  // Fixed: Memoized callback
  const handleUserClick = useCallback((userId: string) => {
    navigate(`/users/${userId}`);
  }, [navigate]);
  
  return (
    <div>
      {filteredUsers.map(user => (
        <UserCard 
          key={user.id} 
          user={user}
          onClick={handleUserClick}
        />
      ))}
    </div>
  );
}
```

**Performance Recommendations**:
1. Use React.memo for expensive components
2. Implement useMemo for expensive calculations
3. Use useCallback for stable function references
4. Consider virtualization for large lists
```

## 🗄️ Database Performance Analysis

### Query Performance Review

```markdown
**Task**: Analyze database query performance for Kodix platform

**Query/Code**: [DATABASE_OPERATIONS_TO_ANALYZE]

**Database Performance Framework**:

**1. Query Efficiency**
- [ ] Index usage analysis
- [ ] Query execution plan review
- [ ] N+1 query detection
- [ ] Join optimization opportunities

**2. Data Access Patterns**
- [ ] Team isolation efficiency
- [ ] Pagination implementation
- [ ] Bulk operation optimization
- [ ] Transaction boundary analysis

**3. Scalability Considerations**
- [ ] Query performance under load
- [ ] Index strategy for growth
- [ ] Memory usage patterns
- [ ] Connection pool efficiency

**Analysis Process**:
1. **Identify bottlenecks** in query patterns
2. **Measure actual performance** with realistic data
3. **Propose optimizations** with implementation details
4. **Validate improvements** with benchmarks

**Example Analysis**:
```typescript
// ❌ Performance Issues
// N+1 Query Problem
async function getUsersWithPosts(teamId: string) {
  const users = await db.query.users.findMany({
    where: eq(users.teamId, teamId),
  });
  
  // Issue: N+1 queries - one query per user
  const usersWithPosts = await Promise.all(
    users.map(async (user) => ({
      ...user,
      posts: await db.query.posts.findMany({
        where: eq(posts.userId, user.id),
      }),
    }))
  );
  
  return usersWithPosts;
}

// ✅ Optimized Version
async function getUsersWithPosts(teamId: string) {
  // Fixed: Single query with relations
  const usersWithPosts = await db.query.users.findMany({
    where: eq(users.teamId, teamId),
    with: {
      posts: {
        where: eq(posts.teamId, teamId), // Maintain team isolation
        orderBy: desc(posts.createdAt),
        limit: 10, // Limit to recent posts
      },
    },
  });
  
  return usersWithPosts;
}

// Advanced: Query with proper indexing
CREATE INDEX idx_users_team_id ON users(team_id);
CREATE INDEX idx_posts_user_team ON posts(user_id, team_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

**Performance Metrics to Track**:
- Query execution time (target: <50ms average)
- Database connection usage
- Memory consumption per query
- Index hit ratio (target: >95%)
```

## 🔧 API Performance Analysis

### tRPC Endpoint Optimization

```markdown
**Task**: Analyze tRPC API endpoint performance

**API Code**: [TRPC_ROUTER_TO_ANALYZE]

**API Performance Framework**:

**1. Response Time Analysis**
- [ ] Endpoint response times
- [ ] Data serialization overhead
- [ ] Middleware performance impact
- [ ] Error handling efficiency

**2. Throughput Optimization**
- [ ] Concurrent request handling
- [ ] Rate limiting effectiveness
- [ ] Cache hit ratios
- [ ] Connection pooling

**3. Resource Utilization**
- [ ] Memory usage per request
- [ ] CPU utilization patterns
- [ ] Database connection usage
- [ ] Network bandwidth efficiency

**Analysis Template**:
```typescript
// ❌ Performance Issues
export const userRouter = createTRPCRouter({
  getUsers: protectedProcedure
    .query(async ({ ctx }) => {
      // Issue: No pagination
      const users = await ctx.db.query.users.findMany({
        where: eq(users.teamId, ctx.session.teamId),
      });
      
      // Issue: Over-fetching data
      return users.map(user => ({
        ...user,
        password: undefined, // Still sends password then removes it
        settings: JSON.parse(user.settings || '{}'), // Expensive parsing
      }));
    }),
    
  getUserDetails: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Issue: Multiple separate queries
      const user = await ctx.db.query.users.findFirst({
        where: and(
          eq(users.id, input.userId),
          eq(users.teamId, ctx.session.teamId)
        ),
      });
      
      const posts = await ctx.db.query.posts.findMany({
        where: eq(posts.userId, input.userId),
      });
      
      const comments = await ctx.db.query.comments.findMany({
        where: eq(comments.userId, input.userId),
      });
      
      return { user, posts, comments };
    }),
});

// ✅ Optimized Version
export const userRouter = createTRPCRouter({
  getUsers: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;
      
      // Fixed: Pagination and selective fields
      const users = await ctx.db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        createdAt: users.createdAt,
        // Exclude sensitive fields entirely
      })
      .from(users)
      .where(eq(users.teamId, ctx.session.teamId))
      .limit(input.limit)
      .offset(offset);
      
      const total = await ctx.db.select({ count: count() })
        .from(users)
        .where(eq(users.teamId, ctx.session.teamId));
      
      return {
        users,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: total[0].count,
          pages: Math.ceil(total[0].count / input.limit),
        },
      };
    }),
    
  getUserDetails: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Fixed: Single query with relations
      const userDetails = await ctx.db.query.users.findFirst({
        where: and(
          eq(users.id, input.userId),
          eq(users.teamId, ctx.session.teamId)
        ),
        with: {
          posts: {
            limit: 10,
            orderBy: desc(posts.createdAt),
          },
          comments: {
            limit: 10,
            orderBy: desc(comments.createdAt),
          },
        },
      });
      
      if (!userDetails) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }
      
      return userDetails;
    }),
});
```

**Performance Targets**:
- API response time: <200ms (95th percentile)
- Database queries per request: <3
- Memory usage per request: <10MB
- Concurrent requests: 1000+ without degradation
```

## 📊 Full-Stack Performance Analysis

### End-to-End Performance Review

```markdown
**Task**: Analyze full-stack performance for a complete Kodix feature

**Feature**: [FEATURE_TO_ANALYZE]

**Full-Stack Analysis Framework**:

**1. Frontend Performance**
- [ ] Component rendering efficiency
- [ ] State management overhead
- [ ] Network request optimization
- [ ] Bundle size impact

**2. API Layer Performance**
- [ ] Endpoint response times
- [ ] Data transformation overhead
- [ ] Caching effectiveness
- [ ] Error handling impact

**3. Database Performance**
- [ ] Query optimization
- [ ] Index effectiveness
- [ ] Connection usage
- [ ] Transaction efficiency

**4. Integration Performance**
- [ ] SubApp communication overhead
- [ ] Event handling efficiency
- [ ] Cross-service data flow
- [ ] Caching strategy effectiveness

**Analysis Workflow**:
1. **Establish baseline** performance metrics
2. **Identify bottlenecks** across the stack
3. **Prioritize optimizations** by impact
4. **Implement improvements** incrementally
5. **Validate results** with measurements

**Example Full-Stack Analysis**:
```typescript
// Feature: User Dashboard with Real-time Updates

// 1. Frontend Performance Issues
function UserDashboard() {
  // ❌ Issues: Polling every second, no memoization
  const { data: users } = trpc.user.getAll.useQuery(
    { teamId },
    { refetchInterval: 1000 }
  );
  
  const { data: activities } = trpc.activity.getRecent.useQuery(
    { teamId },
    { refetchInterval: 1000 }
  );
  
  // Heavy computation on every render
  const stats = calculateDashboardStats(users, activities);
  
  return <DashboardContent stats={stats} users={users} activities={activities} />;
}

// ✅ Optimized Version
function UserDashboard() {
  // Fixed: WebSocket for real-time updates
  const { data: users } = trpc.user.getAll.useQuery({ teamId });
  const { data: activities } = trpc.activity.getRecent.useQuery({ teamId });
  
  // Real-time updates via WebSocket
  trpc.user.onUserUpdate.useSubscription(
    { teamId },
    {
      onData: (update) => {
        queryClient.setQueryData(['user', 'getAll'], (old) => 
          updateUserInList(old, update)
        );
      },
    }
  );
  
  // Memoized expensive calculations
  const stats = useMemo(() => 
    calculateDashboardStats(users, activities),
    [users, activities]
  );
  
  return <DashboardContent stats={stats} users={users} activities={activities} />;
}

// 2. API Optimization
export const userRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      // Optimized query with selective fields
      return await ctx.db.select({
        id: users.id,
        name: users.name,
        status: users.status,
        lastActive: users.lastActive,
      })
      .from(users)
      .where(eq(users.teamId, ctx.session.teamId))
      .orderBy(desc(users.lastActive));
    }),
    
  onUserUpdate: protectedProcedure
    .subscription(async function* ({ ctx }) {
      // WebSocket subscription for real-time updates
      yield* ctx.events.listen(`team:${ctx.session.teamId}:users`);
    }),
});

// 3. Database Optimization
CREATE INDEX idx_users_team_status ON users(team_id, status);
CREATE INDEX idx_users_last_active ON users(last_active DESC);
```

**Performance Monitoring**:
- Implement comprehensive logging
- Set up performance alerts
- Track user experience metrics
- Monitor resource utilization
```

## 🔗 Related Resources

- [Feature Implementation Prompts](../development/feature-implementation.md)
- [Bug Fixing Prompts](../development/bug-fixing.md)
- [Code Review Prompts](../development/code-review.md)

<!-- AI-CONTEXT-BOUNDARY: end -->