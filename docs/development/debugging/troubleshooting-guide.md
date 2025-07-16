<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="high" -->category: development
complexity: intermediate
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: all
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# Troubleshooting Guide - Kodix Platform

Comprehensive troubleshooting guide for common issues across the Kodix platform, including console errors, build failures, and runtime problems.

## 🔍 🎯 Overview

<!-- AI-COMPRESS: strategy="summary" max-tokens="150" -->
**Quick Summary**: Key points for rapid AI context understanding.
<!-- /AI-COMPRESS -->
Practical troubleshooting guide for developers working on the Kodix platform, covering common issues, debugging techniques, and resolution strategies.

### Quick Navigation
- [Console Errors](#console-errors)
- [Build Issues](#build-issues)
- [Runtime Problems](#runtime-problems)
- [Database Issues](#database-issues)
- [Authentication Problems](#authentication-problems)
- [Performance Issues](#performance-issues)

## 🔍 Console Errors

### Hydration Mismatch Errors
**Symptoms**: React hydration warnings in browser console
```
Warning: Text content did not match. Server: "..." Client: "..."
```

**Common Causes**:
- Date/time formatting differences between server and client
- Conditional rendering based on browser-only APIs
- State initialization differences

**Solutions**:
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Use suppressHydrationWarning for dynamic content
<span suppressHydrationWarning>
  {new Date().toLocaleString()}
</span>

// ✅ Use useEffect for client-only content
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

if (!mounted) return <div>Loading...</div>;
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### tRPC Connection Errors
**Symptoms**: `TRPC_ERROR` or connection timeouts
```
[TRPC_ERROR] Failed to fetch
```

**Solutions**:
1. **Check API Routes**: Verify tRPC router configuration
2. **Validate Environment**: Ensure `NEXTAUTH_URL` is correct
3. **Network Issues**: Check CORS settings and proxy configuration

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Debug tRPC calls
const utils = api.useUtils();
const query = api.user.getProfile.useQuery(undefined, {
  onError: (error) => {
    console.error('[TRPC_DEBUG] Query failed:', error);
  }
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Database Connection Issues
**Symptoms**: `Connection refused` or timeout errors

**Troubleshooting Steps**:
1. **Check Database Status**: `docker ps` to verify MySQL container
2. **Connection String**: Validate `DATABASE_URL` environment variable
3. **Network Access**: Ensure database port is accessible
4. **Permissions**: Verify database user permissions

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Test database connection
docker exec -it kodix-mysql mysql -u root -p

# Check connection from app
npm run db:studio
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🔧 Build Issues

### TypeScript Compilation Errors
**Common Issues**:
- Missing type definitions
- Incorrect import paths
- Generic type mismatches

**Solutions**:
<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Clear TypeScript cache
rm -rf .next node_modules/.cache

# Regenerate types
npm run db:generate
npm run typecheck
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Import Path Errors
**Symptoms**: `Module not found` or `Cannot resolve module`

**Solutions**:
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Use correct alias imports
import { db } from "@kdx/db";
import { auth } from "@kdx/auth";

// ❌ Avoid relative imports
import { db } from "../../packages/db";
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Build Performance Issues
**Symptoms**: Slow build times, memory issues

**Optimization**:
<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"

# Use build cache
npm run build:cache

# Analyze bundle
npm run build:analyze
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## ⚡ Runtime Problems

### Memory Leaks
**Detection**:
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Monitor memory usage
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const usage = process.memoryUsage();
    console.log('[MEMORY_DEBUG]', {
      rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`
    });
  }, 10000);
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**Common Causes**:
- Unsubscribed event listeners
- Unreleased database connections
- Large object accumulation

**Prevention**:
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Cleanup useEffect
useEffect(() => {
  const subscription = observable.subscribe(handler);
  return () => subscription.unsubscribe();
}, []);

// ✅ Close database connections
const connection = await db.getConnection();
try {
  // Database operations
} finally {
  connection.release();
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### State Management Issues
**Symptoms**: Stale state, unexpected re-renders

**Debugging**:
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// React DevTools debugging
const [state, setState] = useState(initialState);

// Debug state changes
useEffect(() => {
  console.log('[STATE_DEBUG] State changed:', state);
}, [state]);

// Zustand store debugging
const useStore = create((set, get) => ({
  // Store implementation
  debug: () => console.log('[STORE_DEBUG]', get())
}));
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🗄️ Database Issues

### Migration Failures
**Symptoms**: Schema sync errors, constraint violations

**Recovery Steps**:
<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Reset database (development only)
npm run db:reset

# Manual migration
npm run db:migrate

# Check migration status
npm run db:studio
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Query Performance
**Symptoms**: Slow database operations

**Optimization**:
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Use proper indexes
export const userTable = mysqlTable('users', {
  id: varchar('id', { length: 191 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  teamId: varchar('team_id', { length: 191 }).notNull(),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
  teamIdx: index('team_idx').on(table.teamId),
}));

// ✅ Monitor query performance
const startTime = Date.now();
const result = await db.select().from(userTable);
const duration = Date.now() - startTime;

if (duration > 100) {
  console.warn('[DB_PERF] Slow query detected:', { duration });
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🔐 Authentication Problems

### Session Issues
**Symptoms**: Unexpected logouts, session timeouts

**Debugging**:
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Check session status
import { auth } from "@kdx/auth";

export default async function Page() {
  const session = await auth();
  
  if (!session) {
    console.log('[AUTH_DEBUG] No session found');
    return <LoginPage />;
  }
  
  console.log('[AUTH_DEBUG] Session valid:', {
    userId: session.user.id,
    expires: session.expires
  });
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### JWT Token Issues
**Symptoms**: Invalid token errors, token expiration

**Solutions**:
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Token refresh handling
const { data: session, update } = useSession();

useEffect(() => {
  const refreshToken = async () => {
    if (session?.expires && new Date(session.expires) < new Date()) {
      console.log('[AUTH_DEBUG] Token expired, refreshing...');
      await update();
    }
  };
  
  refreshToken();
}, [session, update]);
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 📊 Performance Issues

### React Performance
**Symptoms**: Slow renders, UI lag

**Optimization**:
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <ComplexVisualization data={data} />;
});

// ✅ Optimize re-renders with useMemo
const processedData = useMemo(() => {
  return data.map(item => expensiveTransform(item));
}, [data]);

// ✅ Use useCallback for event handlers
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Bundle Size Issues
**Analysis**:
<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Analyze bundle size
npm run build:analyze

# Check for large dependencies
npx bundlephobia [package-name]

# Tree-shake unused code
npm run build:production
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🛠️ Debugging Tools

### Browser DevTools
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Custom debugging helpers
window.kodixDebug = {
  // Store references for debugging
  store: useStore.getState(),
  api: api,
  
  // Helper functions
  clearCache: () => localStorage.clear(),
  logState: () => console.log(useStore.getState()),
  
  // Performance monitoring
  startPerf: () => performance.mark('kodix-debug-start'),
  endPerf: () => {
    performance.mark('kodix-debug-end');
    performance.measure('kodix-operation', 'kodix-debug-start', 'kodix-debug-end');
  }
};
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Server-Side Debugging
<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Enable debug logging
DEBUG=* npm run dev

# Specific module debugging
DEBUG=trpc:* npm run dev

# Database query logging
DEBUG=drizzle:* npm run dev
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Network Debugging
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Intercept API calls
if (process.env.NODE_ENV === 'development') {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    console.log('[NETWORK_DEBUG] Request:', args[0]);
    const response = await originalFetch(...args);
    console.log('[NETWORK_DEBUG] Response:', response.status);
    return response;
  };
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🚨 Emergency Recovery

### Complete Reset (Development)
<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Nuclear option - reset everything
rm -rf node_modules .next
npm install
npm run db:reset
npm run dev
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Production Issues
<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Quick health check
curl -f http://localhost:3000/api/health

# Check logs
docker logs kodix-app --tail 100

# Restart services
docker-compose restart
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 📞 Getting Help

### Before Asking for Help
1. **Check Console**: Look for error messages and warnings
2. **Verify Environment**: Ensure all environment variables are set
3. **Test Locally**: Reproduce the issue in development
4. **Check Documentation**: Review relevant docs and guides
5. **Search Issues**: Look for similar problems in project issues

### Information to Include
- **Environment**: Development/staging/production
- **Browser/Node Version**: Specific versions
- **Steps to Reproduce**: Clear reproduction steps
- **Error Messages**: Complete error output
- **Recent Changes**: What was changed recently

---

**Status**: Living Document  
**Maintained By**: Platform Team  
**Last Updated**: 2025-07-12  
**Contributes To**: Developer Experience
