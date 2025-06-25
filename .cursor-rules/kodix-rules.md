---
description:
globs:
alwaysApply: false
---

# Kodix Development Rules

## 🚨 **CRITICAL - INTER-APP DEPENDENCIES**

### ⚠️ MANDATORY: Service Layer Communication Between SubApps

**BEFORE** implementing ANY communication between SubApps (Chat ↔ AI Studio, etc.):

1. **READ:** `docs/architecture/subapp-architecture.md` **FIRST**
2. **READ:** `docs/architecture/subapp-inter-dependencies.md` for detailed patterns
3. **ALWAYS** use Service Layer (NOT HTTP calls) for cross-app communication
4. **ALWAYS** validate `teamId` in service methods
5. **NEVER** access repositories of other SubApps directly

**Example of CORRECT pattern:**

```typescript
// ✅ CORRECT - Service Layer communication
import { AiStudioService } from "../../../../internal/services/ai-studio.service";

const model = await AiStudioService.getModelById({
  modelId,
  teamId: ctx.auth.user.activeTeamId,
  requestingApp: chatAppId,
});
```

**Example of FORBIDDEN pattern:**

```typescript
// ❌ FORBIDDEN - Direct repository access
import { aiStudioRepository } from "@kdx/db/repositories";

const model = await aiStudioRepository.AiModelRepository.findById(modelId);

// ❌ FORBIDDEN - HTTP calls between SubApps (legacy pattern)
await callAiStudioEndpoint("getModels", teamId, params, headers);
```

**Critical Migration Completed (2024-12-20):** All cross-app communication migrated from HTTP to Service Layer for better performance, type safety, and team isolation.

---

## 🚨 **CRITICAL - NO MOCK DATA POLICY**

### ⚠️ MANDATORY: Real Data Only

**BEFORE** implementing ANY feature:

1. **NEVER** use mock data in development or production code
2. **ALWAYS** implement real tRPC queries and mutations
3. **EXPLICIT AUTHORIZATION REQUIRED** before using any mock data
4. **REMOVE** all mock implementations before code review

**Mock data is ONLY allowed for:**

- Unit tests
- Storybook components
- Temporary debugging (with explicit approval)

**Example of FORBIDDEN pattern:**

```typescript
// ❌ FORBIDDEN - Mock data in development
const sessionQuery = { data: { mockData: true } };
```

**Example of CORRECT pattern:**

```typescript
// ✅ CORRECT - Real tRPC query
const sessionQuery = useQuery(trpc.app.chat.buscarSession.queryOptions(...));
```

---

## 🚨 **CRITICAL - STRATEGY-FIRST APPROACH**

### ⚠️ MANDATORY: Always Discuss Strategy Before Implementation

**BEFORE** implementing ANY solution or code changes:

1. **ALWAYS** present multiple strategy options to the user
2. **NEVER** start coding without discussing the approach first
3. **ALWAYS** ask "Which approach do you prefer?" before implementation
4. **WAIT** for user approval of the chosen strategy

**Example of CORRECT workflow:**

```
1. User asks: "How can we update model pricing?"
2. AI presents: "Here are 3 strategies: Manual Script, Auto-Cron, Admin Interface"
3. AI asks: "Which approach would you prefer?"
4. User chooses: "Let's go with Manual Script"
5. AI implements: Only then start coding the chosen solution
```

**Example of FORBIDDEN workflow:**

```
1. User asks: "How can we update model pricing?"
2. AI immediately starts: Creating files and implementing code
```

**This ensures:**

- Better alignment with user needs
- Avoid unnecessary rework
- More collaborative development process
- Strategic thinking before tactical execution

---

## 🎯 Architecture Rules

### File Organization

- Each SubApp has its own directory under `apps/`
- Shared code goes in `packages/`
- Database schemas in `packages/db/schemas/`
- Validators in `packages/validators/`
- Service Layer in `packages/api/src/internal/services/`

### Naming Conventions

- Files: `kebab-case.ts`
- Components: `PascalCase.tsx`
- Variables/functions: `camelCase`
- Database tables: `snake_case`
- Environment variables: `UPPER_SNAKE_CASE`

### Component Structure

```
_components/
├── ui/                 # Base UI components
├── forms/              # Form components
├── layout/             # Layout components
└── feature-specific/   # Business logic components
```

### Backend Structure

```
packages/api/src/trpc/routers/
├── app/               # App-specific routers
│   ├── _router.ts     # Main app router
│   ├── chat/          # Chat-related endpoints
│   ├── aiStudio/      # AI Studio endpoints
│   ├── kodixCare/     # Kodix Care endpoints
│   └── ...
├── internal/
│   └── services/      # Service Layer for cross-app communication
│       ├── ai-studio.service.ts
│       ├── calendar.service.ts
│       └── ...
└── public/            # Public endpoints
```

