<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="true" summary-threshold="low" -->category: architecture

complexity: intermediate
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: backend
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# Protocolo de Contratos e Fronteiras de Dados (Data Contracts & Boundaries Protocol)

**Data:** 05/07/2025
**Autor:** Gemini
**Status:** 🏛️ **CONSTITUCIONAL - Padrão Arquitetural Obrigatório**

## 1. O Mandato

Este documento estabelece o **protocolo constitucional e inquebrável** para o manuseio de dados entre a camada de API/banco de dados e a camada de componentes (UI) no ecossistema Kodix.

Sua criação é uma resposta direta a problemas recorrentes de `type-safety` que culminaram em erros de lint, complexidade acidental e instabilidade em componentes como `model-info-badge.tsx`. O princípio fundamental aqui estabelecido é **não negociável**.

## 2. A Causa Raiz: A Fronteira Insegura

A análise de múltiplos incidentes revelou uma causa raiz comum: a ausência de uma fronteira de validação de tipos para dados provenientes do banco de dados, especialmente de colunas `JSON`.

**O Problema:** O Drizzle, por design, infere colunas `t.json()` como tipo `unknown`. Este tipo "inseguro", quando não tratado na "borda" da aplicação, propaga-se como um veneno pela árvore de componentes, resultando em:

- Uso de `any` para contornar o problema.
- Erros de `lint` sobre `unsafe assignment/return`.
- Verificações condicionais desnecessárias (`?.`).
- Componentes frágeis e difíceis de manter.

```mermaid
graph TD
    subgraph "Data Layer (Backend)"
        A[DB Schema: `metadata: t.json()`] --> B{tRPC Router Output}
    end
    subgraph "UI Layer (Frontend)"
        B --> C[Hook `useQuery`]
        C -->|🚨 TIPO 'UNKNOWN' VAZA| D(Componente Pai)
        D -->|props: { metadata: unknown }| E(Componente Filho)
    end
    style E fill:#f44336,stroke:#333,color:white
```

## 3. O Princípio Constitucional: A Barreira de Tipos

Fica estabelecido o princípio da **"Barreira de Tipos"** (Type Boundary).

> **NENHUM dado de tipo `unknown` ou `any` que se origina da camada de dados deve cruzar a fronteira para a camada de componentes da UI. É responsabilidade da camada que busca os dados (hooks, services) servir como uma barreira, validando e transformando dados inseguros em contratos de dados (DTOs) seguros e explícitos.**

```mermaid
graph TD
    subgraph "Data Layer (Backend)"
        A[DB Schema: `metadata: t.json()`] --> B{tRPC Router Output}
    end
    subgraph "UI Layer (Frontend)"
        B --> C[Hook `useQuery`]
        C --> |dados: unknown| D(🛡️ **BARREIRA DE TIPOS** 🛡️<br/>Validação e Transformação<br/>Ex: useMemo, Zod.parse)
        D --> |props: { metadata: LastMessageMetadata }| E(Componente Filho)
    end
    style D fill:#4caf50,stroke:#333,color:white
    style E fill:#a5d6a7,stroke:#333,color:black
```

## 4. Padrão de Implementação Obrigatório

Qualquer desenvolvedor que consumir dados de um campo `JSON` ou de outra fonte de tipo `unknown` **DEVE** seguir este padrão de 3 passos.

### Passo 1: Definição do Contrato de Dados (DTO)

No arquivo apropriado (ex: `trpc/shared.ts` ou um arquivo de tipos local), defina a `interface` ou `type` explícito para a estrutura de dados esperada. Este é o seu **Contrato**.

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->

```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Exemplo: `trpc/shared.ts`

// Este é o DTO (Data Transfer Object)
export interface LastMessageMetadata {
  actualModelUsed?: string;
  requestedModel?: string;
  providerId?: string;
  timestamp: string; // Garantir que sempre haverá um timestamp
}
```

<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Passo 2: Construção da Barreira de Validação

No componente ou hook que busca os dados, crie a "barreira". Use `useMemo` para performance. Valide o objeto `unknown` e transforme-o no seu DTO.

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->

```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Exemplo: `unified-chat-page.tsx`

// Type Guard para validação
function isMetadataObject(o: unknown): o is Record<string, unknown> {
  return typeof o === "object" && o !== null;
}

const lastMessageMetadata = useMemo((): LastMessageMetadata | undefined => {
  const metadata = lastMessage?.metadata; // Este é `unknown`
  const timestamp = lastMessage?.createdAt.toISOString();

  if (!isMetadataObject(metadata) || !timestamp) {
    return undefined; // Dado inválido, retorna undefined
  }

  // Validação e transformação para o DTO
  return {
    actualModelUsed:
      typeof metadata.actualModelUsed === "string"
        ? metadata.actualModelUsed
        : undefined,
    requestedModel:
      typeof metadata.requestedModel === "string"
        ? metadata.requestedModel
        : undefined,
    providerId:
      typeof metadata.providerId === "string" ? metadata.providerId : undefined,
    timestamp: timestamp,
  };
}, [lastMessage]);
```

<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Passo 3: Consumo Seguro no Componente Filho

O componente filho agora declara em suas `props` que espera receber o DTO seguro. Ele pode operar com a garantia de que os tipos estão corretos.

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->

```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Exemplo: `model-info-badge.tsx`

interface ModelInfoBadgeProps {
  sessionData: ModelInfoBadgeSessionDataType;
  // ✅ O componente agora exige um contrato, não um tipo inseguro
  lastMessageMetadata: LastMessageMetadata | undefined;
}

export function ModelInfoBadge({
  sessionData,
  lastMessageMetadata,
}: ModelInfoBadgeProps) {
  // ... lógica do componente ...

  // ✅ Acesso seguro, sem `?.` ou validações redundantes
  const lastChecked = new Date(
    lastMessageMetadata.timestamp,
  ).toLocaleTimeString();

  // ...
}
```

<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 5. O que Fica PROIBIDO (Antipadrões)

1. **Passar `unknown` ou `any` como Props:** É proibido passar um dado de tipo `unknown` diretamente para um componente filho. A validação **DEVE** ocorrer no pai.
2. **`as any` no Filho:** É proibido usar `as any` ou `as unknown as MyType` no componente filho para "consertar" o problema. Isso apenas esconde a falha arquitetural.
3. **Ignorar a Barreira:** Adicionar `// @ts-nocheck` ou ignorar erros de tipo relacionados a isso é uma violação direta deste protocolo.

## 6. Fiscalização e Conformidade

- **Code Review:** A verificação deste protocolo é um item **obrigatório** em qualquer code review. Pull Requests que violarem esta regra serão rejeitados.
- **ESLint:** As regras existentes como `@typescript-eslint/no-explicit-any` ajudam a detectar violações.
- **Futuro:** Poderá ser criada uma regra de ESLint customizada para detectar o uso de `t.json()` em schemas e alertar sobre a necessidade de uma barreira de validação no frontend.

## 7. Referências Cruzadas

Este protocolo complementa e reforça os seguintes documentos:

- `@docs/architecture/standards/architecture-standards.md`
- `@docs/architecture/backend/../../../architecture/backend/backend-guide.md`
- `@docs/architecture/lessons-learned.md`
- `@docs/eslint/kodix-eslint-coding-rules.md`
