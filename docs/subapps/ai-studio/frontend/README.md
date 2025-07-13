<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="medium" -->category: subapp
complexity: intermediate
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: frontend
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# AI Studio Frontend

Frontend implementation documentation for the AI Studio SubApp, including React components, user interface patterns, and user experience design.

## 🔍 🎯 Overview

<!-- AI-COMPRESS: strategy="summary" max-tokens="150" -->
**Quick Summary**: Key points for rapid AI context understanding.
<!-- /AI-COMPRESS -->
AI Studio frontend provides the user interface for AI model management, provider configuration, and intelligent automation features within the Kodix platform.

### Core Features
- **Provider Management**: Configure and manage AI providers (OpenAI, Anthropic, Google)
- **Model Dashboard**: Create and manage AI models with parameters
- **Usage Analytics**: Track token usage, costs, and performance metrics
- **Testing Interface**: Test models with interactive chat interface

## 🏗️ 🏗️ Component Architecture

### Page Components
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Main AI Studio page
export default function AIStudioPage() {
  return (
    <div className="flex h-full">
      <AIStudioSidebar />
      <main className="flex-1 overflow-auto">
        <AIStudioContent />
      </main>
    </div>
  );
}

// Provider management page
export function ProvidersPage() {
  const trpc = useTRPC();
  const { data: providers } = useQuery(
    trpc.aiStudio.providers.list.queryOptions()
  );
  
  return (
    <div className="space-y-6">
      <ProviderHeader />
      <ProviderGrid providers={providers} />
      <AddProviderDialog />
    </div>
  );
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Component Structure
```
components/
├── providers/
│   ├── ProviderCard.tsx
│   ├── ProviderForm.tsx
│   ├── ProviderSettings.tsx
│   └── AddProviderDialog.tsx
├── models/
│   ├── ModelCard.tsx
│   ├── ModelForm.tsx
│   ├── ModelTesting.tsx
│   └── ModelMetrics.tsx
├── analytics/
│   ├── UsageChart.tsx
│   ├── CostTracker.tsx
│   ├── PerformanceMetrics.tsx
│   └── AnalyticsDashboard.tsx
└── shared/
    ├── AIStudioLayout.tsx
    ├── AIStudioSidebar.tsx
    └── AIStudioHeader.tsx
```

## 🎨 UI Design Patterns

### Provider Configuration
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
export function ProviderForm({ onSubmit }: ProviderFormProps) {
  const [form, setForm] = useState<ProviderConfig>({
    name: '',
    type: 'openai',
    apiKey: '',
    configuration: {}
  });
  
  return (
    <form onSubmit={(e) => handleSubmit(e, form)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Provider Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium">Provider Type</label>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as ProviderType })}
          className="mt-1 block w-full rounded-md border-gray-300"
        >
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="google">Google AI</option>
        </select>
      </div>
      
      <Button type="submit">Configure Provider</Button>
    </form>
  );
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Model Management Interface
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
export function ModelCard({ model }: { model: AIModel }) {
  const trpc = useTRPC();
  const updateModel = useMutation(
    trpc.aiStudio.models.update.mutationOptions()
  );
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{model.name}</h3>
        <Badge variant={model.isActive ? "success" : "secondary"}>
          {model.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>
      
      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-600">Model ID: {model.modelId}</p>
        <p className="text-sm text-gray-600">Provider: {model.provider.name}</p>
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => openTestDialog(model)}>
          Test Model
        </Button>
        <Button variant="outline" onClick={() => openEditDialog(model)}>
          Edit
        </Button>
      </div>
    </Card>
  );
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🔧 State Management

### API Integration
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// AI Studio hooks
export function useProviders() {
  const trpc = useTRPC();
  
  return useQuery(
    trpc.aiStudio.providers.list.queryOptions(),
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  );
}

export function useCreateProvider() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  return useMutation(
    trpc.aiStudio.providers.configure.mutationOptions(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['aiStudio', 'providers']);
        toast.success('Provider configured successfully');
      },
      onError: (error) => {
        toast.error(`Failed to configure provider: ${error.message}`);
      }
    }
  );
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Local State Management
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// AI Studio store (Zustand)
interface AIStudioStore {
  selectedProvider: string | null;
  selectedModel: string | null;
  testMode: boolean;
  
  setSelectedProvider: (providerId: string | null) => void;
  setSelectedModel: (modelId: string | null) => void;
  toggleTestMode: () => void;
}

export const useAIStudioStore = create<AIStudioStore>((set) => ({
  selectedProvider: null,
  selectedModel: null,
  testMode: false,
  
  setSelectedProvider: (providerId) => set({ selectedProvider: providerId }),
  setSelectedModel: (modelId) => set({ selectedModel: modelId }),
  toggleTestMode: () => set((state) => ({ testMode: !state.testMode }))
}));
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 📊 Analytics & Monitoring

### Usage Tracking
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
export function UsageChart({ timeRange }: { timeRange: TimeRange }) {
  const trpc = useTRPC();
  const { data: usage } = useQuery(
    trpc.aiStudio.usage.getStats.queryOptions({ timeRange })
  );
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Token Usage</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={usage?.daily}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="tokens" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Cost Monitoring
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
export function CostTracker({ models }: { models: AIModel[] }) {
  const totalCost = models.reduce((sum, model) => sum + model.monthlyUsage.cost, 0);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard
        title="Monthly Cost"
        value={`$${totalCost.toFixed(2)}`}
        change="+5.2%"
        trend="up"
      />
      <MetricCard
        title="Total Tokens"
        value={formatNumber(models.reduce((sum, m) => sum + m.monthlyUsage.tokens, 0))}
        change="+12.1%"
        trend="up"
      />
      <MetricCard
        title="Active Models"
        value={models.filter(m => m.isActive).length}
        change="+2"
        trend="up"
      />
    </div>
  );
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🚀 Getting Started

### Development Setup
1. **Component Development**: Use Storybook for isolated component development
2. **API Integration**: Configure tRPC client for AI Studio endpoints
3. **State Management**: Set up Zustand store for local state
4. **Styling**: Use Tailwind CSS with ShadCN/UI components

### Testing
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Component testing example
describe('ProviderCard', () => {
  it('renders provider information correctly', () => {
    const provider = mockProvider();
    render(<ProviderCard provider={provider} />);
    
    expect(screen.getByText(provider.name)).toBeInTheDocument();
    expect(screen.getByText(provider.type)).toBeInTheDocument();
  });
  
  it('handles provider activation', async () => {
    const provider = mockProvider({ isActive: false });
    const user = userEvent.setup();
    
    render(<ProviderCard provider={provider} />);
    
    await user.click(screen.getByText('Activate'));
    expect(mockUpdateProvider).toHaveBeenCalledWith({
      id: provider.id,
      isActive: true
    });
  });
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

**Status**: Under Development  
**Maintained By**: AI Studio Team  
**Last Updated**: 2025-07-12
