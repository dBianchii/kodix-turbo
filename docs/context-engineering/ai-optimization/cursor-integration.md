<!-- AI-METADATA:
category: ai-optimization
complexity: intermediate
updated: 2025-01-12
claude-ready: true
phase: 4
priority: high
token-optimized: true
audience: developers
ai-context-weight: important
ai-tool: cursor
-->

<!-- AI-CONTEXT-BOUNDARY: start -->
# Cursor Integration Patterns

> Optimizing Kodix development workflow with Cursor AI editor

## 🎯 Purpose

Configure and optimize Cursor for maximum effectiveness with the Kodix codebase, leveraging its AI-powered features for enhanced productivity.

## ⚙️ Cursor Configuration

### Optimal Settings for Kodix

```json
{
  "cursor.aiProvider": "claude-3-opus",
  "cursor.contextLength": "medium",
  "cursor.includeComments": true,
  "cursor.includeImports": true,
  "cursor.temperature": 0.3,
  "cursor.maxTokens": 4000,
  "cursor.rules": [
    "Follow Kodix architecture patterns",
    "Use TypeScript strictly - no 'any' types",
    "Follow team-based isolation patterns",
    "Use existing UI components from shadcn/ui",
    "All strings must use i18n"
  ]
}
```

### Custom Rules Configuration

Create `.cursorrules` in project root:

```markdown
# Kodix Development Rules for Cursor

## Architecture
- Follow SubApp-based modular architecture
- Maintain team-based data isolation
- Use service layer for business logic
- Follow repository pattern for data access

## Code Standards
- TypeScript only, no 'any' types
- Use Zod for validation
- ESLint rules must pass
- Comprehensive error handling required

## Stack-Specific
- Frontend: Next.js 15, React 19, Tailwind CSS
- Backend: tRPC v11, Drizzle ORM, MySQL
- Use `useTRPC()` hook, never import { api }
- All user-facing strings need i18n

## Patterns
- Follow existing patterns in codebase
- Check similar implementations first
- Use existing utilities and helpers
- Maintain consistent naming conventions

## Testing
- Write tests for new features
- Follow existing test patterns
- Ensure team isolation in tests
```

## 🚀 Cursor Features for Kodix

### Smart Autocomplete Optimization

```markdown
**Contextual Autocomplete Setup**:

1. **Import Optimization**:
   \`\`\`typescript
   // Cursor will learn project import patterns
   import { useTRPC } from "~/trpc/react"; // ✅ Project convention
   import { api } from "~/trpc/client"; // ❌ Will be flagged
   \`\`\`

2. **Pattern Recognition**:
   \`\`\`typescript
   // Type "createTRPC" and Cursor suggests:
   export const resourceRouter = createTRPCRouter({
     create: protectedProcedure
       .input(z.object({
         teamId: z.string().uuid(),
         // Auto-completes based on patterns
       }))
       .mutation(async ({ ctx, input }) => {
         // Suggests service layer usage
       }),
   });
   \`\`\`

3. **Component Patterns**:
   \`\`\`typescript
   // Type "export function" in a component file
   export function ResourceCard({ resource }: ResourceCardProps) {
     const { t } = useTranslation(); // Auto-suggested
     const trpc = useTRPC(); // Auto-suggested
     
     // Cursor knows component patterns
   }
   \`\`\`
```

### Chat Interface Optimization

```markdown
**Effective Cursor Chat Prompts**:

1. **Feature Implementation**:
   > "Create a new tRPC endpoint for updating calendar events. Follow the pattern in user.router.ts, include team isolation and proper validation"

2. **Bug Fixing**:
   > "Fix the TypeScript error in CalendarView component. The event type doesn't match the schema"

3. **Refactoring**:
   > "Refactor this component to use the new shadcn/ui Card component instead of custom styling"

4. **Pattern Application**:
   > "Apply the service layer pattern from UserService to this calendar logic"
```

### Multi-File Edit Workflows

```markdown
**Cursor Multi-File Operations**:

1. **Feature Addition Across Stack**:
   \`\`\`
   Chat: "Add a 'priority' field to todos:
   1. Update schema in packages/db/schema/todo.ts
   2. Update service in packages/api/src/services/todo.service.ts  
   3. Update router in packages/api/src/routers/todo.router.ts
   4. Update UI in apps/web/src/subapps/todo/components/TodoForm.tsx"
   \`\`\`

2. **Consistent Refactoring**:
   \`\`\`
   Select multiple files → Cmd+K →
   "Rename 'Event' to 'CalendarEvent' in all selected files"
   \`\`\`

3. **Pattern Propagation**:
   \`\`\`
   Chat: "Apply the error handling pattern from user.service.ts 
   to all service files in the calendar subapp"
   \`\`\`
```

## 🎨 Cursor UI Integration

### Component Generation

```markdown
**Shadcn/ui Component Usage**:

\`\`\`typescript
// Cursor understands shadcn/ui patterns
// Type "Card" and get:
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Cursor suggests proper usage:
<Card>
  <CardHeader>
    <CardTitle>{t('resource.title')}</CardTitle>
    <CardDescription>{t('resource.description')}</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
\`\`\`

**Form Generation**:
\`\`\`typescript
// Ask Cursor: "Create a form for this schema"
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

// Cursor generates:
<Form {...form}>
  <FormField
    control={form.control}
    name="name"
    render={({ field }) => (
      <FormItem>
        <FormLabel>{t('form.name')}</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
\`\`\`
```

