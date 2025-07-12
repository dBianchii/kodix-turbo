# 🚨 Playbook de Correção de Lint - Kodix (APRIMORADO v3.2)

**Data de Atualização:** 05/01/2025  
**Versão:** 3.2 - Incorpora lições críticas sobre imports não utilizados e diagnóstico completo
**Status:** ATIVO - Incorpora Lições Aprendidas dos Casos Práticos

> **📌 INSTRUÇÕES DE USO:** Este documento é um guia estratégico para diagnosticar, abordar e corrigir erros de lint de forma sistemática no projeto Kodix. Ele complementa o guia de regras obrigatórias (`kodix-eslint-coding-rules.md`), focando no "como" em vez de apenas no "o quê".

## 📜 Filosofia

A correção de erros de lint não é apenas uma tarefa de manutenção, mas uma oportunidade para elevar a qualidade arquitetural do nosso código. Cada correção deve seguir os princípios de:

- **Type Safety Rigorosa:** Eliminar ambiguidades e garantir a previsibilidade do código.
- **Mínima Complexidade:** Preferir soluções simples e diretas.
- **Máxima Clareza:** Escrever código que seja fácil para outros entenderem e manterem.
- **Pragmatismo na Implementação:** Focar em soluções eficazes e duradouras.

---

### 🏛️ **PREMISSA ARQUITETURAL FUNDAMENTAL: Sintoma vs. Causa Raiz**

**Antes de iniciar qualquer correção de lint**, a primeira pergunta a ser feita é:

> **Este erro de lint é um problema local ou é um sintoma de um problema arquitetural mais profundo, especificamente uma violação do "Protocolo de Contratos e Fronteiras de Dados"?**

Muitos erros de `lint` (especialmente `@typescript-eslint/no-unsafe-assignment`, `@typescript-eslint/no-explicit-any`, etc.) não são o problema real. Eles são o resultado de dados "inseguros" (de tipo `unknown` ou `any`) vazando da camada de dados para a camada de UI.

**Referência Obrigatória:** [Protocolo de Contratos e Fronteiras de Dados](../../architecture/data-contracts-and-boundaries.md)

```mermaid
graph TD
    subgraph "Camada de Dados"
        A[Origem: `t.json()` no DB] -->|propaga| B{tRPC: `unknown`}
    end
    subgraph "Camada de UI"
        B --> |🚨 **Fronteira Insegura** 🚨| C[Componente Pai]
        C --> |props: { data: unknown }| D(Componente Filho)
    end
    D --> E{**Erro de Lint<br/>(Sintoma)**}

    style E fill:#f44336,stroke:#333,color:white
```

#### **Seu Plano DEVE Seguir um destes caminhos:**

- **➡️ CAMINHO A (Problema Arquitetural):** Se a causa for uma fronteira de dados insegura, o plano de correção **DEVE** priorizar a implementação da "Barreira de Tipos" no componente pai ou hook que consome os dados, conforme o protocolo. Corrigir a fronteira primeiro; os erros de lint no filho desaparecerão como consequência.

- **➡️ CAMINHO B (Problema Local):** Se o erro for genuinamente local (ex: uma variável mal tipada dentro de um único componente, sem contaminação externa), prossiga com a metodologia padrão de 4 fases abaixo.

---

## 🎯 METODOLOGIA DE 4 FASES (BASEADA EM CASOS REAIS)

> **📚 Baseado em:** Refatoração bem-sucedida do `app-sidebar.tsx` (Janeiro 2025) - 100% de conformidade ESLint alcançada

**Referência Obrigatória de Execução:** [Protocolo de Linting e Type-Checking no Monorepo](../../architecture/linting-and-typechecking-protocol.md)

### **FASE 0: Planejamento e Aprovação (OBRIGATÓRIO)** 📝

**Objetivo:** Garantir que toda correção complexa seja planejada, documentada e aprovada antes da execução para minimizar riscos.

1.  **Criar um Plano de Execução:**

    - Antes de alterar qualquer linha de código, crie um novo arquivo `.md` detalhando o plano de correção.
    - **Localização:** Armazene o plano em um diretório de planejamento relevante (ex: `docs/subapps/chat/planning/`).
    - **Nomenclatura:** Use um nome descritivo (ex: `02-fix-component-name-lint-errors.md`).
    - Não execute o plano sem antes ter uma aprovação do plano pelo usuário.

