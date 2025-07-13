<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="true" summary-threshold="low" -->category: architecture
complexity: advanced
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: fullstack
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# Coding Standards & Best Practices

Este documento define os padrões de código, convenções e melhores práticas para o projeto Kodix.

## 📏 Naming Conventions

### File & Directory Names

- **Components & Pages**: Use kebab-case (e.g., `chat-window.tsx`, `model-selector.tsx`)
- **Hooks**: Use kebab-case starting with "use" (e.g., `use-user-data.ts`, `use-chat-session.ts`)
- **Utils & Helpers**: Use kebab-case (e.g., `format-date.ts`, `api-helpers.ts`)
- **Types**: Use kebab-case (e.g., `user-profile.ts`, `chat-types.ts`)

### Code Naming

- **React Components**: PascalCase (e.g., `UserProfile`, `ChatWindow`)
- **Functions & Variables**: camelCase (e.g., `getUserData`, `chatSessions`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `MAX_ATTEMPTS`, `API_BASE_URL`)
- **TypeScript Interfaces**: PascalCase (e.g., `UserInterface`, `ChatMessage`)
- **Database Schemas**: camelCase for tables and columns

## 🗂️ File Structure Standards

### Component Structure

```
Component/
├── index.ts                # Exports component
├── Component.tsx           # Main implementation
├── Component.test.tsx      # Tests
├── Component.stories.tsx   # Storybook (if applicable)
├── types.ts               # Component-specific types
└── utils.ts               # Component-specific utilities
```

### Page Structure (Next.js)

```
apps/kdx/src/app/[locale]/(authed)/apps/{subapp-name}/
├── page.tsx               # Main page component
├── layout.tsx             # Layout (if needed)
├── loading.tsx            # Loading UI
├── error.tsx              # Error UI
└── components/            # Page-specific components
    ├── PageHeader.tsx
    ├── PageContent.tsx
    └── PageSidebar.tsx
```

### Package Structure

