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

# Naming Conventions - Kodix Platform

Comprehensive naming conventions ensuring consistency across files, directories, code elements, and database schemas in the Kodix platform.

## 🔍 🎯 Overview

<!-- AI-COMPRESS: strategy="summary" max-tokens="150" -->
**Quick Summary**: Key points for rapid AI context understanding.
<!-- /AI-COMPRESS -->
Standardized naming conventions for all aspects of the Kodix platform, from file structure to code elements, ensuring readability and maintainability.

### Naming Principles
- **Consistency**: Same patterns across all components
- **Clarity**: Names should be self-documenting
- **Brevity**: Concise without sacrificing clarity
- **Convention**: Follow established patterns in each domain

## 📁 File & Directory Naming

### General File Rules
- **Format**: Use `kebab-case` for all files and directories
- **Extensions**: Use appropriate extensions (`.tsx`, `.ts`, `.md`)
- **Descriptive**: Names should indicate file purpose

### Component Files
```
components/
├── user-profile.tsx           # ✅ Main component file
├── chat-window/               # ✅ Complex component directory
│   ├── index.ts              # ✅ Barrel export
│   ├── chat-window.tsx       # ✅ Main implementation
│   ├── chat-window.test.tsx  # ✅ Co-located tests
│   ├── chat-window.stories.tsx # ✅ Storybook stories
│   └── types.ts              # ✅ Component-specific types
├── ui/                       # ✅ UI component grouping
│   ├── button.tsx
│   ├── modal.tsx
│   └── form-input.tsx
```

### Hook Files
```
hooks/
├── use-user-data.ts          # ✅ Data fetching hooks
├── use-chat-session.ts       # ✅ Feature-specific hooks
├── use-local-storage.ts      # ✅ Utility hooks
└── use-auth-status.ts        # ✅ Authentication hooks
```

### Utility Files
```
utils/
├── format-date.ts            # ✅ Formatting utilities
├── api-helpers.ts            # ✅ API utilities
├── validation-schemas.ts     # ✅ Validation utilities
└── constants.ts              # ✅ Application constants
```

### Page Files (Next.js App Router)
```
app/
├── dashboard/
│   ├── page.tsx              # ✅ Main page component
│   ├── loading.tsx           # ✅ Loading UI
│   ├── error.tsx             # ✅ Error UI
│   └── layout.tsx            # ✅ Layout component
├── user-settings/
│   ├── page.tsx
│   └── profile/
│       └── page.tsx
```

### Documentation Files
```
docs/
├── architecture/
│   ├── ../../../architecture/backend/../../../architecture/backend/backend-guide.md      # ✅ Kebab-case for docs
│   ├── frontend-patterns.md
│   └── database-schema.md
├── development/
│   ├── setup-guide.md
│   └── debugging-tips.md
```

## 💻 Code Element Naming

### React Components
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ PascalCase for component names
export function UserProfile({ user }: UserProfileProps) {
  return <div className="user-profile">{/* content */}</div>;
}

export function ChatWindow() {
  return <div className="chat-window">{/* content */}</div>;
}

// ✅ Descriptive component names
export function UserAvatarWithStatus() {
  return <div>{/* avatar with online status */}</div>;
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Functions & Variables
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ camelCase for functions and variables
const getUserData = async (userId: string) => {
  return await fetchUser(userId);
};

const chatSessions = await getChatSessions();
const isUserOnline = checkUserStatus(user.id);
const messageCount = messages.length;

// ✅ Boolean variables with is/has/can/should prefix
const isLoading = true;
const hasPermission = user.roles.includes('admin');
const canEdit = hasPermission && isOwner;
const shouldShowModal = isLoggedIn && hasNotification;
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Constants
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ SCREAMING_SNAKE_CASE for constants
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.kodix.com';
const DEFAULT_PAGE_SIZE = 20;
const CACHE_TIMEOUT_SECONDS = 300;

// ✅ Grouped constants in objects
const ENDPOINTS = {
  USERS: '/api/users',
  CHAT: '/api/chat',
  AUTH: '/api/auth'
} as const;

const LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_MESSAGE_LENGTH: 1000,
  SESSION_TIMEOUT: 30 * 60 * 1000  // 30 minutes
} as const;
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Custom Hooks
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Start with 'use' prefix
export function useUserData(userId: string) {
  // Hook implementation
}

export function useChatSession(sessionId: string) {
  // Hook implementation
}

export function useDebounce<T>(value: T, delay: number) {
  // Generic hook implementation
}

// ✅ Descriptive hook names
export function useAuthenticatedUser() {
  // Returns authenticated user or null
}