2.  **Conteúdo do Plano:**

    - O plano **DEVE** seguir a estrutura de 4 fases descrita neste playbook.
    - Deve incluir:
      - Diagnóstico claro do problema e da causa raiz.
      - Ações detalhadas para cada fase.
      - Critérios de sucesso mensuráveis.
      - Análise de impacto e risco.

3.  **Revisão e Aprovação:**
    - O plano deve ser revisado por pelo menos um outro membro da equipe.
    - A execução só deve começar após a aprovação formal do plano.

### **🆕 FASE 0.5: Diagnóstico Completo de Erros (CRÍTICO)** 🔍

**Objetivo:** Identificar TODOS os erros de lint antes de iniciar correções, incluindo imports não utilizados e variáveis não utilizadas.

#### **0.5.1 Execução do Diagnóstico Completo**

```bash
# OBRIGATÓRIO: Executar lint específico no arquivo/componente
pnpm eslint apps/kdx/ --rule '@typescript-eslint/no-unused-vars: error' --rule 'unused-imports/no-unused-imports: error'

# Salvar resultado completo para análise
pnpm eslint apps/kdx/ > lint-errors-full.txt 2>&1

# Contar total de erros
pnpm eslint apps/kdx/ | grep -E "error|warning" | wc -l
```

#### **0.5.2 Categorização de Erros**

Categorize TODOS os erros encontrados:

1. **Imports não utilizados** (`@typescript-eslint/no-unused-vars`)
   - Hooks do React (`useCallback`, `useMemo`, etc.)
   - Tipos importados mas não usados
   - Componentes UI não utilizados
2. **Variáveis não utilizadas**

   - Variáveis de estado não utilizadas
   - Funções/mutations não utilizadas
   - Props desestruturadas não utilizadas

3. **Type Safety** (`@typescript-eslint/no-explicit-any`)

   - Estados com `any`
   - Parâmetros com `any`
   - Callbacks com `any`

4. **Outros erros**
   - Condições desnecessárias
   - Promises não tratadas
   - Chaves de tradução inexistentes

#### **0.5.3 Critério de Sucesso da Fase 0.5**

- [ ] Lista completa de TODOS os erros documentada
- [ ] Erros categorizados por tipo
- [ ] Total de erros contabilizado
- [ ] **NENHUM erro pode ser ignorado ou esquecido**

### **FASE 1: Estabelecer Fonte da Verdade dos Tipos** 🏗️

**Objetivo:** Criar tipos centralizados sem alterar código existente (100% Seguro).

#### **1.1 Preparação do Ambiente**

```bash
# Limpar caches do turbo e node_modules
pnpm turbo clean
rm -rf node_modules/.cache

# Verificar o estado inicial dos tipos no pacote alvo
pnpm typecheck --filter=@kdx/<nome-do-pacote>
```

#### **1.2 Criar Arquivo de Tipos Compartilhados**

```typescript
// Exemplo: apps/kdx/src/trpc/shared.ts
import type { AppRouter, RouterOutputs } from "@kdx/api";

// Tipos baseados na estrutura REAL da API
export type ChatFolderType =
  RouterOutputs["app"]["chat"]["findChatFolders"]["folders"][number];
export type ChatSessionType =
  RouterOutputs["app"]["chat"]["findSessions"]["sessions"][number];
export type AgentType =
  RouterOutputs["app"]["aiStudio"]["findAiAgents"]["agents"][number];
export type ModelType =
  RouterOutputs["app"]["aiStudio"]["findAvailableModels"][number];

// 🆕 NOVO: Tipos para Mensagens (Baseado em Casos Reais)
export type ChatSDKMessageType = {
  id: string;
  role: "user" | "assistant";
  content: string;
};
```

#### **1.3 Critério de Sucesso da Fase 1**

- [ ] Executar `pnpm typecheck` na raiz do projeto
- [ ] **Resultado esperado: 0 novos erros**
- [ ] Tipos exportados corretamente
- [ ] Nenhuma alteração no código existente

---

### **FASE 2: Correção Direcionada das Violações ESLint** 🔧

**Objetivo:** Corrigir TODAS as violações das regras ESLint do Kodix identificadas.

#### **2.1 Violações CRÍTICAS - Regra 2: TypeScript Type Safety**

##### **🚨 CRÍTICO: Remover `@ts-nocheck`**

```typescript
// ❌ VIOLAÇÃO (linha 1)
// @ts-nocheck

// ✅ CORREÇÃO
// Deletar linha completamente
```

##### **🚨 CRÍTICO: Corrigir `useState<any>(null)`**