## 🗄️ Database Rules

### Schema Design

- Use Drizzle ORM for all database operations
- All tables must have `teamId` for multi-tenancy
- Use proper foreign key relationships
- Include `createdAt` and `updatedAt` timestamps

### Migrations

- Run `pnpm db:generate` after schema changes
- Test migrations in development first
- Use `pnpm db:migrate` for applying changes
- Use `pnpm db:studio` for visual inspection

### Multi-tenancy

- **ALWAYS** filter by `teamId` in queries
- **NEVER** expose data from other teams
- Use team-scoped repositories

## 🔧 **tRPC v11 Architecture Rules (CRITICAL)**

### **⚠️ MANDATORY: Web App Pattern Only**

The Kodix project uses **tRPC v11** with a specific pattern for the web app, based on the working implementation from commit `92a76e90`.

> **⚠️ IMPORTANT:** The pattern used in `care-expo` (mobile app) is still under study and **should NOT be considered** as architectural reference. These rules focus exclusively on the validated and functional web pattern.

### **✅ CORRECT Pattern - Web App (Next.js)**

```typescript
// Import pattern for Web App (apps/kdx/)
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

// Usage in components
const trpc = useTRPC();
const mutation = useMutation(trpc.app.method.mutationOptions());
const query = useQuery(trpc.app.method.queryOptions());
const queryClient = useQueryClient();
queryClient.invalidateQueries(trpc.app.method.pathFilter());
```

### **❌ FORBIDDEN Patterns**

```typescript
// ❌ NEVER USE - Wrong import in web app
import { api } from "~/trpc/react";

// ❌ NEVER USE - Direct methods in web app
const mutation = trpc.app.method.useMutation();
const query = trpc.app.method.useQuery();
```

### **🚨 CRITICAL RULE: Web App Validation**

**BEFORE** writing ANY tRPC code:

1. **Web App (apps/kdx/)**: ALWAYS use `useTRPC()` pattern
2. **NEVER** use `import { api }` pattern in web app
3. **ALWAYS** run `pnpm check:trpc` before commit (must show 0 problems)

**Validation Command:**

```bash
# Must return 0 problems for web app
pnpm check:trpc
```

**Architecture Base:** Commit `92a76e90` (kodix-care-web)

## 🔗 **Service Layer Rules (CRITICAL)**

### **⚠️ MANDATORY: Cross-App Communication via Service Layer**

**BEFORE** implementing communication between SubApps:

1. **CREATE** service class in `packages/api/src/internal/services/`
2. **EXTEND** BaseService with team validation
3. **VALIDATE** `teamId` in all service methods
4. **LOG** service calls for audit trail
5. **USE** TypeScript interfaces for type safety

### **✅ Service Layer Implementation Pattern**

```typescript
// packages/api/src/internal/services/my-subapp.service.ts
export class MySubAppService {
  private static validateTeamAccess(teamId: string) {
    if (!teamId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "teamId is required for cross-app access",
      });
    }
  }

  static async getResourceById({
    resourceId,
    teamId,
    requestingApp,
  }: {
    resourceId: string;
    teamId: string;
    requestingApp: KodixAppId;
  }) {
    this.validateTeamAccess(teamId);

    // Log for audit trail
    console.log(
      `🔄 [MySubAppService] getResourceById by ${requestingApp} for team: ${teamId}`,
    );

    const resource = await mySubAppRepository.findById(resourceId);

    if (!resource || resource.teamId !== teamId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Resource not found or access denied",
      });
    }

    return resource;
  }
}
```

### **✅ Using Service Layer in SubApps**

```typescript
// In another SubApp's router/handler
import { MySubAppService } from "../../../../internal/services/my-subapp.service";

export const someHandler = async ({ ctx, input }) => {
  const resource = await MySubAppService.getResourceById({
    resourceId: input.resourceId,
    teamId: ctx.auth.user.activeTeamId,
    requestingApp: currentSubAppId,
  });

  // Use resource in your SubApp logic
  return processWithResource(resource);
};
```

### **❌ FORBIDDEN Cross-App Patterns**

```typescript
// ❌ NEVER - Direct repository access to other SubApps
import { otherSubAppRepository } from "@kdx/db/repositories";

// ❌ NEVER - Import handlers from other SubApps
import { otherSubAppHandler } from "../otherSubApp/handler";

const data = await otherSubAppRepository.findById(id);

// ❌ NEVER - HTTP calls between SubApps in same process
await fetch("/api/other-subapp/endpoint");
```

## 🔐 Authentication & Authorization

### Context Rules

- All protected procedures must validate `teamId`
- Forward authentication tokens in cross-app calls
- Use `ctx.auth.user.activeTeamId` for team context
- Validate team membership for sensitive operations