```
packages/package-name/
├── src/
│   ├── index.ts           # Main exports
│   ├── types/             # Type definitions
│   ├── utils/             # Utility functions
│   ├── components/        # React components (if applicable)
│   └── hooks/             # Custom hooks (if applicable)
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 Code Quality Standards

### General Principles

1. **DRY (Don't Repeat Yourself)**: Extract shared logic into reusable functions/components
2. **KISS (Keep It Simple, Stupid)**: Prefer simple solutions over complex ones
3. **SRP (Single Responsibility Principle)**: Each function/component should have one responsibility
4. **File Size**: Keep files under 300 lines. If larger, consider splitting

### Code Simplicity & Maintainability

#### General Best Practices

1. **Simplicity First**:

   - Favor straightforward, simple solutions over overly complex ones
   - Complexity is a tax on future developers (including yourself)
   - If a solution seems too complicated, there's likely a simpler approach

2. **Avoid Code Duplication**:

   - Always check if similar functionality exists elsewhere before writing new code
   - Use shared utility functions, hooks, or components to reduce repetition
   - When you find duplicated logic, refactor into a single, reusable implementation

3. **Refactoring Large Modules**:

   - Keep files under 300 lines of code
   - When a file grows beyond 200-250 lines, consider breaking it into smaller, focused modules
   - Look for natural separation points:
     - Separate UI components from logic
     - Extract complex calculations into utility functions
     - Create dedicated hooks for stateful logic

4. **Technology & Pattern Management**:
   - When introducing a new approach or library, ensure it completely replaces any old approach
   - Avoid maintaining multiple ways of solving the same problem
   - Remove deprecated code and patterns during refactoring

#### Refactoring Guidelines

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ❌ Bad: Large, monolithic function with multiple responsibilities
function processUserData(user: User, action: string) {
  // Validation
  if (!user.email) throw new Error("Invalid email");

  // Data transformation
  const formattedUser = {
    name: user.name.toUpperCase(),
    email: user.email.toLowerCase(),
  };

  // Logging
  console.log(`Processing user: ${user.name}`);

  // Action-specific logic
  if (action === "create") {
    // Create user logic
  } else if (action === "update") {
    // Update user logic
  }

  // Database interaction
  saveUserToDatabase(formattedUser);
}

// ✅ Good: Separated concerns, smaller focused functions
function validateUser(user: User) {
  if (!user.email) throw new Error("Invalid email");
}

function formatUserData(user: User) {
  return {
    name: user.name.toUpperCase(),
    email: user.email.toLowerCase(),
  };
}

function logUserAction(user: User, action: string) {
  console.log(`Processing user: ${user.name}, Action: ${action}`);
}

function createUser(user: FormattedUser) {
  // Specific create logic
}

function updateUser(user: FormattedUser) {
  // Specific update logic
}

function processUserData(user: User, action: string) {
  validateUser(user);
  const formattedUser = formatUserData(user);
  logUserAction(user, action);

  if (action === "create") {
    createUser(formattedUser);
  } else if (action === "update") {
    updateUser(formattedUser);
  }
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

#### Warning Signs for Refactoring

- Functions with more than 20-30 lines of code
- More than 3-4 nested conditional statements
- Repeated code blocks across multiple files
- Complex, hard-to-understand logic
- Functions with more than 2-3 parameters
- Classes or components doing too many things

**Remember**: Good code is read more often than it is written. Optimize for readability, maintainability, and simplicity.

### TypeScript Best Practices

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Good: Explicit return types for public APIs
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Good: Use strict types instead of any
interface ApiResponse<T> {
  data: T;
  status: "success" | "error";
  message?: string;
}

// ✅ Good: Use const assertions for immutable objects
const STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

// ❌ Avoid: Using any type
function processData(data: any): any {
  // ...
}

// ❌ Avoid: Implicit any in function parameters
function handleClick(event) {
  // ...
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### React Best Practices

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Good: Use proper prop types
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({ children, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn('btn', `btn-${variant}`)}
      {...props}
    >
      {children}
    </button>
  );
}

// ✅ Good: Use React.memo for expensive components
export const ExpensiveComponent = React.memo(function ExpensiveComponent({
  data,
}: {
  data: ComplexData[];
}) {
  const processedData = useMemo(
    () => data.map(item => processItem(item)),
    [data]
  );

  return <div>{/* render processed data */}</div>;
});

// ✅ Good: Custom hooks for reusable logic
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🔒 Security Standards

### Input Validation

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Good: Always validate with Zod
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().min(18).max(120),
});

// ✅ Good: Sanitize user inputs
function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input);
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Authentication & Authorization

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Good: Use tRPC middleware for protected routes
export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.auth.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  return next({
    ctx: {
      ...ctx,
      auth: ctx.auth,
    },
  });
});

// ✅ Good: Check permissions granularly
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.auth.user.roles.includes("ADMIN")) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({ ctx });
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🎨 UI/UX Standards

### Component Design Principles

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Good: Compound component pattern
export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Content: CardContent,
  Footer: CardFooter,
};

// Usage
<Card.Root>
  <Card.Header>
    <h2>Title</h2>
  </Card.Header>
  <Card.Content>
    Content here
  </Card.Content>
</Card.Root>

// ✅ Good: Consistent prop patterns
interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Accessibility Standards

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Good: Proper ARIA attributes
<button
  aria-label="Close dialog"
  aria-expanded={isOpen}
  onClick={handleClose}
>
  ×
</button>

// ✅ Good: Semantic HTML
<main>
  <article>
    <header>
      <h1>Article Title</h1>
    </header>
    <section>
      <p>Article content...</p>
    </section>
  </article>
</main>
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🗄️ Database Standards

### Schema Design

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Good: Consistent naming and structure
export const users = mysqlTable("users", {
  id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ✅ Good: Proper relationships
export const userRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  teamMembers: many(teamMembers),
}));
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Query Patterns

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Good: Use repositories for complex queries
export const UserRepository = {
  async findByEmail(email: string) {
    return db.query.users.findFirst({
      where: eq(users.email, email),
      with: {
        teamMembers: {
          with: {
            team: true,
          },
        },
      },
    });
  },

  async createWithTeam(userData: NewUser, teamData: NewTeam) {
    return db.transaction(async (tx) => {
      const user = await tx.insert(users).values(userData).returning();
      const team = await tx.insert(teams).values(teamData).returning();

      await tx.insert(teamMembers).values({
        userId: user[0].id,
        teamId: team[0].id,
        role: "OWNER",
      });

      return { user: user[0], team: team[0] };
    });
  },
};
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🧪 🧪 Testing Standards

### Unit Tests

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Good: Descriptive test names
describe("UserService", () => {
  describe("createUser", () => {
    it("should create user with valid data", async () => {
      const userData = { email: "test@example.com", name: "Test User" };
      const result = await UserService.createUser(userData);

      expect(result).toMatchObject({
        email: userData.email,
        name: userData.name,
        id: expect.any(String),
      });
    });

    it("should throw error when email already exists", async () => {
      const userData = { email: "existing@example.com", name: "Test User" };

      await expect(UserService.createUser(userData)).rejects.toThrow(
        "Email already exists",
      );
    });
  });
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Component Tests

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Good: Test user interactions
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🚀 Performance Standards

### React Performance

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Good: Memoize expensive calculations
const ExpensiveComponent = ({ data }: { data: Item[] }) => {
  const processedData = useMemo(
    () => data.filter(item => item.active).sort((a, b) => a.priority - b.priority),
    [data]
  );

  const handleItemClick = useCallback((id: string) => {
    // Handle click
  }, []);

  return (
    <div>
      {processedData.map(item => (
        <ItemComponent key={item.id} item={item} onClick={handleItemClick} />
      ))}
    </div>
  );
};

// ✅ Good: Use React.memo for pure components
const ItemComponent = React.memo(({ item, onClick }: ItemProps) => {
  return <div onClick={() => onClick(item.id)}>{item.name}</div>;
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Database Performance

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ Good: Use indexes for frequently queried fields
export const users = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 30 }).primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    teamId: varchar("team_id", { length: 30 }).notNull(),
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
    teamIdx: index("team_idx").on(table.teamId),
  }),
);

// ✅ Good: Limit and paginate large queries
export async function getUsers(page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  return db.query.users.findMany({
    limit,
    offset,
    orderBy: [desc(users.createdAt)],
  });
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Formulários e Modais

1.  **Submissão com "Enter"**: Todos os formulários, especialmente os contidos em modais (`Dialog`), devem permitir a submissão através da tecla "Enter".

    - **Implementação**: Envolva os campos de entrada e os botões em uma tag `<form>`. A ação principal (ex: "Criar", "Salvar") deve ter o atributo `type="submit"`. O botão de cancelamento deve ter `type="button"` para não submeter o formulário.
    - **Exemplo**:
      ```tsx
      <DialogContent>
        <form onSubmit={handleCreate}>
          <DialogHeader>
            <DialogTitle>Criar Item</DialogTitle>
          </DialogHeader>
          {/* ... input fields ... */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit">Criar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
      ```

2.  **Rótulos e Placeholders**:
    - Para formulários complexos, use sempre `<Label>` para acessibilidade.
    - Para formulários simples dentro de modais (como o de "Criar Pasta"), onde o título do modal já descreve a ação, é aceitável omitir o `<Label>` e usar apenas o `placeholder` no `<Input>`, para uma UI mais limpa.