```typescript
// ❌ VIOLAÇÃO
const [editingFolder, setEditingFolder] = useState<any>(null);
const [editingSession, setEditingSession] = useState<any>(null);
const [deletingFolder, setDeletingFolder] = useState<any>(null);
const [deletingSession, setDeletingSession] = useState<any>(null);
const [movingSession, setMovingSession] = useState<any>(null);

// ✅ CORREÇÃO
const [editingFolder, setEditingFolder] = useState<ChatFolderType | null>(null);
const [editingSession, setEditingSession] = useState<ChatSessionType | null>(
  null,
);
const [deletingFolder, setDeletingFolder] = useState<ChatFolderType | null>(
  null,
);
const [deletingSession, setDeletingSession] = useState<ChatSessionType | null>(
  null,
);
const [movingSession, setMovingSession] = useState<ChatSessionType | null>(
  null,
);
```

##### **🚨 CRÍTICO: Corrigir Parâmetros de Função `any`**

```typescript
// ❌ VIOLAÇÃO
const handleEditFolder = (folder: any) => { ... };
const handleEditSession = (session: any) => { ... };

// ✅ CORREÇÃO
const handleEditFolder = (folder: ChatFolderType) => { ... };
const handleEditSession = (session: ChatSessionType) => { ... };
```

##### **🚨 CRÍTICO: Corrigir Interfaces com `any`**

```typescript
// ❌ VIOLAÇÃO
interface FolderItemProps {
  folder: any;
  onEditSession: (session: any) => void;
  onDeleteSession: (session: any) => void;
}

// ✅ CORREÇÃO
interface FolderItemProps {
  folder: ChatFolderType;
  onEditSession: (session: ChatSessionType) => void;
  onDeleteSession: (session: ChatSessionType) => void;
}
```

#### **🆕 2.2 Correções de Imports Não Utilizados (Baseado em Casos Reais)**

##### **Padrão de Correção de Imports**

```typescript
// ❌ VIOLAÇÃO - Imports não utilizados
import { AlertCircle, Loader2, MessageCircle, RefreshCw } from "lucide-react";
import { Button } from "@kdx/ui/button";
import { Card } from "@kdx/ui/card";
import { Separator } from "@kdx/ui/separator";

// ✅ CORREÇÃO - Apenas imports necessários
import { AlertCircle } from "lucide-react";
```

#### **🆕 2.3 Correções de Condições Desnecessárias (Lição Aprendida)**

##### **Problema Comum: Optional Chaining Desnecessário**

```typescript
// ❌ VIOLAÇÃO - Conditional desnecessário
const { switchToThread, activeThreadId } = threadContext || {};
const currentLength = dbMessages?.length ?? 0;
if (!!sessionId) { ... }

// ✅ CORREÇÃO - Usar nullish coalescing apropriadamente
const { switchToThread, activeThreadId } = threadContext ?? {};
const currentLength = dbMessages?.length ?? 0;
if (Boolean(sessionId)) { ... }
```

#### **🆕 2.4 Correções de Promises (Lição Aprendida)**

##### **Floating Promises e Async/Await**

```typescript
// ❌ VIOLAÇÃO - Promise não tratada
append({
  id: `pending-${Date.now()}`,
  content: pendingMessage,
  role: "user",
});

// ✅ CORREÇÃO - Void para promises intencionalmente ignoradas
void append({
  id: `pending-${Date.now()}`,
  content: pendingMessage,
  role: "user",
});

// ❌ VIOLAÇÃO - Async callback desnecessário
const handleChatFinish = useCallback(
  async (_message: ChatSDKMessageType) => {
    // Sem await
  },
  [deps],
);

// ✅ CORREÇÃO - Remover async se não há await
const handleChatFinish = useCallback(
  (_message: ChatSDKMessageType) => {
    // Lógica síncrona
  },
  [deps],
);
```

#### **🆕 2.5 Correções de Chaves de Tradução (Lição Aprendida)**

##### **Problema: Chaves de Tradução Inexistentes**

```typescript
// ❌ VIOLAÇÃO - Chave não existe
{
  t("errors.loadingSession");
}
{
  t("errors.sendingMessage");
}

// ✅ CORREÇÃO - Usar chaves existentes
{
  t("messages.error");
}
{
  t("messages.errorOccurred", { error: "Unknown" });
}
```

#### **2.6 Adicionar Imports de Tipos Necessários**