### API Security

- Use `protectedProcedure` for authenticated endpoints
- Use `chatProtectedProcedure` for Chat app dependencies
- Include proper error handling for missing context
- Log security-relevant events

## 🎨 Frontend Rules

### Component Development

- Use TypeScript for all components
- Implement proper loading states
- Handle error states gracefully
- Use Shadcn/UI components when available

### State Management

- Use React Query/TanStack Query for server state
- Use React state for UI state
- Implement optimistic updates where appropriate
- Cache queries properly with correct invalidation

### Internationalization

- **NEVER** hardcode strings in components
- Use `useTranslations()` hook for all text
- Add translation keys to appropriate locale files
- Support both Portuguese and English

## 📝 Code Quality

### TypeScript

- Enable strict mode
- Use proper type definitions
- Avoid `any` types
- Use branded types for IDs when appropriate

### Error Handling

- Use TRPCError for backend errors with proper codes
- Implement proper client-side error boundaries
- Provide meaningful error messages to users
- Log errors with sufficient context

### Data & Mocking Rules

- **NEVER** use mock data in production or development code
- **ALWAYS** use real tRPC queries and mutations
- **ALWAYS** implement proper loading and error states
- **EXPLICIT AUTHORIZATION REQUIRED** before using any mock data
- Mock data is **ONLY** allowed for:
  - Unit tests
  - Storybook components
  - Temporary debugging (with explicit approval)
- Remove all mock implementations before code review
- Use proper tRPC architecture patterns consistently

### Testing

- Write unit tests for business logic
- Write integration tests for cross-app functionality
- Test error scenarios and edge cases
- Mock external dependencies properly in tests only

## 🔄 Development Workflow

### Git Workflow

- Create feature branches from `main`
- Use descriptive commit messages
- Test changes thoroughly before pushing
- Request code reviews for significant changes

### Development Environment

- Use `pnpm dev:kdx` to run the full stack
- Use `pnpm db:studio` for database inspection
- Check server status with `scripts/check-server-simple.sh`
- Monitor logs for errors and warnings

### Code Reviews

- Review security implications
- Check for proper error handling
- Verify team data isolation
- Ensure proper testing coverage

## 🚀 Performance

### Database Optimization

- Use proper indexes on frequently queried columns
- Implement pagination for large data sets
- Use database-level filtering instead of application filtering
- Monitor query performance in production

### Frontend Optimization

- Implement code splitting for large applications
- Use React.memo for expensive components
- Optimize bundle size with proper imports
- Implement proper caching strategies

---

**Last Updated:** 2024-12-21  
**Critical Updates:** Service Layer patterns, cross-app communication, architecture alignment  
**Next Review:** 2025-01-21

## Kodix AI Coding Rules

1. All variable names, function names, classes, interfaces, and routines **must be written in English**.

2. All **comments inside the code** must be written in English as well.

3. The only exception is the documentation inside the root folder named `docs/` and subfolders, which **must be written in Portuguese**.

4. All code **must respect and follow the architecture guidelines** defined in the `docs/architecture/` folder. Before implementing any feature or making significant changes, you **must consult** the relevant architecture documents:

   - `docs/architecture/README.md` - Architecture overview and principles
   - `docs/architecture/frontend-guide.md` - Frontend architecture and patterns
   - `docs/architecture/backend-guide.md` - Backend architecture and patterns
   - `docs/architecture/coding-standards.md` - Coding standards and conventions
   - `docs/architecture/workflows.md` - Development workflows
   - `docs/architecture/subapp-architecture.md` - Complete SubApp architecture and creation guidelines

5. **Documentation Structure**: Before creating ANY documentation, **ALWAYS**:

   **a) Check the main documentation structure:**

   - Read `docs/README.md` for the complete folder structure
   - Verify which folder is appropriate for your documentation

   **b) Follow the correct folder structure:**

   ```
   docs/
   ├── project/          # Business concepts and vision
   ├── subapps/          # Main app features (AI Studio, Chat, Calendar, etc.)
   ├── apps/             # Separate applications (mobile apps)
   ├── architecture/     # Technical architecture and development guides
   ├── components/       # Design system and UI components
   ├── database/         # Database documentation
   └── references/       # External references and APIs
   ```

   **c) Common documentation locations:**

   - **SubApp features** → `docs/subapps/{appName}/`
   - **Mobile apps** → `docs/apps/{appName}/`
   - **Architecture docs** → `docs/architecture/`
   - **Component docs** → `docs/ui-catalog/`
   - **Database docs** → `docs/database/`

   **d) Before creating any new documentation:**

   - List the contents of the appropriate folder with `list_dir`
   - Check if there's already a README.md or existing structure
   - Read existing documentation to understand the context
   - Never overwrite existing documentation without reading it first

   **e) NEVER create documentation in wrong locations like:**

   - `docs/apps/chat/` ❌ → Should be `docs/subapps/chat/` ✅
   - `docs/features/` ❌ → Use proper categorization
   - Random folders without checking structure ❌

