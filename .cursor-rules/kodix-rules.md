---
description:
globs:
alwaysApply: false
---

# Kodix Development Rules

## 🚨 **CRITICAL - INTER-APP DEPENDENCIES**

### ⚠️ MANDATORY: TeamId Context in Cross-App Calls

**BEFORE** implementing ANY communication between SubApps (Chat ↔ AI Studio, etc.):

1. **READ:** `docs/architecture/inter-app-dependencies.md` **FIRST**
2. **ALWAYS** include `teamId` in cross-app API calls
3. **ALWAYS** forward authentication headers
4. **NEVER** call external app endpoints without proper context

**Example of CORRECT pattern:**

```typescript
await callAiStudioEndpoint("getModels", teamId, params, headers);
//                                      ^^^^^^ REQUIRED
```

**Critical Bug Fixed (2024-12-19):** Chat app was failing with "No models available" because `teamId` wasn't being forwarded to AI Studio, breaking team data isolation.

---

---

## 🎯 Architecture Rules

### File Organization

- Each SubApp has its own directory under `apps/`
- Shared code goes in `packages/`
- Database schemas in `packages/db/schemas/`
- Validators in `packages/validators/`

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
│   ├── chat/         # Chat-related endpoints
│   ├── ai-studio/    # AI Studio endpoints
│   └── ...
└── public/           # Public endpoints
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

### Testing

- Write unit tests for business logic
- Write integration tests for cross-app functionality
- Test error scenarios and edge cases
- Mock external dependencies properly

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

**Last Updated:** 2024-12-19  
**Critical Issues Documented:** Inter-app dependencies, teamId context loss  
**Next Review:** 2025-01-19

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
   - **Component docs** → `docs/components/`
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