```typescript
// ✅ ADICIONAR
import type { Message } from "@ai-sdk/react"; // 🆕 Para compatibilidade AI SDK
import type { TRPCClientError } from "@trpc/client";

import type {
  AgentType,
  ChatFolderType,
  ChatSDKMessageType, // 🆕 Novo tipo
  ChatSessionType,
  ModelType,
} from "~/trpc/shared";
```

#### **2.7 Critério de Sucesso da Fase 2**

- [ ] Executar `pnpm typecheck` e `pnpm lint`
- [ ] **Resultado esperado: 0 erros** no arquivo e em todo o projeto
- [ ] **Verificação específica:** 0 violações de `@typescript-eslint/no-explicit-any`
- [ ] **Verificação específica:** 0 violações de `no-ts-nocheck`
- [ ] **Verificação específica:** 0 violações de `no-api-import`
- [ ] **🆕 NOVO:** 0 violações de `@typescript-eslint/no-unnecessary-condition`
- [ ] **🆕 NOVO:** 0 violações de `@typescript-eslint/no-floating-promises`

---

### **FASE 3: Teste de Regressão Funcional** 🧪

**Objetivo:** Garantir que a refatoração não quebrou a funcionalidade.

#### **3.1 Criar Testes de Componente**

```typescript
// Exemplo: __tests__/components/app-sidebar.test.tsx
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppSidebar } from "../app-sidebar";

describe("AppSidebar", () => {
  it("should render without crashing", () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AppSidebar />
      </QueryClientProvider>
    );

    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});
```

#### **🆕 3.2 Testes de Compatibilidade de Tipos (Lição Aprendida)**

```typescript
// Exemplo: Teste específico para compatibilidade AI SDK
describe("Message Type Compatibility", () => {
  it("should handle AI SDK Message types correctly", () => {
    const aiSDKMessage: Message = {
      id: "test-id",
      role: "user",
      content: "test content",
    };

    const chatMessage: ChatSDKMessageType = {
      id: aiSDKMessage.id,
      role: aiSDKMessage.role === "assistant" ? "assistant" : "user",
      content: aiSDKMessage.content,
    };

    expect(chatMessage).toMatchObject({
      id: "test-id",
      role: "user",
      content: "test content",
    });
  });
});
```

#### **3.3 Implementar Smoke Tests com Mocks tRPC**

```typescript
// Mock das chamadas tRPC
const mockTRPC = {
  app: {
    chat: {
      findChatFolders: {
        queryOptions: () => ({
          queryKey: ["app.chat.findChatFolders"],
          queryFn: () => Promise.resolve({ folders: [] }),
        }),
      },
    },
  },
};
```

#### **3.4 Critério de Sucesso da Fase 3**

- [ ] Executar `pnpm test:chat` (ou teste específico do componente)
- [ ] **Resultado esperado: Todos os testes passam**
- [ ] Funcionalidade preservada após refatoração
- [ ] Renderização sem erros no console
- [ ] **🆕 NOVO:** Compatibilidade de tipos verificada

---

### **FASE 4: Verificação Final de Conformidade** ✅

**Objetivo:** Verificação completa de conformidade com regras ESLint do Kodix.

#### **4.1 Comandos de Verificação**

```bash
# Verificação de tipos
pnpm typecheck

# Verificação de lint com correções automáticas
pnpm lint --fix

# Verificação específica do pacote
pnpm eslint apps/kdx/
pnpm eslint packages/db/
```

#### **🆕 4.2 Verificação de Erros Específicos (Lição Aprendida)**

```bash
# Verificar violações específicas
pnpm lint | grep "no-ts-nocheck"
pnpm lint | grep "@typescript-eslint/no-explicit-any"
pnpm lint | grep "no-api-import"
pnpm lint | grep "@typescript-eslint/no-unnecessary-condition"
pnpm lint | grep "@typescript-eslint/no-floating-promises"
pnpm lint | grep "@typescript-eslint/no-unsafe-assignment"
```

#### **4.3 Critério de Sucesso da Fase 4**

- [ ] **Resultado esperado: 0 erros e 0 warnings ESLint**
- [ ] Conformidade 100% com `kodix-eslint-coding-rules.md`
- [ ] Código passa em todos os checks automáticos
- [ ] Documentação atualizada se necessário

---

## 🛠️ CATÁLOGO DE CORREÇÕES POR TIPO DE ERRO

### **Erro Tipo 1: Violações de Type Safety**

#### **Diagnóstico:**

```bash
# Identificar erros de any
pnpm lint | grep "@typescript-eslint/no-explicit-any"

# Identificar @ts-nocheck
pnpm lint | grep "no-ts-nocheck"
```

#### **Correção Padrão:**

