<!-- AI-METADATA:
category: interactive
complexity: advanced
updated: 2025-01-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: developers
ai-context-weight: important
-->

<!-- AI-CONTEXT-BOUNDARY: start -->
# Live Interactive Examples

> Interactive documentation templates with executable code examples and real-time validation

## 🎯 Purpose

Provide interactive, executable examples that work with the actual Kodix development environment, enabling developers to test and understand patterns in real-time.

## 🚀 Interactive Components

### Live tRPC Example

```markdown
<!-- AI-INTERACTIVE-EXAMPLE: trpc-user-query -->
# Live tRPC User Query

Try this example with real API calls:

```typescript-live
// AI-CONTEXT: Live example connected to development API
import { useTRPC } from "~/trpc/react";
import { useQuery } from "@tanstack/react-query";

function UserExample() {
  const trpc = useTRPC();
  
  const { data, isLoading, error } = trpc.user.getById.useQuery({
    id: "demo-user-id"
  });

  if (isLoading) return <div>Loading user...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div className="p-4 border rounded">
      <h3>User Details</h3>
      <p>Name: {data?.name}</p>
      <p>Email: {data?.email}</p>
      <p>Team: {data?.team?.name}</p>
    </div>
  );
}
```

**Live Result**: [Interactive component renders here]
**API Response Time**: [Real metrics displayed]
**Try Variations**: 
- Change the user ID
- Add error handling
- Test with invalid data

<!-- /AI-INTERACTIVE-EXAMPLE -->
```

### Component Playground

