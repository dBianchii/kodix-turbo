# ADR 001: Refatoração do Padrão de Routers tRPC

## Metadados

- **Status**: Proposto
- **Data**: 2025-07-02
- **Autores**: @User, @KodixAgent
- **Última Atualização**: 2025-07-02

## 1. Contexto

Durante o desenvolvimento e manutenção dos SubApps, identificamos dois padrões distintos para a criação de routers tRPC:

1. **Padrão A** (`satisfies TRPCRouterRecord`):

   - Utilizado em módulos mais antigos como o KodixCare
   - O router é um objeto TypeScript simples que satisfaz um tipo

2. **Padrão B** (`t.router` e `t.mergeRouters`):
   - Utilizado nos SubApps mais recentes como Chat e AI Studio
   - Documentado como a melhor prática atual

O objetivo deste documento é formalizar a decisão de adotar o Padrão B como o padrão único para todo o projeto e explicar tecnicamente o porquê desta necessidade.

## 2. Problema (A Causa Raiz)

O Padrão A, embora funcional, introduz um problema arquitetural crítico: ele quebra a cadeia de inferência de tipos end-to-end do tRPC.

Quando definimos um router como um simples objeto (`export const kodixCareRouter = { ... } satisfies TRPCRouterRecord`), o TypeScript o enxerga como um objeto genérico. O tRPC perde a capacidade de "inspecionar" sua estrutura de forma precisa.

### Impacto Real Observado:

#### O "Inferno de Tipos" no Chat

- Antes da refatoração, o SubApp de Chat acumulou 585 erros de TypeScript relacionados a tipos `any` e `unknown` vindos do tRPC
- Desenvolvedores foram forçados a usar `// @ts-nocheck` e `as any` para fazer o código funcionar, anulando o principal benefício do tRPC

#### Consequências Principais

- **Perda de Autocomplete e Segurança**: A falta de tipos precisos no cliente (frontend) elimina o autocomplete para queries e mutations
- **Desenvolvimento mais lento e propenso a erros** em tempo de execução
- **Dificuldade de Manutenção**: Refatorar um endpoint no backend não gerava erros de compilação no frontend, fazendo com que bugs só fossem descobertos em runtime

## 3. Proposta de Solução (O Padrão Correto)

A solução, já validada com sucesso no Chat e AI Studio, é adotar exclusivamente o Padrão B, utilizando os construtores fornecidos pelo tRPC.

### Antes (Padrão A - KodixCare)

```typescript
// packages/api/src/trpc/routers/app/kodixCare/_router.ts
import type { TRPCRouterRecord } from "@trpc/server";

// ... outros imports

// O router é um objeto genérico. A inferência de tipo é perdida.
export const kodixCareRouter = {
  careTask: careTaskRouter,
  checkEmailForRegister: publicProcedure.query(handler),
  // ... outros endpoints
} satisfies TRPCRouterRecord;
```

### Depois (Padrão B - Proposta para Todo o Projeto)

```typescript
// packages/api/src/trpc/routers/app/aiStudio/_router.ts
import { t } from "../../../trpc";
import { aiAgentsRouter } from "./agents";
import { aiModelsRouter } from "./models";

// ... outros imports

// O router é criado com o construtor do tRPC, preservando os tipos.
const aiStudioRootRouter = t.router({
  getSystemPrompt: protectedProcedure.query(handler),
  // ... outros endpoints
});

// Os routers são combinados com um método que também preserva os tipos.
export const aiStudioRouter = t.mergeRouters(
  aiStudioRootRouter,
  aiAgentsRouter,
  aiModelsRouter,
);
```

## 4. Justificativa e Benefícios

A adoção do Padrão B como padrão único para todo o projeto nos traz de volta os superpoderes do tRPC:

1. **Type Safety de Ponta a Ponta**:

   - Garante que qualquer mudança no backend que afete a API seja imediatamente detectada pelo compilador TypeScript no frontend

2. **Eliminação de Débito Técnico**:

   - A refatoração no SubApp de Chat eliminou 100% dos 585 erros de tipo
   - Removeu a necessidade de `// @ts-nocheck`

3. **Melhora na Developer Experience (DX)**:

   - Autocomplete robusto
   - Segurança em refatorações
   - Clareza sobre os schemas de entrada e saída das APIs

4. **Alinhamento com a Documentação Oficial do tRPC**:
   - Este é o padrão recomendado pela equipe do tRPC para construir aplicações escaláveis

## 5. Próximos Passos

1. **Aplicação Imediata**:

   - Todo novo router criado no monorepo deve usar o Padrão B (`t.router` / `t.mergeRouters`)

2. **Refatoração Oportunista**:
   - Módulos que ainda utilizam o Padrão A (como KodixCare) devem ser gradualmente refatorados quando houver oportunidade de trabalho neles
   - Não é necessária uma força-tarefa de refatoração imediata, mas sim uma correção contínua do débito técnico

## Conclusão

Este alinhamento garante que o projeto continue escalável, seguro e fácil de manter a longo prazo.
