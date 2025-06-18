# Frontend Architecture - AI Studio SubApp

## 📱 Visão Geral

O frontend do AI Studio foi construído com React e Next.js, oferecendo uma interface intuitiva para gerenciamento completo de recursos de IA. A arquitetura segue o padrão de tabs com componentes modulares para cada seção.

## 🏗️ Estrutura de Componentes

### Componentes Principais

#### `AiStudioContent`

- **Localização**: `_components/ai-studio-content.tsx`
- **Responsabilidade**: Container principal com sistema de tabs
- **Características**:
  - Gerencia navegação entre seções
  - Mantém estado da tab ativa
  - Coordena carregamento de dados

#### `AppSidebar`

- **Localização**: `_components/app-sidebar.tsx`
- **Responsabilidade**: Navegação lateral entre seções
- **Funcionalidades**:
  - Links para cada seção do AI Studio
  - Indicador visual da seção ativa
  - Ícones representativos

### Seções Principais

#### `ProvidersSection`

- **Localização**: `_components/sections/providers-section.tsx`
- **Funcionalidades**:
  - Listagem de provedores com cards
  - Criação/edição via dialogs
  - Toggle de ativação rápida
  - Indicadores visuais de status

#### `ModelsSection`

- **Localização**: `_components/sections/models-section.tsx`
- **Funcionalidades**:
  - Grid de modelos agrupados por provedor
  - Configuração de parâmetros
  - Sistema de priorização
  - Filtros por provedor/status

#### `AgentsSection`

- **Localização**: `_components/sections/agents-section.tsx`
- **Funcionalidades**:
  - Cards de agentes com preview
  - Editor de system prompt
  - Seleção de modelo base
  - Gestão de configurações

#### `TokensSection`

- **Localização**: `_components/sections/tokens-section.tsx`
- **Funcionalidades**:
  - Lista segura de tokens (ofuscados)
  - Criação com validação
  - Indicador de provedor associado
  - Remoção com confirmação

## 🎨 Interface e UX

### Design System

```tsx
// Tema dark consistente
const containerClasses =
  "rounded-lg border bg-card text-card-foreground shadow-sm";
const headerClasses = "text-2xl font-bold tracking-tight";
const buttonClasses = "inline-flex items-center justify-center";
```

### Componentes de UI

- **Cards**: Exibição de recursos com ações rápidas
- **Dialogs**: Formulários de criação/edição
- **Badges**: Status e categorização
- **Tooltips**: Informações contextuais
- **Loading States**: Skeletons durante carregamento

### Responsividade

```tsx
// Grid adaptativo para diferentes telas
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {providers.map((provider) => (
    <ProviderCard key={provider.id} provider={provider} />
  ))}
</div>
```

## 🔧 Gerenciamento de Estado

### React Query para Server State

```tsx
// Hook para buscar provedores
const { data: providers } = useQuery(
  trpc.app.aiStudio.findAiProviders.queryOptions(),
);

// Mutation para criar provedor
const createProvider = useMutation(
  trpc.app.aiStudio.createAiProvider.mutationOptions(),
);
```

### Estado Local com useState

```tsx
// Controle de dialogs
const [createDialogOpen, setCreateDialogOpen] = useState(false);

// Tab ativa
const [activeTab, setActiveTab] = useState<Tab>("providers");
```

## 🎣 Hooks Customizados

### `useAiStudioData`

```tsx
export function useAiStudioData() {
  const providers = useQuery(trpc.app.aiStudio.findAiProviders.queryOptions());
  const models = useQuery(trpc.app.aiStudio.findAiModels.queryOptions());
  const agents = useQuery(trpc.app.aiStudio.findAiAgents.queryOptions());

  return {
    providers: providers.data?.providers ?? [],
    models: models.data?.models ?? [],
    agents: agents.data?.agents ?? [],
    isLoading: providers.isLoading || models.isLoading || agents.isLoading,
  };
}
```

### `useProviderMutations`

```tsx
export function useProviderMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: trpc.app.aiStudio.createAiProvider.mutate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aiStudio", "providers"] });
      toast.success("Provedor criado com sucesso!");
    },
  });

  return { create, update, delete: deleteProvider };
}
```

## 📊 Fluxo de Dados

### Carregamento Inicial

1. **Página carrega** → `AiStudioContent` monta
2. **React Query** busca dados de todas as seções
3. **Loading states** mostram skeletons
4. **Dados chegam** → UI atualiza automaticamente

### Operações CRUD

1. **Usuário interage** → Dialog/Form abre
2. **Validação local** → Zod schemas
3. **Mutation executada** → Loading state
4. **Sucesso/Erro** → Toast notification
5. **Cache invalidado** → UI atualiza

## 🚀 Performance

### Code Splitting

```tsx
// Carregamento dinâmico de seções pesadas
const AgentsSection = dynamic(
  () => import("./_components/sections/agents-section"),
  { ssr: false },
);
```

### Memoização

```tsx
// Evitar re-renders desnecessários
const ProviderCard = memo(({ provider }) => {
  return <Card>...</Card>;
});
```

### Otimização de Queries

```tsx
// Stale-while-revalidate
const { data } = useQuery({
  queryKey: ["providers"],
  queryFn: fetchProviders,
  staleTime: 5 * 60 * 1000, // 5 minutos
});
```

## 🎯 Padrões de Componentes

### Composição com Compound Components

```tsx
<Card>
  <CardHeader>
    <CardTitle>{provider.name}</CardTitle>
    <CardDescription>{provider.type}</CardDescription>
  </CardHeader>
  <CardContent>
    <ProviderDetails provider={provider} />
  </CardContent>
  <CardFooter>
    <ProviderActions provider={provider} />
  </CardFooter>
</Card>
```

### Props Pattern

```tsx
interface ProviderCardProps {
  provider: Provider;
  onEdit?: (provider: Provider) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}
```

## 🔐 Segurança no Frontend

### Validação de Inputs

- Schemas Zod para todos os formulários
- Sanitização de strings antes de envio
- Validação de URLs e formatos

### Proteção de Dados Sensíveis

- Tokens sempre ofuscados na UI
- Sem armazenamento local de credenciais
- Confirmações para ações destrutivas

## 🧪 Testabilidade

### Estrutura Testável

```tsx
// Componentes puros facilitam testes
export function ProviderCard({ provider, onEdit }) {
  return <div data-testid={`provider-${provider.id}`}>...</div>;
}
```

### Mocks para Desenvolvimento

```tsx
// Mock data para desenvolvimento
const mockProviders = [
  { id: "1", name: "OpenAI", type: "OPENAI", enabled: true },
  { id: "2", name: "Anthropic", type: "ANTHROPIC", enabled: false },
];
```

## 📱 Responsividade

### Mobile First

- Cards empilham verticalmente em telas pequenas
- Dialogs ocupam tela cheia em mobile
- Navegação adaptada para touch
- Fonts e espaçamentos otimizados

### Breakpoints

```css
/* Tailwind classes utilizadas */
sm: 640px   /* Tablets pequenos */
md: 768px   /* Tablets */
lg: 1024px  /* Desktops */
xl: 1280px  /* Telas grandes */
```