```typescript
// ❌ ANTES
// @ts-nocheck
const data: any = response;

// ✅ DEPOIS
interface ResponseData {
  id: string;
  name: string;
}
const data: ResponseData = response;
```

### **🆕 Erro Tipo 2: Imports Incorretos e Não Utilizados**

#### **Diagnóstico:**

```bash
# Identificar imports incorretos
pnpm lint | grep "no-api-import"
pnpm lint | grep "@typescript-eslint/consistent-type-imports"
pnpm lint | grep "@typescript-eslint/no-unused-vars"
```

#### **Correção Padrão:**

```typescript
// ❌ ANTES
import { api } from "~/trpc/react";
import { User, useState, useEffect } from "react";
import { Button, Card, Separator } from "@kdx/ui"; // Imports não utilizados

// ✅ DEPOIS
import type { User } from "react";
import { useState, useEffect } from "react";
import { Button } from "@kdx/ui/button"; // Apenas o necessário
import { useTRPC } from "~/trpc/react";
```

### **🆕 Erro Tipo 3: Condições Desnecessárias**

#### **Diagnóstico:**

```bash
# Identificar condições desnecessárias
pnpm lint | grep "@typescript-eslint/no-unnecessary-condition"
```

#### **Correção Padrão:**

```typescript
// ❌ ANTES
const length = data?.length ?? 0; // Se data é sempre array
if (!!value) { ... } // Boolean desnecessário

// ✅ DEPOIS
const length = data.length; // Se data é garantidamente array
if (Boolean(value)) { ... } // Explícito quando necessário
```

### **Erro Tipo 4: Promises e Tratamento de Erros**

#### **Diagnóstico:**

```bash
# Identificar uso de Promise.all
pnpm lint | grep "no-restricted-syntax"
pnpm lint | grep "@typescript-eslint/no-floating-promises"
```

#### **Correção Padrão:**

```typescript
// ❌ ANTES
const results = await Promise.all([fetchUser(), fetchPosts()]);
append(message); // Promise não tratada

// ✅ DEPOIS
import { getSuccessesAndErrors } from "@kdx/shared";

const results = await Promise.allSettled([fetchUser(), fetchPosts()]);
const { successes, errors } = getSuccessesAndErrors(results);

void append(message); // Intencionalmente ignorada
```

### **🆕 Erro Tipo 5: Erros de "Sobrecarga" em Hooks (ex: useQuery)**

**Problema:** O compilador TypeScript pode falhar com o erro "Nenhuma sobrecarga corresponde a esta chamada" ao usar hooks genéricos como `useQuery` do TanStack Query com as `queryOptions` do tRPC, especialmente quando a inferência de tipo se torna complexa.

**Diagnóstico:**

```bash
# Identificar erros de sobrecarga ou tipo em chamadas de hooks
pnpm typecheck | grep "No overload matches this call"
```

**Correção Padrão (Padrão de Validação e Cast Seguro):**

A tentativa de forçar um tipo genérico no hook (`useQuery<ModelType[]>(...)`) pode causar mais problemas do que resolver. A abordagem correta é confiar na inferência de tipos do hook, receber os dados como `unknown` e, em seguida, validá-los e fazer o _cast_ de forma segura.

```typescript
// ❌ ANTES (Antipadrão: Forçar tipo genérico, pode causar conflito)
const { data: availableModels } = useQuery<ModelType[]>(
  trpc.app.aiStudio.findAvailableModels.queryOptions(),
);
// Isso pode levar ao erro "Nenhuma sobrecarga corresponde a esta chamada"

// ✅ DEPOIS (Padrão correto: Confiar na inferência e validar depois)

// 1. Deixe o `useQuery` inferir o tipo. O `data` será `unknown` ou parcialmente inferido.
const { data: availableModels } = useQuery(
  trpc.app.aiStudio.findAvailableModels.queryOptions(undefined, {
    staleTime: 5 * 60 * 1000,
  }),
);

// 2. Use `useMemo` para validar e fazer o cast dos dados de forma segura.
const safeAvailableModels = useMemo(() => {
  // Sempre verifique se o dado tem a estrutura esperada antes de fazer o cast.
  if (Array.isArray(availableModels)) {
    return availableModels as ModelType[]; // Faça o cast para o tipo desejado
  }
  return []; // Retorne um valor padrão seguro
}, [availableModels]);

// 3. Use o `safeAvailableModels` no restante do componente com tipagem garantida.
const processedModels = useMemo(() => {
  return safeAvailableModels
    .filter((model) => model.teamConfig?.enabled === true)
    .sort((a, b) => a.name.localeCompare(b.name));
}, [safeAvailableModels]);
```