### Data Table Patterns

```markdown
**Cursor Data Table Generation**:

\`\`\`typescript
// Chat: "Create a data table for displaying users with sorting and filtering"

// Cursor generates complete implementation:
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {t('user.name')}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  // More columns...
];

export function UserTable({ teamId }: { teamId: string }) {
  const { data, isLoading } = useUsers(teamId);
  
  if (isLoading) return <TableSkeleton />;
  
  return (
    <DataTable 
      columns={columns} 
      data={data || []}
      searchKey="name"
    />
  );
}
\`\`\`
```

## 🔧 Cursor Workflow Tips

### Efficient Navigation

```markdown
**Cursor Navigation Shortcuts**:

1. **Symbol Search** (Cmd+Shift+O):
   - Quick jump to functions/types
   - Cursor learns your frequent targets

2. **Smart Go to Definition** (Cmd+Click):
   - Works across tRPC boundaries
   - Understands Kodix patterns

3. **Find References** (Shift+F12):
   - See all usages across SubApps
   - Cursor highlights pattern violations

4. **Quick Fix** (Cmd+.):
   - Auto-import with correct paths
   - Fix TypeScript errors
   - Apply ESLint fixes
```

### Debugging with Cursor

```markdown
**Cursor Debugging Features**:

1. **Inline Error Explanation**:
   - Hover over errors for AI explanations
   - Get fix suggestions specific to Kodix

2. **Smart Console Logs**:
   \`\`\`typescript
   // Select variable → Cmd+K → "Add debug log"
   console.log('[CalendarService] Creating event:', { input, userId: ctx.session.user.id });
   \`\`\`

3. **Breakpoint Suggestions**:
   - Cursor suggests strategic breakpoint locations
   - Based on error patterns in your code
```

## 📋 Cursor Commands Cheatsheet

### Essential Commands

| Command | Action | Kodix-Specific Use |
|---------|--------|-------------------|
| Cmd+K | AI Command | "Follow Kodix patterns" |
| Cmd+L | AI Chat | Complex refactoring |
| Cmd+Shift+L | Chat with Context | Include multiple files |
| Cmd+I | Inline Completion | Complete tRPC procedures |
| Cmd+Shift+I | Multi-line Completion | Generate full components |

### Custom Snippets

```json
{
  "Kodix tRPC Router": {
    "prefix": "krouter",
    "body": [
      "export const ${1:resource}Router = createTRPCRouter({",
      "  create: protectedProcedure",
      "    .input(create${1/(.*)/${1:/capitalize}/}Schema)",
      "    .mutation(async ({ ctx, input }) => {",
      "      const service = new ${1/(.*)/${1:/capitalize}/}Service(ctx.db);",
      "      return service.create({",
      "        ...input,",
      "        teamId: ctx.session.teamId,",
      "      });",
      "    }),",
      "});"
    ]
  },
  "Kodix Component": {
    "prefix": "kcomp",
    "body": [
      "interface ${1:Component}Props {",
      "  ${2:prop}: ${3:type};",
      "}",
      "",
      "export function ${1:Component}({ ${2:prop} }: ${1:Component}Props) {",
      "  const { t } = useTranslation();",
      "  const trpc = useTRPC();",
      "  ",
      "  return (",
      "    <div>",
      "      $0",
      "    </div>",
      "  );",
      "}"
    ]
  }
}
```

## 🚨 Common Pitfalls & Solutions

### Cursor-Specific Issues

```markdown
**1. Import Path Confusion**:
Problem: Cursor suggests wrong import paths
Solution: Configure path aliases in .cursorrules

**2. Pattern Deviation**:
Problem: Cursor generates code not following Kodix patterns
Solution: Add explicit pattern examples to .cursorrules

**3. Type Generation**:
Problem: Cursor creates 'any' types
Solution: Enable strict mode in cursor settings

**4. Context Overload**:
Problem: Cursor includes too much context
Solution: Use focused file selection for commands
```

## 🔍 Advanced Cursor Features

### AI Review Mode

```markdown
**Code Review with Cursor**:

1. **Select code block** → Cmd+K
2. **Review prompts**:
   - "Review for Kodix standards"
   - "Check team isolation"
   - "Verify error handling"
   - "Suggest performance improvements"

3. **Automated checks**:
   - TypeScript strict mode compliance
   - ESLint rule adherence
   - i18n string usage
   - Permission checks
```

### Test Generation

```markdown
**Cursor Test Generation**:

\`\`\`typescript
// Select function → Cmd+K → "Generate tests"
// Cursor creates:
describe('UserService', () => {
  let service: UserService;
  let mockDb: MockDatabase;
  
  beforeEach(() => {
    mockDb = createMockDb();
    service = new UserService(mockDb);
  });
  
  describe('create', () => {
    it('should create user with team isolation', async () => {
      // Test implementation following Kodix patterns
    });
  });
});
\`\`\`
```

## 🔗 Related Resources

- [Claude Code Optimization](./claude-code-optimization.md)
- [Universal Prompt Patterns](./universal-prompt-patterns.md)
- [Context Compression](./context-compression.md)

<!-- AI-CONTEXT-BOUNDARY: end -->