export function useOptimisticUpdate<T>(updateFn: UpdateFunction<T>) {
  // Optimistic update hook
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🗃️ TypeScript Types & Interfaces

### Interface Naming
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ PascalCase for interfaces and types
interface User {
  id: string;
  name: string;
  email: string;
}

interface ChatMessage {
  id: string;
  content: string;
  userId: string;
  timestamp: Date;
}

// ✅ Props interfaces
interface UserProfileProps {
  user: User;
  onEdit: (user: User) => void;
  isEditable?: boolean;
}

interface ChatWindowProps {
  sessionId: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Type Definitions
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Descriptive type names
type UserId = string;
type TeamId = string;
type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read';
type UserRole = 'admin' | 'member' | 'viewer';

// ✅ Union types with descriptive names
type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ✅ Generic type parameters
interface Repository<TEntity, TCreateInput> {
  findById(id: string): Promise<TEntity | null>;
  create(input: TCreateInput): Promise<TEntity>;
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Branded Types
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Branded types for type safety
type UserId = string & { readonly __brand: 'UserId' };
type TeamId = string & { readonly __brand: 'TeamId' };
type SessionId = string & { readonly __brand: 'SessionId' };

// Usage
function getUser(userId: UserId): Promise<User> {
  // Implementation
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🗄️ Database Naming

### Table Names
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Singular, descriptive table names
export const userTable = mysqlTable('users', {
  // columns
});

export const chatMessageTable = mysqlTable('chat_messages', {
  // columns
});

export const teamMemberTable = mysqlTable('team_members', {
  // columns
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Column Names
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ camelCase for column names in schema
export const userTable = mysqlTable('users', {
  id: varchar('id', { length: 191 }).primaryKey(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  emailAddress: varchar('email_address', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow()
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Index Names
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Descriptive index names
export const userTable = mysqlTable('users', {
  // columns
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.emailAddress),
  teamIdIdx: index('users_team_id_idx').on(table.teamId),
  createdAtIdx: index('users_created_at_idx').on(table.createdAt),
  // Composite indexes
  teamRoleIdx: index('users_team_role_idx').on(table.teamId, table.role)
}));
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🔗 🔌 API & Route Naming

### tRPC Procedures
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Descriptive procedure names
export const userRouter = router({
  // Query procedures - noun-based
  getProfile: protectedProcedure.query(/* implementation */),
  getTeamMembers: protectedProcedure.query(/* implementation */),
  searchUsers: protectedProcedure.query(/* implementation */),
  
  // Mutation procedures - verb-based
  updateProfile: protectedProcedure.mutation(/* implementation */),
  createTeam: protectedProcedure.mutation(/* implementation */),
  deleteAccount: protectedProcedure.mutation(/* implementation */),
  
  // Subscription procedures
  onProfileUpdated: protectedProcedure.subscription(/* implementation */),
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### API Route Files
```
app/api/
├── users/
│   ├── route.ts              # ✅ Main users endpoint
│   └── [id]/
│       ├── route.ts          # ✅ Individual user
│       └── profile/
│           └── route.ts      # ✅ User profile
├── chat/
│   ├── rooms/
│   │   └── route.ts          # ✅ Chat rooms
│   └── messages/
│       └── route.ts          # ✅ Messages
```

## 🎨 CSS & Styling

### CSS Class Names
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ BEM-inspired naming with kebab-case
<div className="user-profile">
  <div className="user-profile__header">
    <img className="user-profile__avatar" />
    <h2 className="user-profile__name">User Name</h2>
  </div>
  <div className="user-profile__content">
    <div className="user-profile__section user-profile__section--primary">
      Content
    </div>
  </div>
</div>

// ✅ Tailwind utility classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
  <span className="text-lg font-semibold text-gray-900">Title</span>
  <button className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
    Action
  </button>
</div>
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### CSS Custom Properties
```css
/* ✅ Kebab-case custom properties */
:root {
  --color-primary: #3b82f6;
  --color-secondary: #6b7280;
  --spacing-small: 0.5rem;
  --spacing-medium: 1rem;
  --border-radius-default: 0.375rem;
  --font-size-heading: 1.5rem;
}
```

## 🏷️ Environment Variables

### Environment Variable Naming
<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# ✅ SCREAMING_SNAKE_CASE for environment variables
DATABASE_URL="mysql://..."
NEXTAUTH_SECRET="..."
NEXT_PUBLIC_APP_URL="https://app.kodix.com"

# ✅ Grouped by service/feature
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD="..."

OPENAI_API_KEY="sk-..."
OPENAI_MODEL_DEFAULT="gpt-4"

EMAIL_SMTP_HOST="smtp.gmail.com"
EMAIL_SMTP_PORT="587"
EMAIL_FROM_ADDRESS="noreply@kodix.com"
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🧪 Test Naming

### Test File Naming
```
components/
├── user-profile.tsx
├── user-profile.test.tsx     # ✅ Unit tests
├── user-profile.stories.tsx  # ✅ Storybook stories
└── __tests__/               # ✅ Test directory
    ├── user-profile.integration.test.tsx
    └── user-profile.e2e.test.tsx
```

### Test Case Naming
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Descriptive test names
describe('UserProfile Component', () => {
  it('renders user information correctly', () => {
    // Test implementation
  });
  
  it('handles profile update successfully', () => {
    // Test implementation
  });
  
  it('displays error message when update fails', () => {
    // Test implementation
  });
  
  it('disables edit button for non-owners', () => {
    // Test implementation
  });
});

// ✅ Nested describe blocks for organization
describe('ChatWindow Component', () => {
  describe('when user is authenticated', () => {
    it('allows sending messages', () => {
      // Test implementation
    });
    
    it('displays message history', () => {
      // Test implementation
    });
  });
  
  describe('when user is not authenticated', () => {
    it('redirects to login page', () => {
      // Test implementation
    });
  });
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 📦 Package & Module Naming

### Package Names
```json
{
  "name": "@kdx/db",           // ✅ Scoped package names
  "name": "@kdx/auth",
  "name": "@kdx/ui",
  "name": "@kdx/email"
}
```

### Import/Export Naming
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Consistent export patterns
export { UserProfile } from './user-profile';
export { ChatWindow } from './chat-window';
export type { User, Team, ChatMessage } from './types';

// ✅ Barrel exports in index.ts
export * from './components';
export * from './hooks';
export * from './utils';
export type * from './types';
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

**Status**: Official Standard  
**Maintained By**: Platform Team  
**Last Updated**: 2025-07-12  
**Scope**: All Kodix Platform Components
