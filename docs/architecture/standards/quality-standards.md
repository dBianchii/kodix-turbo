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

# Quality Standards - Kodix Platform

Comprehensive quality standards covering testing, linting, type-checking, and code review processes for the Kodix platform.

## 🔍 🎯 Overview

<!-- AI-COMPRESS: strategy="summary" max-tokens="150" -->
**Quick Summary**: Key points for rapid AI context understanding.
<!-- /AI-COMPRESS -->
Quality assurance standards ensuring consistent, maintainable, and reliable code across all Kodix platform components.

### Quality Pillars
- **Type Safety**: Comprehensive TypeScript usage with strict configuration
- **Code Quality**: ESLint rules and automated formatting
- **Testing Coverage**: Unit, integration, and end-to-end testing
- **Performance**: Optimization and monitoring standards

## 🔧 ESLint Rules & Standards

### Critical tRPC Patterns (Zero Tolerance)
These patterns are **MANDATORY** and **NON-NEGOTIABLE**:

#### ✅ Correct tRPC v11 Pattern
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Correct import and usage
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";

// ✅ Correct usage pattern
const trpc = useTRPC();
const query = useQuery(trpc.app.method.queryOptions());
const mutation = useMutation(trpc.app.method.mutationOptions());
const queryClient = useQueryClient();
queryClient.invalidateQueries(trpc.app.method.pathFilter());
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

#### ❌ Forbidden Patterns - Never Use
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ❌ FORBIDDEN - Old tRPC v10 pattern
import { api } from "~/trpc/react";
const mutation = api.app.method.useMutation();

// ❌ FORBIDDEN - Direct api usage
const { data } = api.user.getProfile.useQuery();
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Code Quality Rules

#### Import Standards
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Use workspace aliases
import { db } from "@kdx/db";
import { auth } from "@kdx/auth";
import type { User } from "@kdx/db/schema";

// ❌ Avoid deep relative imports
import { db } from "../../../packages/db";
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

#### Component Patterns
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Proper component structure
interface Props {
  user: User;
  onUpdate: (user: User) => void;
}