6. **Environment variables** are configured in the `.env` file located at the **root of the monorepo**. The environment variables include:

   - `NODE_ENV`
   - `MYSQL_URL`
   - `ENCRYPTION_KEY`
   - `AUTH_GOOGLE_CLIENT_ID`
   - `AUTH_GOOGLE_CLIENT_SECRET`
   - `AUTH_DISCORD_ID`
   - `AUTH_DISCORD_SECRET`
   - `RESEND_API_KEY`
   - `AWS_SMTP_USER`
   - `AWS_SMTP_PASSWORD`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `DISABLE_UPSTASH_CACHE`
   - `QSTASH_CURRENT_SIGNING_KEY`
   - `QSTASH_NEXT_SIGNING_KEY`
   - `NEXT_PUBLIC_POSTHOG_KEY`
   - `NEXT_PUBLIC_POSTHOG_HOST`
   - `OPENAI_API_KEY`

   When working with environment variables:

   - Always check the root `.env` file for existing configurations
   - Do not create separate `.env` files in subfolders unless absolutely necessary
   - Never commit sensitive environment variables to version control

7. **Internationalization (i18n)**: All apps **must be fully internationalized** from the beginning. This is **mandatory** for any new app or component:

   **Required Implementation:**

   - **NEVER use hardcoded text strings** in Portuguese, English, or any language directly in components
   - **Always use** the `useTranslations()` hook from `next-intl` for all user-facing text
   - All text must be translatable between Portuguese (pt-BR) and English (en)

   **Translation Files Structure:**

   ```
   packages/locales/src/messages/kdx/
   ├── pt-BR.json  # Portuguese translations
   └── en.json     # English translations
   ```

   **Translation Keys Organization:**

   ```json
   {
     "apps": {
       "yourAppName": {
         "appName": "App Name",
         "appDescription": "App description",
         "actions": {
           "create": "Create",
           "edit": "Edit",
           "delete": "Delete",
           "cancel": "Cancel"
         },
         "messages": {
           "loading": "Loading...",
           "error": "Error occurred",
           "success": "Success"
         }
       }
     }
   }
   ```

   **Component Implementation Example:**

   ```tsx
   import { useTranslations } from "next-intl";

   export function MyComponent() {
     const t = useTranslations();

     return <button>{t("apps.myApp.actions.create")}</button>;
   }
   ```

   **Mandatory Checks:**

   - Before submitting any component, verify it works in both Portuguese and English
   - All user-facing text (buttons, labels, messages, placeholders, etc.) must use translation keys
   - Translation keys must exist in **both** `pt-BR.json` and `en.json` files
   - Use meaningful, hierarchical key names following the pattern: `apps.{appName}.{category}.{specificKey}`

8. **Server Management**: Before proposing to run `pnpm dev:kdx` or any server startup commands, **always check** if the development server is already running:

   - Use `scripts/check-server-simple.sh` for quick verification
   - If it returns `RUNNING` → Do not propose starting the server again
   - If it returns `STOPPED` → Propose `pnpm dev:kdx` to start the server
   - If it returns `PORT_OCCUPIED` → Use `./check-server.sh` for detailed diagnostics

   Available server management commands:

   ```bash
   # Quick check (returns: RUNNING, STOPPED, or PORT_OCCUPIED)
   scripts/check-server-simple.sh

   # Detailed server status and management
   ./check-server.sh [PORT] [check|stop|restart]
   ```

   This prevents conflicts and ensures efficient development workflow.

9. **Process Verification**: Before executing any development commands (pnpm dev, npm start, etc.), ALWAYS check if there are already running processes with:
   - `ps aux | grep "pnpm\|next\|turbo" | grep -v grep`
   - `lsof -i :3000` (or other relevant ports)
   - Ask the user if existing processes should be stopped before starting new ones

These rules ensure consistency across the codebase and improve collaboration with AI tools and contributors from diverse backgrounds.

Verificação de Processos
Antes de executar qualquer comando de desenvolvimento (pnpm dev, npm start, etc.), SEMPRE verificar se há processos já rodando com:

- `ps aux | grep "pnpm\|next\|turbo" | grep -v grep`
- `lsof -i :3000` (ou outras portas relevantes)
- Perguntar ao usuário se deve parar processos existentes antes de iniciar novos

These rules ensure consistency across the codebase and improve collaboration with AI tools and contributors from diverse backgrounds.