```markdown
<!-- AI-PLAYGROUND: react-component -->
# Component Playground

Build and test components interactively:

```typescript-playground
// AI-CONTEXT: Interactive component builder
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function PlaygroundComponent() {
  const [name, setName] = useState("");
  const [count, setCount] = useState(0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Interactive Example</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <p>Hello, {name || "World"}!</p>
        
        <div className="flex items-center gap-2">
          <Button onClick={() => setCount(count - 1)}>-</Button>
          <span>Count: {count}</span>
          <Button onClick={() => setCount(count + 1)}>+</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Live Preview**: [Component renders in real-time]
**Props Panel**: [Interactive props editor]
**Style Editor**: [Tailwind class editor]

<!-- /AI-PLAYGROUND -->
```

## 🔧 Interactive API Documentation

### Live API Testing

```markdown
<!-- AI-API-TESTER: user-router -->
# User Router API Tester

Test API endpoints with real data:

## GET /api/user/:id

**Input Schema**:
```typescript
{
  id: string (UUID format)
}
```

**Interactive Test**:
```json-interactive
{
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

[**Send Request**] [**Clear**] [**Use Sample Data**]

**Response**:
```json-live
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "team": {
    "id": "team-123",
    "name": "Development Team"
  },
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Status**: ✅ 200 OK | **Time**: 120ms | **Size**: 1.2KB

<!-- /AI-API-TESTER -->
```

### Schema Validator

```markdown
<!-- AI-SCHEMA-VALIDATOR: create-user -->
# Create User Schema Validator

Validate your data against the schema:

**Schema**:
```typescript
const createUserSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  role: z.enum(["admin", "member", "viewer"]),
  teamId: z.string().uuid(),
});
```

**Test Your Data**:
```json-validator
{
  "name": "",
  "email": "invalid-email",
  "role": "invalid-role", 
  "teamId": "not-a-uuid"
}
```

**Validation Results**:
❌ **name**: String must contain at least 1 character(s)
❌ **email**: Invalid email format
❌ **role**: Must be one of: admin, member, viewer
❌ **teamId**: Invalid UUID format

[**Fix Issues**] [**Use Valid Example**] [**Clear**]

<!-- /AI-SCHEMA-VALIDATOR -->
```

## 🎨 Interactive UI Examples

### Component Gallery

```markdown
<!-- AI-COMPONENT-GALLERY: ui-components -->
# Kodix UI Component Gallery

Explore and test all available components:

## Buttons

```typescript-gallery
// AI-CONTEXT: Interactive button showcase
import { Button } from "@/components/ui/button";

const buttonVariants = [
  { variant: "default", children: "Default" },
  { variant: "destructive", children: "Destructive" },
  { variant: "outline", children: "Outline" },
  { variant: "secondary", children: "Secondary" },
  { variant: "ghost", children: "Ghost" },
  { variant: "link", children: "Link" }
];

const buttonSizes = ["sm", "default", "lg"];

function ButtonGallery() {
  return (
    <div className="space-y-4">
      {buttonVariants.map((props) => (
        <div key={props.variant} className="flex gap-2">
          {buttonSizes.map((size) => (
            <Button key={size} {...props} size={size} />
          ))}
        </div>
      ))}
    </div>
  );
}
```

**Interactive Features**:
- [**Copy Code**] - Copy component code
- [**View Props**] - See all available props
- [**Customize**] - Modify props interactively

<!-- /AI-COMPONENT-GALLERY -->
```

### Form Builder

```markdown
<!-- AI-FORM-BUILDER: interactive-forms -->
# Interactive Form Builder

Build forms visually and generate code:

**Drag & Drop Interface**:
┌─────────────────────────┐
│ 📝 Input Field         │
│ ✅ Checkbox            │
│ 🔘 Radio Group         │
│ 📋 Select Dropdown     │
│ 📝 Textarea            │
│ 🗓️ Date Picker         │
│ 🔢 Number Input        │
│ 🎛️ Switch              │
└─────────────────────────┘

**Form Preview**:
```typescript-form-preview
// Generated form component
function GeneratedForm() {
  const form = useForm({
    resolver: zodResolver(generatedSchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields generated based on builder */}
      </form>
    </Form>
  );
}
```

**Generated Code**: [**Download**] [**Copy**] [**Preview**]

<!-- /AI-FORM-BUILDER -->
```

## 📊 Real-Time Data Visualization

### Performance Monitor

```markdown
<!-- AI-PERFORMANCE-MONITOR: real-time -->
# Real-Time Performance Monitor

Monitor your app's performance in real-time:

```typescript-monitor
// AI-CONTEXT: Live performance monitoring
import { usePerformanceMonitor } from "~/hooks/usePerformanceMonitor";

function PerformanceMonitor() {
  const metrics = usePerformanceMonitor();
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        title="API Response Time"
        value={`${metrics.apiResponseTime}ms`}
        trend={metrics.apiTrend}
      />
      <MetricCard
        title="Bundle Size"
        value={`${metrics.bundleSize}KB`}
        trend={metrics.sizeTrend}
      />
      <MetricCard
        title="Core Web Vitals"
        value={metrics.coreWebVitals}
        trend={metrics.vitalsTrend}
      />
      <MetricCard
        title="Error Rate"
        value={`${metrics.errorRate}%`}
        trend={metrics.errorTrend}
      />
    </div>
  );
}
```

**Live Metrics**:
- API Response: 120ms ⬇️ (-15ms)
- Bundle Size: 245KB ➡️ (stable)
- LCP: 1.2s ⬇️ (improved)
- Error Rate: 0.1% ⬇️ (-0.2%)

[**Export Report**] [**Set Alerts**] [**View Details**]

<!-- /AI-PERFORMANCE-MONITOR -->
```

## 🧪 Interactive Testing

### Test Case Generator

```markdown
<!-- AI-TEST-GENERATOR: automated -->
# Interactive Test Case Generator

Generate comprehensive tests for your code:

**Select Code to Test**:
```typescript-testable
// AI-CONTEXT: Code to generate tests for
export class UserService {
  async createUser(data: CreateUserDto): Promise<User> {
    await this.validateCreateRules(data);
    
    const user = await this.db.insert(users).values({
      ...data,
      id: generateId(),
    }).returning();
    
    this.eventEmitter.emit('user.created', user);
    return user;
  }
}
```

**Generated Test Cases**:
```typescript-generated-tests
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // ✅ Happy path test
    });
    
    it('should validate input data', async () => {
      // ❌ Invalid input test
    });
    
    it('should enforce team isolation', async () => {
      // 🔒 Security test
    });
    
    it('should emit user.created event', async () => {
      // 📡 Event test
    });
  });
});
```

**Test Options**:
- [**Generate All**] - Create comprehensive test suite
- [**Happy Path Only**] - Basic functionality tests
- [**Edge Cases**] - Error and boundary tests
- [**Security Tests**] - Permission and isolation tests

<!-- /AI-TEST-GENERATOR -->
```

## 🔄 Live Code Validation

### Real-Time Linting

```markdown
<!-- AI-LIVE-LINTING: code-validator -->
# Live Code Validation

Write code and see validation in real-time:

```typescript-live-lint
// AI-CONTEXT: Live linting and validation
import { useTRPC } from "~/trpc/react";

export function UserProfile({ userId }: { userId: any }) {
  //                                               ^^^ ❌ ESLint: No 'any' types
  const trpc = useTRPC();
  
  const user = trpc.user.getById.useQuery({ 
    id: userId,
    team: "wrong-param" // ❌ TypeScript: Property doesn't exist
  });
  
  return (
    <div>
      <h1>User Profile</h1>
      {/* ❌ i18n: Hard-coded string */}
      <p>{user.name}</p>
      {/* ❌ Safe access: user might be undefined */}
    </div>
  );
}
```

**Validation Results**:
🔴 **3 errors**, 🟡 **2 warnings**

**Quick Fixes**:
- Replace `any` with `string`
- Remove invalid `team` parameter
- Use `t('user.profile.title')` for i18n
- Add optional chaining: `user?.name`

[**Apply All Fixes**] [**Ignore Warnings**] [**Configure Rules**]

<!-- /AI-LIVE-LINTING -->
```

## 📱 Device Testing

### Responsive Preview

```markdown
<!-- AI-RESPONSIVE-PREVIEW: device-testing -->
# Responsive Device Preview

Test your components across different devices:

```typescript-responsive
// AI-CONTEXT: Component to test across devices
function ResponsiveCard({ title, content }) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl lg:text-2xl">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm md:text-base">
          {content}
        </p>
      </CardContent>
    </Card>
  );
}
```

**Device Previews**:

📱 **Mobile (375px)**    📱 **Tablet (768px)**    💻 **Desktop (1200px)**
┌─────────────────┐    ┌───────────────────────┐    ┌─────────────────────────────┐
│ Card Title      │    │ Card Title            │    │ Card Title                  │
│                 │    │                       │    │                             │
│ Content text... │    │ Content text with     │    │ Content text with more      │
│                 │    │ more space...         │    │ space and larger text...    │
└─────────────────┘    └───────────────────────┘    └─────────────────────────────┘

[**iPhone 12**] [**iPad**] [**MacBook**] [**Custom Size**]

<!-- /AI-RESPONSIVE-PREVIEW -->
```

## 🔗 Related Resources

- [AI-First Markup](../standards/ai-first-markup.md)
- [Context Compression](../ai-optimization/context-compression.md)
- [Universal Prompt Patterns](../ai-optimization/universal-prompt-patterns.md)

<!-- AI-CONTEXT-BOUNDARY: end -->