---

## 💣 ESTRATÉGIA AVANÇADA: Reconstrução de Arquivos Complexos

**Problema:** Tentar editar arquivos muito grandes, com alta complexidade ou múltiplas dependências, pode levar à corrupção do arquivo ou a um ciclo interminável de novos erros.

**Solução: Abordagem de Reconstrução (Em vez de Edição)**

### **Quando Usar:**

- Arquivos com mais de 1000 linhas
- Múltiplas violações ESLint entrelaçadas
- Código legado com muitas dependências
- Ciclos de erro que se perpetuam
- **🆕 NOVO:** Mais de 15 erros de lint no mesmo arquivo

### **🆕 Sinais de Alerta para Reconstrução (Lição Aprendida):**

- **🚨 Limite de 3 tentativas atingido** sem resolução completa
- **🚨 Novos erros aparecem** a cada correção (efeito cascata)
- **🚨 Tipos fundamentais incompatíveis** entre dependências
- **🚨 Arquivo com mais de 600 linhas** (como `chat-window.tsx`)

### **Processo de Reconstrução:**

1. **Restaurar e Isolar:** Restaure o arquivo para um estado funcional a partir do Git. Identifique as responsabilidades lógicas dentro dele (ex: cada `procedure` em um router tRPC).

2. **Desmembrar em Unidades Menores:** Extraia cada responsabilidade para seu próprio arquivo (`.handler.ts`, `.service.ts`, etc.), seguindo os padrões de arquitetura existentes. O arquivo original se tornará um simples agregador que importa e delega a lógica.

3. **Validar Individualmente:** Corrija o lint e os tipos em cada novo arquivo de forma isolada. É muito mais fácil resolver 5 erros em um arquivo de 50 linhas do que em um de 1000.

4. **Reintegrar e Validar:** Com as unidades menores já corrigidas, integre-as de volta ao arquivo agregador. A validação final será muito mais simples.

### **🆕 Exemplo de Desmembramento (Baseado em Caso Real):**

```typescript
// ❌ ANTES: chat-window.tsx (600+ linhas, 25+ erros de lint)
export function ChatWindow({ sessionId }: ChatWindowProps) {
  // 200+ linhas de lógica do EmptyThreadState
  // 400+ linhas de lógica do ActiveChatWindow
}

// ✅ DEPOIS: chat-window.tsx (50 linhas, 0 erros)
import { EmptyThreadState } from "./empty-thread-state";
import { ActiveChatWindow } from "./active-chat-window";

export function ChatWindow({ sessionId }: ChatWindowProps) {
  if (!sessionId || sessionId === "new") {
    return <EmptyThreadState onNewSession={onNewSession} />;
  }

  return <ActiveChatWindow sessionId={sessionId} />;
}

// ✅ DEPOIS: empty-thread-state.tsx (150 linhas, 0 erros)
// ✅ DEPOIS: active-chat-window.tsx (300 linhas, correções focadas)
```

---

## 🚨 SINAIS DE ALERTA - PARE IMEDIATAMENTE

Durante a correção, se você encontrar qualquer um destes sinais, **PARE** e reavalie a estratégia:

- 🚨 **Novos erros TypeScript** aparecem em outros arquivos
- 🚨 **Testes começam a falhar** sem motivo aparente
- 🚨 **Funcionalidade quebra** durante a correção
- 🚨 **Ciclo de erros** se perpetua (corrigir um erro gera dois novos)
- 🚨 **Necessidade de adicionar** `@ts-nocheck` ou `@ts-ignore`
- 🚨 **Mudanças arquiteturais** se tornam necessárias
- 🚨 **🆕 NOVO:** **Limite de 3 tentativas** de correção no mesmo arquivo atingido
- 🚨 **🆕 NOVO:** **Mais de 15 erros** persistem após correções iniciais

### **Ações de Emergência:**

1. **Reverter** para o último estado funcional (`git stash pop` ou `git reset`)
2. **Reavaliar** se o problema requer abordagem de reconstrução
3. **Consultar** documentação arquitetural específica
4. **Considerar** dividir o trabalho em unidades menores
5. **🆕 NOVO:** **Documentar o progresso** e pausar para revisão manual

---

## 🪤 ARMADILHAS COMUNS - EVITE A TODO CUSTO

### **Armadilha #1: Focar apenas em erros de tipo e ignorar imports**

