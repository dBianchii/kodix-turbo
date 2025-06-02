# Inter-App Dependencies & Communication

## 🚨 Critical Issues Documented

### TeamId Context Loss in Cross-App API Calls

**Severity:** 🔴 **CRITICAL**

**Date Discovered:** 2024-12-19

**Apps Affected:** Chat ↔ AI Studio

#### Problem Description

The Chat app's `autoCreateSessionWithMessage` endpoint was failing with error 412 "Nenhum modelo de IA disponível" even when AI Studio had configured models.

**Root Cause:** The `callAiStudioEndpoint` helper function was not forwarding the `teamId` parameter in HTTP requests to AI Studio endpoints, causing AI Studio to be unable to identify which team's models to retrieve.

#### Technical Details

**Before (Broken):**

```typescript
async function callAiStudioEndpoint(
  action: string,
  params?: Record<string, string>,
  headers?: Record<string, string>,
): Promise<any> {
  const searchParams = new URLSearchParams({ action, ...(params || {}) });
  // ❌ Missing teamId - AI Studio cannot identify the requesting team
}
```

**After (Fixed):**

```typescript
async function callAiStudioEndpoint(
  action: string,
  teamId?: string, // ✅ Now accepts teamId
  params?: Record<string, string>,
  headers?: Record<string, string>,
): Promise<any> {
  const searchParams = new URLSearchParams({
    action,
    ...(teamId && { teamId }), // ✅ Includes teamId in request
    ...(params || {}),
  });
}
```

#### Impact

- **User Experience:** Users couldn't create new chat sessions through the QuickChatInput
- **Data Isolation:** Without teamId, AI Studio couldn't enforce team-based model access
- **Debugging Complexity:** Error message was misleading, suggesting configuration issues rather than parameter passing

#### Files Modified

- `packages/api/src/trpc/routers/app/chat/_router.ts`
  - Fixed `callAiStudioEndpoint` function signature
  - Updated all function calls to pass `teamId`
  - Added teamId to URL parameters

#### Calls Updated

```typescript
// All these calls now include teamId:
await callAiStudioEndpoint("getModel", teamId, { modelId }, headers);
await callAiStudioEndpoint("getDefaultModel", teamId, undefined, headers);
await callAiStudioEndpoint("getAvailableModels", teamId, undefined, headers);
await callAiStudioEndpoint("getProviderToken", teamId, { providerId }, headers);
```

---

## 🏗️ Architecture Patterns for Inter-App Communication

### 1. Context Preservation Requirements

**MANDATORY:** All cross-app API calls MUST preserve authentication context:

- ✅ `teamId` - For data isolation and team-specific resources
- ✅ `userId` - For user-specific permissions and audit trails
- ✅ `Authorization` token - For request authentication
- ✅ Request headers - For tracing and debugging

### 2. HTTP API Call Patterns

#### ✅ Correct Pattern

```typescript
async function callExternalApp(
  action: string,
  teamId: string, // REQUIRED
  userId?: string, // RECOMMENDED
  params?: Record<string, string>,
  headers?: Record<string, string>,
): Promise<any> {
  const searchParams = new URLSearchParams({
    action,
    teamId, // ✅ Always include
    ...(userId && { userId }), // ✅ Include when available
    ...(params || {}),
  });

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: headers.Authorization, // ✅ Forward auth
      "X-Request-Id": generateRequestId(), // ✅ Traceability
      ...headers,
    },
  });
}
```

#### ❌ Incorrect Pattern

```typescript
// NEVER do this - missing context
async function callExternalApp(action: string, params?: any) {
  const response = await fetch(`/api/app?action=${action}`);
  // ❌ No teamId, no auth, no traceability
}
```

### 3. Error Handling for Missing Context

```typescript
// AI Studio should validate required context
export async function validateRequestContext(req: Request) {
  const teamId = req.url.searchParams.get("teamId");

  if (!teamId) {
    throw new Error("teamId is required for cross-app requests");
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    throw new Error("Authorization header is required");
  }

  return { teamId, authHeader };
}
```

---

## 🧪 Testing Inter-App Dependencies

### Integration Test Requirements

1. **Context Forwarding Tests**

   ```typescript
   describe("Chat -> AI Studio Integration", () => {
     it("should forward teamId in all AI Studio calls", async () => {
       // Test that teamId is included in requests
     });

     it("should handle missing teamId gracefully", async () => {
       // Test error handling when teamId is missing
     });
   });
   ```

2. **End-to-End Flow Tests**
   ```typescript
   it("should create chat session with correct team isolation", async () => {
     // Test complete flow from UI to database
   });
   ```

### Monitoring & Debugging

Add logging for cross-app calls:

```typescript
console.log(`🔗 [CROSS_APP] ${sourceApp} -> ${targetApp}`, {
  action,
  teamId,
  requestId,
  timestamp: new Date().toISOString(),
});
```

---

## 📋 Checklist for New Inter-App Dependencies

Before implementing cross-app communication:

- [ ] **Context Preservation:** All required context (teamId, userId, auth) is forwarded
- [ ] **Error Handling:** Graceful handling of missing context parameters
- [ ] **Logging:** Comprehensive logging for debugging cross-app issues
- [ ] **Testing:** Integration tests covering context forwarding
- [ ] **Documentation:** Update this document with new dependency patterns
- [ ] **Security Review:** Ensure no sensitive data leakage between apps

---

## 🚨 Red Flags to Watch For

1. **Generic Error Messages:** "No models available" instead of "Missing teamId context"
2. **Hard-to-Debug Issues:** Cross-app calls working in development but failing in production
3. **Data Leakage:** App A seeing data from App B due to missing team isolation
4. **Authentication Bypass:** Requests working without proper authorization headers

---

## 📚 Related Documentation

- [Apps Architecture Overview](./apps-architecture.md)
- [Authentication & Authorization](./auth-patterns.md)
- [Error Handling Patterns](./error-handling.md)
- [Testing Strategies](./testing-patterns.md)

---

**Last Updated:** 2024-12-19  
**Reviewed By:** Development Team  
**Next Review:** 2025-01-19
