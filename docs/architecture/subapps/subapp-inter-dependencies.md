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

# Inter-App Dependencies & Communication

## 🚨 Historical Issues (RESOLVED)

### ~~TeamId Context Loss in Cross-App API Calls~~ ✅ RESOLVED

**Severity:** 🟢 **RESOLVED** (Previously 🔴 CRITICAL)

**Date Discovered:** 2024-12-19  
**Date Resolved:** 2024-12-20  
**Resolution:** Migration from HTTP calls to Service Layer communication

**Apps Affected:** Chat ↔ AI Studio

#### ~~Problem Description~~ (HISTORICAL)

~~The Chat app's `autoCreateSessionWithMessage` endpoint was failing with error 412 "Nenhum modelo de IA disponível" even when AI Studio had configured models.~~

**✅ SOLUTION IMPLEMENTED:** Complete migration from HTTP-based `callAiStudioEndpoint` to **Service Layer** communication.

#### Technical Resolution

**Old Approach (Removed):**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ❌ REMOVED - HTTP-based communication
async function callAiStudioEndpoint(
  action: string,
  teamId?: string,
  params?: Record<string, string>,
): Promise<any> {
  // HTTP call with teamId forwarding issues
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**✅ Current Implementation - Service Layer:**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ CURRENT - Service Layer communication
import { AiStudioService } from "../../../../internal/services/ai-studio.service";

// Direct service calls with proper context
const model = await AiStudioService.getModelById({
  modelId,
  teamId: ctx.auth.user.activeTeamId,
  requestingApp: chatAppId,
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

## 🏗️ 🏗️ Current Architecture: Service Layer Communication

### **🎯 Principle: Logical Isolation with Service Layer**

Kodix implements **logical isolation** between SubApps through **Service Layer**, ensuring:

- **Performance**: No unnecessary HTTP overhead
- **Type Safety**: TypeScript interfaces
- **Team Isolation**: Mandatory `teamId` validation
- **Auditability**: Cross-app access control

### **✅ RECOMMENDED Pattern: Service Layer**

#### **1. Service-to-Service Communication (NOT direct repositories)**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ❌ PROHIBITED - Direct repository access between SubApps
import { aiStudioRepository } from "@kdx/db/repositories";

export const chatRouter = {
  someEndpoint: protectedProcedure.query(async ({ ctx }) => {
    // ❌ VIOLATION: Chat SubApp accessing AI Studio repository directly
    const model = await aiStudioRepository.AiModelRepository.findById(modelId);
  }),
};

// ✅ CORRECT - Chat SubApp accessing AI Studio via Service Layer
import { AiStudioService } from "../../../../internal/services/ai-studio.service";

export const chatRouter = {
  someEndpoint: protectedProcedure.query(async ({ ctx }) => {
    // ✅ CORRECT: Access via service with isolation and validation
    const model = await AiStudioService.getModelById({
      modelId,
      teamId: ctx.auth.user.activeTeamId,
      requestingApp: chatAppId,
    });
  }),
};
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

#### **2. Service Implementation Pattern**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// packages/api/src/internal/services/ai-studio.service.ts
export class AiStudioService {
  private static validateTeamAccess(teamId: string) {
    if (!teamId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "teamId is required for cross-app access",
      });
    }
  }

  static async getModelById({
    modelId,
    teamId,
    requestingApp,
  }: {
    modelId: string;
    teamId: string;
    requestingApp: KodixAppId;
  }) {
    this.validateTeamAccess(teamId);

    // Log for audit trail
    console.log(
      `🔄 [AiStudioService] getModelById by ${requestingApp} for team: ${teamId}`,
    );

    const model = await aiStudioRepository.AiModelRepository.findById(modelId);

    // Validate team access
    if (!model) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Model not found",
      });
    }

    // Verify team has access via aiTeamModelConfig
    const teamConfig =
      await aiStudioRepository.AiTeamModelConfigRepository.findByTeamAndModel(
        teamId,
        modelId,
      );

    if (!teamConfig?.enabled) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Model not available for this team",
      });
    }

    return model;
  }
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **🔄 When to Use Service Layer vs HTTP**

| Scenario                                  | Recommended Method | Justification                       |
| ----------------------------------------- | ------------------ | ----------------------------------- |
| **SubApp → SubApp (same process)**        | ✅ Service Layer   | Performance, type safety            |
| **SubApp → External API**                 | ✅ HTTP            | Required for external communication |
| **Frontend → Backend**                    | ✅ tRPC            | Established pattern                 |
| **Server → Server (different processes)** | ✅ HTTP            | Required for real isolation         |

