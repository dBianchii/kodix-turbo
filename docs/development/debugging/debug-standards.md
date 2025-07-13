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

# Debug & Logging Standards - Kodix

Consolidated debugging and logging standards for the entire Kodix platform, establishing consistent patterns for observability and troubleshooting.

## 🔍 🎯 Overview

<!-- AI-COMPRESS: strategy="summary" max-tokens="150" -->
**Quick Summary**: Key points for rapid AI context understanding.
<!-- /AI-COMPRESS -->
Official **debug and logging standards** for the entire Kodix project, enabling easy filtering and debugging through unique module prefixes and consistent patterns.

### Core Principles
- **Module-based Prefixes**: Unique identifiers for easy console filtering
- **Clean Console**: Remove development noise, keep essential information
- **Consistent Patterns**: Standardized logging across all SubApps and services
- **Observability First**: Logs should enhance debugging and monitoring

## 📋 Module Prefix System

### Fundamental Pattern
Each module/functionality has a **unique prefix** for easy browser console and terminal log filtering.

**Standard Format:**
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
console.log("[MODULE_PREFIX] Debug message");
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 🚀 SubApp Prefixes

| SubApp         | Prefix         | Example Usage                             |
| -------------- | -------------- | ----------------------------------------- |
| **Chat**       | `[CHAT_`       | `[CHAT_WINDOW]`, `[CHAT_SESSION]`         |
| **AI Studio**  | `[AI_STUDIO_`  | `[AI_STUDIO_MODEL]`, `[AI_STUDIO_CONFIG]` |
| **Calendar**   | `[CALENDAR_`   | `[CALENDAR_EVENT]`, `[CALENDAR_SYNC]`     |
| **Todo**       | `[TODO_`       | `[TODO_TASK]`, `[TODO_LIST]`              |
| **Kodix Care** | `[CARE_`       | `[CARE_TASK]`, `[CARE_PATIENT]`           |
| **Cupom**      | `[CUPOM_`      | `[CUPOM_VALIDATE]`, `[CUPOM_APPLY]`       |

### 🔧 Backend Services Prefixes

| Service        | Prefix         | Example Usage                             |
| -------------- | -------------- | ----------------------------------------- |
| **Database**   | `[DB_`         | `[DB_QUERY]`, `[DB_MIGRATION]`            |
| **Auth**       | `[AUTH_`       | `[AUTH_LOGIN]`, `[AUTH_TOKEN]`            |
| **API**        | `[API_`        | `[API_TRPC]`, `[API_WEBHOOK]`             |
| **Queue**      | `[QUEUE_`      | `[QUEUE_JOB]`, `[QUEUE_WORKER]`           |
| **Cache**      | `[CACHE_`      | `[CACHE_HIT]`, `[CACHE_MISS]`             |

### 🎨 Frontend Components Prefixes

| Component Type | Prefix         | Example Usage                             |
| -------------- | -------------- | ----------------------------------------- |
| **UI Components** | `[UI_`      | `[UI_BUTTON]`, `[UI_MODAL]`               |
| **Hooks**      | `[HOOK_`       | `[HOOK_AUTH]`, `[HOOK_DATA]`              |
| **State**      | `[STATE_`      | `[STATE_STORE]`, `[STATE_SYNC]`           |
| **Router**     | `[ROUTER_`     | `[ROUTER_NAV]`, `[ROUTER_GUARD]`          |

## 🧹 Log Cleanup Guidelines

### ✅ Keep These Logs
- **Critical Errors**: `console.error` for system failures, API errors, crashes
- **Important Warnings**: `console.warn` for deprecated patterns, performance issues
- **Success Confirmations**: Essential operation completions (`✅ [MODULE] Success`)
- **Authentication Events**: Login/logout, permission changes
- **Data Mutations**: Create, update, delete operations
- **Performance Metrics**: Slow queries, large data operations