export function UserProfile({ user, onUpdate }: Props) {
  const trpc = useTRPC();
  
  const updateMutation = useMutation(
    trpc.user.update.mutationOptions(),
    {
      onSuccess: onUpdate
    }
  );
  
  return (
    <div className="user-profile">
      {/* Component implementation */}
    </div>
  );
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### File Naming Conventions
```
components/
├── user-profile.tsx          # ✅ kebab-case for files
├── UserProfile.tsx           # ❌ Avoid PascalCase files
├── chat-window/              # ✅ Component directories
│   ├── index.ts             # ✅ Barrel exports
│   ├── chat-window.tsx      # ✅ Main component
│   └── chat-window.test.tsx # ✅ Co-located tests
```

## 🧪 🧪 Testing Standards

### Test Structure Requirements
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Comprehensive test structure
describe('UserProfile Component', () => {
  const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com'
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders user information correctly', () => {
    render(<UserProfile user={mockUser} onUpdate={jest.fn()} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
  
  it('handles update operations', async () => {
    const onUpdate = jest.fn();
    const user = userEvent.setup();
    
    render(<UserProfile user={mockUser} onUpdate={onUpdate} />);
    
    await user.click(screen.getByRole('button', { name: /edit/i }));
    // Test update functionality
    
    expect(onUpdate).toHaveBeenCalledWith(expectedUpdatedUser);
  });
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Testing Coverage Requirements
- **Unit Tests**: All utilities, hooks, and components
- **Integration Tests**: API endpoints and data flow
- **E2E Tests**: Critical user journeys
- **Minimum Coverage**: 80% for new code

### Mock Patterns
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Proper tRPC mocking
const mockTrpc = {
  user: {
    update: {
      mutationOptions: () => ({
        mutationFn: jest.fn(),
        onSuccess: jest.fn()
      })
    }
  }
};

jest.mock('~/trpc/react', () => ({
  useTRPC: () => mockTrpc
}));
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 📐 TypeScript Standards

### Strict Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Type Definition Patterns
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Proper type definitions
interface CreateUserInput {
  name: string;
  email: string;
  teamId: string;
}

interface User extends CreateUserInput {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Branded types for IDs
type UserId = string & { readonly brand: unique symbol };
type TeamId = string & { readonly brand: unique symbol };

// ✅ Discriminated unions
type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Generic Constraints
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Proper generic usage
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  create(input: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, input: Partial<Omit<T, 'id'>>): Promise<T>;
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🎨 Code Formatting

### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### Code Organization
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Proper import order
// 1. React and external libraries
import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

// 2. Internal workspace packages
import { db } from '@kdx/db';
import { auth } from '@kdx/auth';

// 3. Relative imports
import { useTRPC } from '~/trpc/react';
import { validateInput } from '../utils/validation';

// 4. Type-only imports (at the end)
import type { User } from '@kdx/db/schema';
import type { ComponentProps } from './types';
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🔍 Code Review Standards

### Review Checklist
- [ ] **tRPC Patterns**: Uses correct v11 patterns
- [ ] **Type Safety**: No `any` types, proper generics
- [ ] **Error Handling**: Comprehensive error boundaries
- [ ] **Performance**: Optimized renders and queries
- [ ] **Testing**: Adequate test coverage
- [ ] **Documentation**: JSDoc for complex functions
- [ ] **Security**: No hardcoded secrets or vulnerabilities

### Required Reviews
- **Architecture Changes**: Platform team approval
- **Breaking Changes**: Team lead approval
- **Security Changes**: Security team review
- **Performance Impact**: Performance review

### Review Process
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Example of well-documented code
/**
 * Updates user profile with validation and optimistic updates
 * @param userId - The user ID to update
 * @param input - User profile updates
 * @returns Promise resolving to updated user
 * @throws {ValidationError} When input is invalid
 * @throws {NotFoundError} When user doesn't exist
 */
export async function updateUserProfile(
  userId: string,
  input: UpdateUserInput
): Promise<User> {
  // Implementation with proper error handling
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🚀 Performance Standards

### React Performance
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Optimized component patterns
const ExpensiveComponent = React.memo(({ data }: Props) => {
  const processedData = useMemo(() => {
    return expensiveProcessing(data);
  }, [data]);
  
  const handleClick = useCallback((id: string) => {
    onItemClick(id);
  }, [onItemClick]);
  
  return <ComplexVisualization data={processedData} onClick={handleClick} />;
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Database Performance
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Optimized queries
export const userTable = mysqlTable('users', {
  id: varchar('id', { length: 191 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  teamId: varchar('team_id', { length: 191 }).notNull(),
}, (table) => ({
  // ✅ Proper indexes
  emailIdx: index('email_idx').on(table.email),
  teamIdx: index('team_idx').on(table.teamId),
}));
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🛡️ Security Standards

### Input Validation
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Zod validation schemas
export const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  teamId: z.string().uuid()
});

// ✅ tRPC procedure with validation
export const createUser = protectedProcedure
  .input(createUserSchema)
  .mutation(async ({ ctx, input }) => {
    // Validated input guaranteed
    return await ctx.db.user.create(input);
  });
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Environment Variables
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Environment validation
const env = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url()
}).parse(process.env);
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 📊 Quality Metrics

### Automated Checks
- **ESLint**: Zero errors, warnings under threshold
- **TypeScript**: No type errors in strict mode
- **Tests**: Minimum 80% coverage for new code
- **Bundle Size**: Performance budgets enforced
- **Security**: Automated vulnerability scanning

### Continuous Integration
<!-- AI-CODE-OPTIMIZATION: language="yaml" context="configuration" -->
```yaml
# Quality gates in CI/CD
- name: Type Check
  run: npm run typecheck
  
- name: Lint Check  
  run: npm run lint
  
- name: Test Coverage
  run: npm run test:coverage
  
- name: Security Scan
  run: npm audit --audit-level moderate
```
<!-- /AI-CODE-OPTIMIZATION -->

---

**Status**: Official Standard  
**Maintained By**: Platform Team  
**Last Updated**: 2025-07-12  
**Enforced By**: Automated CI/CD Pipeline