**❌ O QUE ACONTECE:**

- Você corrige todos os erros de `any` e type safety
- Esquece de verificar imports não utilizados
- O arquivo ainda tem 10+ erros de lint após "correção completa"

**✅ COMO EVITAR:**

1. SEMPRE execute diagnóstico completo (Fase 0.5) antes de qualquer correção
2. Use `pnpm lint --filter=@kdx/kdx` e não apenas `pnpm typecheck`
3. Verifique ESPECIFICAMENTE por `@typescript-eslint/no-unused-vars`

### **Armadilha #2: Não limpar após refatoração**

**❌ O QUE ACONTECE:**

- Você extrai lógica para hooks/componentes separados
- Esquece de remover imports e variáveis do arquivo original
- Variáveis como `editingFolder`, `deleteSessionMutation` ficam órfãs

**✅ COMO EVITAR:**

1. Após cada refatoração, revise TODOS os imports
2. Use a extensão "Remove Unused Imports" do VSCode
3. Execute `pnpm lint` após CADA mudança significativa

### **Armadilha #3: Confiar apenas em ferramentas automáticas**

**❌ O QUE ACONTECE:**

- `pnpm lint --fix` não corrige todos os problemas
- Você assume que está tudo correto sem verificar
- 17 erros permanecem no arquivo

**✅ COMO EVITAR:**

1. SEMPRE verifique manualmente após correções automáticas
2. Execute lint sem `--fix` para ver erros remanescentes
3. Revise visualmente o arquivo para imports óbvios não utilizados

### **Armadilha #4: Não testar incrementalmente**

**❌ O QUE ACONTECE:**

- Você faz 20 correções de uma vez
- Não sabe qual correção causou novos problemas
- Fica em loop de correções infinitas

**✅ COMO EVITAR:**

1. Corrija por categoria (primeiro imports, depois types, etc.)
2. Execute `pnpm lint` após CADA categoria
3. Commit incremental para poder reverter se necessário

### **NOVA ARMADILHA #5: Confiança Cega em Ferramentas de Edição**

**❌ O QUE ACONTECE:**

- Você assume que a ferramenta de edição (`edit_file`) aplicará a correção perfeitamente.
- A ferramenta falha em arquivos complexos, corrompendo o código ou reintroduzindo erros.
- Você entra em um ciclo de "correção -> erro -> nova correção".

**✅ COMO EVITAR:**

1. **Reconhecer o Limite:** Ferramentas automáticas podem falhar em arquivos grandes ou com padrões de código repetitivos.
2. **Estratégia de Substituição Completa:** Se a ferramenta falhar mais de uma vez no mesmo arquivo, abandone a edição incremental. Gere o conteúdo completo e corrigido do arquivo e peça ao usuário para substituí-lo manualmente.
3. **Verificação Após CADA Edição:** Nunca assuma que uma edição foi aplicada corretamente. Após CADA chamada da ferramenta, use `read_file` para verificar o conteúdo e garantir que a mudança está correta antes de prosseguir.
4. **Simplificação como Pré-requisito:** Se um arquivo é muito complexo para a ferramenta, considere refatorá-lo em unidades menores **antes** de tentar aplicar correções de lint.

---

## 📋 CHECKLIST DE EXECUÇÃO COMPLETO

### **Pré-Execução**

- [ ] Consultar `kodix-eslint-coding-rules.md` para regras específicas
- [ ] Identificar o escopo do problema (arquivo, pacote, ou projeto)
- [ ] Fazer backup do estado atual (`git stash` ou commit)
- [ ] Verificar se há testes existentes para o código
- [ ] **🆕 NOVO:** Executar `pnpm lint` para contar erros iniciais

### **Durante a Execução**

- [ ] **FASE 1:** Tipos centralizados criados e validados
- [ ] **FASE 2:** Violações ESLint corrigidas sistematicamente
- [ ] **FASE 3:** Testes de regressão implementados e passando
- [ ] **FASE 4:** Verificação final de conformidade completa
- [ ] **🆕 NOVO:** Monitorar progresso (se erros aumentam, pausar)

### **Pós-Execução**

- [ ] Executar `pnpm typecheck` → 0 erros
- [ ] Executar `pnpm lint` → 0 violações
- [ ] Executar testes relevantes → 100% passando
- [ ] Funcionalidade preservada → Validação manual
- [ ] Documentação atualizada → Se aplicável
- [ ] **🆕 NOVO:** Documentar lições aprendidas no plano

---

## ✅ MÉTRICAS DE SUCESSO

