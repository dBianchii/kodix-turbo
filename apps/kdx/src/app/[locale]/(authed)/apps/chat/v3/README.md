# Chat V3 - Assistant UI Integration

## 📖 Visão Geral

A **V3 do Chat** representa uma nova abordagem arquitetural do sistema de chat do Kodix, utilizando o `@assistant-ui/react` como camada de UI/UX moderna e mantendo nosso backend robusto (tRPC + AI Studio + MySQL).

## 🎨 Design System - Inspirado em assistant-ui.com

A V3 segue o **design moderno e clean** da [assistant-ui.com](https://www.assistant-ui.com/):

### ✅ **Sidebar Moderno**

- **New Thread Button**: Botão principal destacado como no site oficial
- **Busca Integrada**: Campo de pesquisa para encontrar conversas rapidamente
- **Organização Visual**: Pastas com expansão/colapso e contadores de sessões
- **Menu Contextual**: Ações rápidas no hover (editar, mover, excluir)
- **Empty States**: Estados vazios informativos e elegantes

### ✅ **Layout Responsivo**

- **Sidebar Fixa**: 320px de largura fixa para organização
- **Área Principal**: Flexível para o chat
- **Mobile First**: Design adaptável para dispositivos móveis

## 🚀 Funcionalidades Implementadas

### ✅ **V3 Completa**

- [x] **Sidebar com Sessões e Pastas**: Igual à V1 mas com design assistant-ui.com
- [x] **New Thread**: Criação de novas conversas com o mesmo backend
- [x] **Busca de Conversas**: Filtro em tempo real por título
- [x] **Organização por Pastas**: Sistema hierárquico completo
- [x] **Backend V1**: Usa mesmos endpoints (`/api/chat/stream`, `autoCreateSessionWithMessage`)
- [x] **Design System**: Baseado no visual da assistant-ui.com

### 🔄 **Em Desenvolvimento**

- [ ] **Assistant UI Runtime**: Integração completa com runtime nativo
- [ ] **Chat Interface**: Migração completa para componentes assistant-ui
- [ ] **Streaming Nativo**: Usar primitivos de streaming do assistant-ui
- [ ] **Ações de Sidebar**: Implementar edição, criação e exclusão de pastas/sessões

## 🏗️ **Arquitetura da V3**

```
/apps/chat/v3/
├── page.tsx                    # Página principal
├── layout.tsx                  # Layout com sidebar
├── _components/
│   ├── chat-v3-container.tsx   # Container principal com sidebar
│   ├── chat-v3-sidebar.tsx     # Sidebar estilo assistant-ui.com
│   ├── chat-v3-simple.tsx      # Interface de chat simplificada
│   └── chat-v3-interface.tsx   # Interface assistant-ui (completa)
└── _hooks/
    └── use-kodix-chat-runtime.tsx # Runtime personalizado
```

## 🎯 **Diferenças V1 → V3**

| Aspecto              | V1                 | V3                         |
| -------------------- | ------------------ | -------------------------- |
| **UI Framework**     | Custom + Shadcn/UI | Assistant UI + Shadcn/UI   |
| **Sidebar Design**   | Funcional          | Moderno (assistant-ui.com) |
| **State Management** | Custom hooks       | Assistant UI Runtime       |
| **Chat Components**  | Custom components  | Assistant UI Primitives    |
| **Backend**          | ✅ **Mesmo**       | ✅ **Mesmo**               |
| **Database**         | ✅ **Mesmo**       | ✅ **Mesmo**               |

## 🔧 **Vantagens da V3**

### **🎨 UX Melhorada**

- **Visual Moderno**: Design inspirado no ChatGPT/assistant-ui.com
- **Interações Fluídas**: Hover states e transições suaves
- **Navegação Intuitiva**: New Thread button em destaque
- **Busca Rápida**: Filtro em tempo real sem delay

### **👨‍💻 DX (Developer Experience)**

- **Menos Código Custom**: Assistant UI gerencia complexidade da UI
- **Componentes Battle-tested**: Framework usado por empresas como Langchain
- **Manutenção Reduzida**: Foco no business logic, não na UI
- **TypeScript Nativo**: Tipagem completa e autocomplete

### **⚡ Performance**

- **Streaming Otimizado**: Primitivos nativos para streaming
- **Re-renders Minimizados**: State management otimizado
- **Bundle Size**: Componentes tree-shakable

## 🌐 **Backend Integration**

### **✅ Mesmos Endpoints da V1**

```typescript
// Streaming de mensagens
POST / api / chat / stream;

// Criação de sessões
api.app.chat.autoCreateSessionWithMessage;

// Busca de sessões
api.app.chat.listarSessions;

// Busca de pastas
api.app.chat.buscarChatFolders;
```

### **✅ Compatibilidade Total**

- **Database**: Mesmas tabelas (`chat_sessions`, `chat_messages`)
- **AI Studio**: Mesmo service layer para modelos
- **Authentication**: Mesmo sistema de autenticação
- **Team Isolation**: Mesmo isolamento por `teamId`

## 📱 **Como Usar**

### **1. Acessar a V3**

```
/apps/chat/v3
```

### **2. Criar Nova Conversa**

- Clicar em **"New Thread"** no sidebar
- Ou usar botão na tela inicial

### **3. Navegar Conversas**

- **Sidebar**: Lista de conversas e pastas
- **Busca**: Digite no campo de pesquisa
- **Organização**: Expandir/colapsar pastas

## 🔗 **Links Relacionados**

- **[Assistant UI Official](https://www.assistant-ui.com/)** - Design inspiration
- **[Chat V1 Documentation](../README.md)** - Documentação original
- **[Backend API Reference](../Chat_API_Reference.md)** - APIs usadas
- **[AI Studio Integration](../../ai-studio/README.md)** - Service layer

## 🚀 **Próximos Passos**

1. **Completar Integration**: Migrar chat-v3-simple.tsx para assistant-ui completo
2. **Implementar Ações**: CRUD de pastas e sessões no sidebar
3. **Mobile Optimization**: Melhorar responsividade para dispositivos móveis
4. **Performance Tuning**: Otimizar queries e re-renders
5. **Testing**: Adicionar testes automatizados

---

**💡 Resultado**: Uma interface de chat **moderna**, **funcional** e **battle-tested** que mantém toda a robustez do backend Kodix!

## 🚀 Objetivos da V3

### ✅ Implementado

- [x] **Assistant UI Integration**: Uso da biblioteca `@assistant-ui/react` para componentes primitivos
- [x] **Backend Compatibility**: Integração com APIs existentes (`/api/chat/stream`)
- [x] **Shadcn/UI Design**: Manutenção do design system Kodix
- [x] **Streaming Support**: Suporte nativo a streaming de respostas
- [x] **i18n Integration**: Uso das traduções existentes (`useTranslations`)

### 🔄 Em Desenvolvimento

- [ ] **Full Assistant UI Runtime**: Runtime customizado completo
- [ ] **tRPC Integration**: Hook personalizado para queries/mutations
- [ ] **Session Management**: Integração completa com gerenciamento de sessões
- [ ] **Folder Organization**: Sistema de pastas hierárquicas
- [ ] **Agent Selection**: Seleção dinâmica de agentes IA

## 🏗️ Arquitetura

```
Chat V3/
├── page.tsx                    # Página principal da V3
├── _components/
│   ├── chat-v3-container.tsx   # Container principal
│   ├── chat-v3-simple.tsx      # Implementação simplificada funcional
│   ├── chat-v3-interface.tsx   # Interface completa com Assistant UI
│   ├── kodix-markdown-text.tsx # Componente de markdown personalizado
│   └── kodix-tooltip-icon-button.tsx # Componente de tooltip
└── _hooks/
    └── use-kodix-chat-runtime.tsx # Hook de runtime personalizado
```

## 🔧 Stack Técnica

### Frontend

- **Assistant UI**: `@assistant-ui/react` para primitivos de chat
- **Streaming**: `ReadableStream` com processing chunk-by-chunk
- **State Management**: React hooks locais + React Query (via tRPC)
- **Styling**: Tailwind CSS + Shadcn/UI + Assistant UI CSS

### Backend (Reutilizado da V1)

- **API Endpoint**: `/api/chat/stream` - Streaming direto
- **tRPC Queries**: `api.app.chat.buscarMensagensTest.useQuery`
- **AI Integration**: AI Studio Service Layer
- **Database**: MySQL com Drizzle ORM

## 📚 Componentes Principais

### 1. ChatV3Container

Container principal que gerencia o estado da aplicação e renderiza a interface apropriada.

```typescript
// Demonstração com sessionId fictício
const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
```

### 2. ChatV3Simple

Implementação funcional que demonstra a integração completa:

- **Streaming nativo** via fetch + ReadableStream
- **Estado local** para mensagens e loading
- **Error handling** robusto
- **UI responsiva** com Shadcn/UI

### 3. ChatV3Interface (Planned)

Interface completa usando primitivos do Assistant UI:

- `ThreadPrimitive.Root` para container principal
- `ComposerPrimitive` para input de mensagens
- `MessagePrimitive` para renderização de mensagens
- `ActionBarPrimitive` para ações (copy, edit, etc.)

## 🔌 Integração com Backend Kodix

### API Compatibility

A V3 utiliza a mesma API de streaming da V1:

```typescript
POST /api/chat/stream
{
  "chatSessionId": "session-id",
  "content": "user message",
  "useAgent": true
}
```

### Response Format

```typescript
// Streaming chunks via ReadableStream
const reader = response.body.getReader();
const decoder = new TextDecoder("utf-8");

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value, { stream: true });
  // Process and update UI
}
```

### Team Isolation

Mantém isolamento por `teamId` via:

- Headers de autenticação forwarded
- Context validation no backend
- tRPC protected procedures

## 🎨 Design System Integration

### Shadcn/UI Components

- `Button`, `Input`, `Card`, `ScrollArea`
- `Alert`, `AlertDescription` para errors
- `Loader2` para loading states

### Assistant UI Styling

```css
/* Custom overrides em globals.css */
.aui-thread-welcome-root {
  /* ... */
}
.aui-composer-root {
  /* ... */
}
.aui-message-root {
  /* ... */
}
```

### Responsive Design

- Layout flexível com `flex-col`
- Mensagens com `max-w-[80%]`
- Mobile-first approach

## 🚀 Como Usar

### 1. Navegação

```
/apps/chat/v3
```

### 2. Demo Session

1. Clique em "Criar Sessão Demo"
2. Digite mensagens no input
3. Observe streaming em tempo real
4. Teste error handling e loading states

### 3. Backend Requirements

- AI Studio configurado com modelos
- Provider tokens válidos
- MySQL database ativo

## 🔍 Comparação V1 vs V3

| Aspecto               | V1 (Atual)            | V3 (Assistant UI)       |
| --------------------- | --------------------- | ----------------------- |
| **UI Library**        | Custom components     | Assistant UI primitives |
| **State Management**  | Local + tRPC          | Assistant UI Runtime    |
| **Streaming**         | Manual ReadableStream | Native Assistant UI     |
| **Message Rendering** | Custom markdown       | Assistant UI + plugins  |
| **Extensibility**     | Limited               | High (primitives)       |
| **Performance**       | Good                  | Better (optimized)      |
| **Bundle Size**       | Smaller               | Larger (more features)  |

## 🔮 Roadmap

### Phase 1: Core Integration ✅

- Basic streaming functionality
- Shadcn/UI integration
- Backend compatibility

### Phase 2: Advanced Features 🔄

- Full Assistant UI Runtime
- Custom chat adapter
- Message persistence via tRPC

### Phase 3: Feature Parity 📋

- Session management
- Folder organization
- Agent selection
- Model switching

### Phase 4: Enhancement 🚀

- Real-time collaborative editing
- Voice input/output
- Advanced markdown rendering
- Plugin system

## 🐛 Known Issues

1. **Translation Keys**: Algumas chaves não existem ainda
2. **Runtime Integration**: Hook personalizado em desenvolvimento
3. **Session Persistence**: Usando sessionId demo
4. **Error Recovery**: Implementação básica

## 📖 References

- [Assistant UI Documentation](https://www.assistant-ui.com/docs)
- [Kodix Chat V1 Documentation](../README.md)
- [AI Studio Integration](../../ai-studio/README.md)
- [Kodix Architecture Guide](../../../../../docs/architecture/README.md)

## 🤝 Contributing

1. Siga os padrões Kodix coding standards
2. Use `useTranslations()` para todas as strings
3. Mantenha isolamento por `teamId`
4. Teste streaming functionality
5. Documente novas features

---

**Status**: 🧪 **Experimental** - Em desenvolvimento ativo
**Version**: 0.1.0
**Last Updated**: 2024-12-19
