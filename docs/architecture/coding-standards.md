# Coding Standards & Best Practices

Este documento define os padrões de código, convenções e melhores práticas para o projeto Kodix.

## 📏 Naming Conventions

### File & Directory Names

- **Components & Pages**: Use kebab-case (e.g., `user-profile.tsx`)
- **Hooks**: Use camelCase starting with "use" (e.g., `useUserData.ts`)
- **Utils & Helpers**: Use kebab-case (e.g., `format-date.ts`)
- **Types**: Use PascalCase (e.g., `UserProfile.ts`)

### Code Naming

- **React Components**: PascalCase (e.g., `UserProfile`)
- **Functions & Variables**: camelCase (e.g., `getUserData`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `MAX_ATTEMPTS`)
- **TypeScript Interfaces**: PascalCase (e.g., `UserInterface`)
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
app/(authenticated)/route/
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

### TypeScript Best Practices

```typescript
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

### React Best Practices

```typescript
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

## 🔒 Security Standards

### Input Validation

```typescript
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

### Authentication & Authorization

```typescript
// ✅ Good: Use tRPC middleware for protected routes
export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.session.user,
    },
  });
});

// ✅ Good: Check permissions granularly
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user.roles.includes("ADMIN")) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({ ctx });
});
```

## 🎨 UI/UX Standards

### Component Design Principles

```typescript
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

### Accessibility Standards

```typescript
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

## 🗄️ Database Standards

### Schema Design

```typescript
// ✅ Good: Consistent naming and structure
export const users = mysqlTable("users", {
  id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ✅ Good: Proper relationships
export const userRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  teamMembers: many(teamMembers),
}));
```

### Query Patterns

```typescript
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

## 🧪 Testing Standards

### Unit Tests

```typescript
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

### Component Tests

```typescript
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

## 🚀 Performance Standards

### React Performance

```typescript
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

### Database Performance

```typescript
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

## 📝 Documentation Standards

### Code Comments

```typescript
/**
 * Calculates the total price including tax and discounts
 * @param items - Array of items to calculate total for
 * @param taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @param discountCode - Optional discount code to apply
 * @returns Object containing subtotal, tax, discount, and total
 */
export function calculateOrderTotal(
  items: OrderItem[],
  taxRate: number,
  discountCode?: string,
): OrderTotal {
  // Implementation...
}

// ✅ Good: Explain complex business logic
// Calculate compound interest using the formula: A = P(1 + r/n)^(nt)
// where P = principal, r = annual rate, n = compounds per year, t = time in years
const futureValue =
  principal *
  Math.pow(1 + annualRate / compoundsPerYear, compoundsPerYear * years);
```

### README Files

```markdown
# Package Name

Brief description of what this package does.

## Installation

\`\`\`bash
pnpm add @kdx/package-name
\`\`\`

## Usage

\`\`\`typescript
import { ComponentName } from '@kdx/package-name';

function MyComponent() {
return <ComponentName prop="value" />;
}
\`\`\`

## API Reference

### ComponentName

Props:

- `prop` (string): Description of the prop
- `optionalProp` (number, optional): Description of optional prop

## Contributing

See [coding standards](../../docs/architecture/coding-standards.md)
```

## 🔄 Git Standards

### Commit Messages

```bash
# ✅ Good: Use conventional commits
feat(auth): add OAuth2 Google provider
fix(ui): resolve button disabled state styling
docs(api): update tRPC router documentation
refactor(db): optimize user queries with indexes

# ❌ Avoid: Vague commit messages
git commit -m "fix stuff"
git commit -m "update"
git commit -m "wip"
```

### Branch Naming

```bash
# ✅ Good: Descriptive branch names
feature/user-authentication
fix/database-connection-timeout
refactor/api-error-handling
docs/update-development-guide

# ❌ Avoid: Unclear branch names
fix-bug
new-feature
update
```

## 📊 Code Review Standards

### Review Checklist

- [ ] Code follows naming conventions
- [ ] No hardcoded values (use constants/config)
- [ ] Proper error handling implemented
- [ ] Security considerations addressed
- [ ] Performance implications considered
- [ ] Tests included for new functionality
- [ ] Documentation updated if needed
- [ ] Accessibility standards met (for UI changes)

### Review Comments

```markdown
# ✅ Good: Constructive feedback

Consider extracting this logic into a custom hook for reusability.

This query could benefit from an index on the `created_at` column for better performance.

# ✅ Good: Suggest specific improvements

Instead of `any`, consider using a more specific type like `User | null`.

# ❌ Avoid: Non-constructive comments

This is wrong.
Bad code.
```

---

_This document should be updated as the project evolves and new patterns emerge._