### ❌ Remove These Logs
- **Development Debug**: Verbose `console.log` statements for development
- **State Changes**: Routine component state updates
- **Render Cycles**: React component render debugging
- **Repetitive Operations**: Loop iterations, frequent API calls
- **Token/Credential Info**: Any sensitive authentication data
- **Emoji/Decorative Logs**: Non-essential visual console output

## 🔧 Implementation Patterns

### Error Logging
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Good: Structured error logging
try {
  await processUserData(data);
} catch (error) {
  console.error('[AUTH_SERVICE] Failed to process user data:', {
    userId: user.id,
    error: error.message,
    timestamp: new Date().toISOString()
  });
}

// ❌ Bad: Generic error logging
try {
  await processUserData(data);
} catch (error) {
  console.log('Error:', error);
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Success Logging
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Good: Meaningful success logging
console.log('[CHAT_SESSION] ✅ Session created successfully', {
  sessionId: session.id,
  participantCount: session.participants.length
});

// ❌ Bad: Verbose success logging
console.log('🎉 Chat session created! 🚀 Ready to go! 💬');
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Performance Logging
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Good: Performance monitoring
const startTime = performance.now();
const result = await complexOperation();
const duration = performance.now() - startTime;

if (duration > 1000) {
  console.warn('[DB_QUERY] Slow query detected:', {
    query: 'getUserProjects',
    duration: `${duration.toFixed(2)}ms`,
    threshold: '1000ms'
  });
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Debug Logging (Development Only)
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Good: Conditional debug logging
if (process.env.NODE_ENV === 'development') {
  console.log('[AI_STUDIO_DEBUG] Model configuration:', modelConfig);
}

// ❌ Bad: Always-on debug logging
console.log('[AI_STUDIO] Current config:', modelConfig);
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🚀 Console Filtering Guide

### Browser Console Filtering
```javascript
// Filter by specific module
console.filter('[CHAT_');

// Filter by operation type
console.filter('✅');
console.filter('❌');

// Filter by log level
console.filter('console.error');
console.filter('console.warn');
```

### Terminal/Server Logging
<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Filter logs by module
npm run dev | grep '\[AUTH_'

# Filter by success operations
npm run dev | grep '✅'

# Filter critical errors
npm run dev | grep 'console.error'
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 📊 Log Levels & Conventions

### Production Log Levels
1. **ERROR**: System failures, unhandled exceptions, critical issues
2. **WARN**: Performance issues, deprecated usage, configuration problems
3. **INFO**: Important business events, user actions, system state changes
4. **DEBUG**: Development information (disabled in production)

### Log Structure
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  module: string;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

// Example usage
const logEntry: LogEntry = {
  level: 'error',
  module: 'AUTH_SERVICE',
  message: 'Login attempt failed',
  context: {
    email: user.email,
    attemptCount: 3,
    ipAddress: request.ip
  },
  timestamp: new Date().toISOString(),
  userId: user.id
};
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🔒 Security Considerations

### Never Log These
- **Passwords**: Raw passwords or password hashes
- **API Keys**: Authentication tokens, secret keys
- **PII**: Personal identifiable information
- **Credit Card Info**: Payment details, card numbers
- **Session Tokens**: JWT tokens, session IDs in full

### Safe Logging Patterns
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Good: Log non-sensitive identifiers
console.log('[AUTH_LOGIN] User authenticated', {
  userId: user.id,
  email: user.email.replace(/(.{2}).*(@.*)/, '$1***$2')
});

// ❌ Bad: Log sensitive information
console.log('[AUTH_LOGIN] User login', {
  password: user.password,
  token: authToken
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🧪 🧪 Testing & Validation

### Log Testing
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Test log output in unit tests
describe('AuthService', () => {
  it('should log successful authentication', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    
    await authService.login(credentials);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[AUTH_SERVICE] ✅ Login successful')
    );
  });
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Log Monitoring
- Set up automated log monitoring for error patterns
- Track log volume and frequency
- Monitor for security-sensitive information in logs
- Validate log structure and formatting

---

**Status**: Official Standard  
**Maintained By**: Platform Team  
**Last Updated**: 2025-07-12  
**Applies To**: All Kodix SubApps and Services