Uma tarefa de correção de lint só é considerada "concluída" quando:

- [ ] O comando `pnpm eslint <caminho-do-pacote>` passa com zero erros.
- [ ] O comando `pnpm typecheck --filter=@kdx/<package>` passa com zero erros.
- [ ] Todos os testes relevantes para o pacote modificado continuam passando.
- [ ] O código novo ou refatorado segue 100% das regras em `kodix-eslint-coding-rules.md`.
- [ ] Funcionalidade original preservada (validação manual).
- [ ] Documentação atualizada quando necessário.
- [ ] **🆕 NOVO:** Nenhum erro de `@typescript-eslint/no-unnecessary-condition`
- [ ] **🆕 NOVO:** Nenhum erro de `@typescript-eslint/no-floating-promises`
- [ ] **🆕 NOVO:** Compatibilidade de tipos verificada com AI SDK

---

## 📚 REFERÊNCIAS OBRIGATÓRIAS

**SEMPRE consultar antes de iniciar correções:**

1. **[Regras ESLint Kodix](./kodix-eslint-coding-rules.md)** - Regras obrigatórias e exemplos
2. **[Plano de Correção da Sidebar](../subapps/chat/planning/01-fix-sidebar-lint-errors.md)** - Caso de sucesso real
3. **🆕 [Plano de Correção do Active Chat Window](../subapps/chat/planning/06-fix-active-chat-window-lint-errors.md)** - Caso de aprendizado com limite de tentativas
4. **[Antipadrões Arquiteturais](../subapps/chat/planning/architectural-correction-antipatterns.md)** - O que NÃO fazer
5. **[Padrões tRPC](../architecture/trpc-patterns.md)** - Padrões corretos de API
6. **[Padrões Arquiteturais](../architecture/Architecture_Standards.md)** - Diretrizes gerais
7. **🆕 [Lições Aprendidas de Arquitetura](../architecture/lessons-learned.md)** - Lições críticas do projeto

---

## 🎯 TEMPLATE DE RELATÓRIO DE CORREÇÃO

```markdown
# Relatório de Correção de Lint - [Nome do Componente/Arquivo]

**Data:** [Data]
**Executor:** [Nome]
**Arquivo(s):** [Lista de arquivos modificados]

## 📊 Resumo Executivo

- **Violações encontradas:** [Número]
- **Violações corrigidas:** [Número]
- **Tempo de correção:** [Tempo]
- **Testes afetados:** [Número]
- **🆕 Tentativas necessárias:** [Número] / 3 máximo

## 🔧 Correções Implementadas

### Fase 1: Tipos Centralizados

- [ ] Arquivo de tipos criado: [Caminho]
- [ ] Tipos extraídos: [Lista]
- [ ] Validação: `pnpm typecheck` ✅

### Fase 2: Violações ESLint

- [ ] `@ts-nocheck` removido
- [ ] `any` substituído por tipos explícitos
- [ ] Imports organizados e não utilizados removidos
- [ ] 🆕 Condições desnecessárias corrigidas
- [ ] 🆕 Promises floating corrigidas
- [ ] 🆕 Chaves de tradução corrigidas
- [ ] Validação: `pnpm lint` ✅

### Fase 3: Testes de Regressão

- [ ] Testes criados/atualizados
- [ ] Smoke tests implementados
- [ ] 🆕 Testes de compatibilidade de tipos
- [ ] Validação: `pnpm test` ✅

### Fase 4: Verificação Final

- [ ] Conformidade ESLint: 100%
- [ ] Funcionalidade preservada: ✅
- [ ] Documentação atualizada: ✅

## 🎉 Resultado Final

- **Status:** ✅ CONCLUÍDO COM SUCESSO / ⚠️ PAUSADO PARA REVISÃO
- **Conformidade:** [X]% com regras ESLint Kodix
- [ ] Funcionalidade preservada
- [ ] Testes: [X/X] passando
- **🆕 Lições Aprendidas:** [Descrição das principais lições]

## 🔄 Próximos Passos (se aplicável)

- [ ] Refatoração arquitetural necessária
- [ ] Revisão manual de tipos fundamentais
- [ ] Desmembramento em componentes menores
```

---

**🎯 LEMBRE-SE:** Este playbook é baseado em casos reais de sucesso e falhas. Siga as fases metodicamente e não pule etapas. A correção sistemática é mais eficaz que correções ad-hoc. **Respeite o limite de 3 tentativas** - se atingido, pause para revisão manual ou considere refatoração arquitetural.