### **📋 Implementation Rules**

#### **✅ ALLOWED**

- Service Layer access between SubApps
- Mandatory `teamId` validation
- Type safety with TypeScript interfaces
- Optional logging for audit trails

#### **❌ PROHIBITED**

- Direct repository access to other SubApps
- Bypassing `teamId` validation
- Importing handlers from other SubApps without service layer

---

## 🧪 🧪 Testing Service Layer Communication

### Service Layer Tests

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
describe("SubApp Service Layer", () => {
  it("should enforce team isolation in service calls", async () => {
    const team1Id = "team-1";
    const team2Id = "team-2";

    // Create model for team1
    const model = await createTestModel({ teamId: team1Id });

    // Team1 should access successfully
    const result = await AiStudioService.getModelById({
      modelId: model.id,
      teamId: team1Id,
      requestingApp: chatAppId,
    });
    expect(result).toBeDefined();

    // Team2 should NOT access
    await expect(
      AiStudioService.getModelById({
        modelId: model.id,
        teamId: team2Id,
        requestingApp: chatAppId,
      }),
    ).rejects.toThrow("Model not available for this team");
  });

  it("should validate required teamId in service calls", async () => {
    await expect(
      AiStudioService.getModelById({
        modelId: "test-id",
        teamId: "", // ❌ Empty teamId
        requestingApp: chatAppId,
      }),
    ).rejects.toThrow("teamId is required for cross-app access");
  });

  it("should log service calls for audit trails", async () => {
    const consoleSpy = jest.spyOn(console, "log");

    await AiStudioService.getAvailableModels({
      teamId: "test-team",
      requestingApp: chatAppId,
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "🔄 [AiStudioService] getAvailableModels by chat_app",
      ),
    );
  });
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Integration Tests

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
describe("Chat → AI Studio Integration", () => {
  it("should use service layer for preferred model selection", async () => {
    const teamId = "test-team";

    // Setup test data
    await createTestModel({ teamId, isDefault: true });

    // Test Chat using AI Studio service
    const ctx = createMockContext({ teamId });
    const result = await getPreferredModelHelper(teamId, chatAppId);

    expect(result.source).toBe("ai_studio_default");
    expect(result.model).toBeDefined();
  });
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

## 📊 Monitoring Service Layer Communication

### Logging Standards

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Service calls should log:
console.log(
  `🔄 [${ServiceName}] ${action} by ${requestingApp} for team: ${teamId}`,
);
console.log(`✅ [${ServiceName}] Success: ${action}`);
console.log(`❌ [${ServiceName}] Error: ${action} - ${error.message}`);
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Metrics to Track

- **Service Call Volume**: Calls per service per hour
- **Error Rates**: Failed service calls by service/team
- **Performance**: Service call duration
- **Team Isolation**: Cross-team access attempts (should be 0)

---

## 📋 Checklist for Service Layer Implementation

When implementing new inter-app communication:

- [ ] **Service Class Created**: Following `AiStudioService` pattern
- [ ] **Team Validation**: Mandatory `teamId` validation in all methods
- [ ] **Type Safety**: Proper TypeScript interfaces
- [ ] **Error Handling**: Graceful error handling with proper tRPC errors
- [ ] **Logging**: Audit trail logging for service calls
- [ ] **Testing**: Service isolation and integration tests
- [ ] **Documentation**: Update this document with new service patterns

---

## 🚨 Red Flags to Avoid

1. **Direct Repository Access**: SubApp accessing another SubApp's repository directly
2. **Missing Team Validation**: Service calls without `teamId` validation
3. **HTTP for Internal Communication**: Using HTTP between SubApps in same process
4. **Bypassing Service Layer**: Importing handlers directly between SubApps

---

## 📚 Related Documentation

- <!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
[SubApp Architecture Overview](./subapp-architecture.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK --> - Complete SubApp patterns
- [tRPC Patterns](./trpc-patterns.md) - tRPC implementation patterns
- [Service Layer Documentation](./service-layer-patterns.md) - Service implementation details

---

**Last Updated:** 2024-12-20  
**Reviewed By:** Development Team  
**Next Review:** 2025-01-20

**Key Changes:**

- ✅ Migrated from HTTP to Service Layer communication
- ✅ Resolved teamId context loss issues
- ✅ Implemented `AiStudioService` as reference pattern
- 🔄 Pending: Additional services (CalendarService, etc.)
