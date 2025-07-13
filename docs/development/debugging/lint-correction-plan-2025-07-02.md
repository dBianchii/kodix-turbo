<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="high" -->category: development
complexity: intermediate
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: all
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# 🛠️ Plano de Correção de Erros de Lint - Kodix AI Studio

## 📋 Visão Geral

**Data:** 2025-07-02  
**Contexto:** Correção de erros de lint após implementação do Sistema de Instruções da Plataforma  
**Status:** 🟡 Em Execução

### Progresso Atual

- **Erros Iniciais:** 465
- **Erros Atuais:** 437
- **Corrigidos:** 28 (6%)

## 🎯 Objetivo Estratégico

Eliminar erros de lint no pacote API, com foco em:

- Correção de problemas de tipagem
- Remoção de atribuições `any`
- Padronização de métodos e schemas
- Manutenção da type safety

---

## 🟢 Foco Prioritário: Arquivos da Imagem

Corrigir **todos os erros** dos arquivos destacados na imagem, nesta ordem:

1. **`_router.ts` (ai-studio)** — 67 erros
2. **`_router.ts` (chat)** — 44 erros
3. **`autoCreateSessionWithMessage.handler.ts`** — 25 erros
4. **`ai-studio.service.test.ts`** — 36 erros
5. **`ai-studio.service.ts`** — 10 erros
6. **`createEmptySession.handler.ts`** — 7 erros

---

## 📋 Checklist de Execução

- [x] Corrigir todos os erros de lint em `_router.ts` (ai-studio)
- [x] Corrigir todos os erros de lint em `_router.ts` (chat)
- [~] Corrigir todos os erros de lint em `autoCreateSessionWithMessage.handler.ts` (Parcialmente corrigido, erros remanescentes devido a falhas da ferramenta de edição)
- [x] Corrigir todos os erros de lint em `ai-studio.service.test.ts`
- [ ] Corrigir todos os erros de lint em `ai-studio.service.ts`
- [ ] Corrigir todos os erros de lint em `createEmptySession.handler.ts`
- [ ] Rodar `pnpm lint:api` e atualizar o progresso

---

## 💣 Estratégia de Mitigação para Arquivos Complexos

**Problema Identificado:** Tentativas de editar arquivos grandes e com múltiplas dependências (ex: `packages/api/src/trpc/routers/app/ai-studio/_router.ts` e handlers complexos) têm resultado em corrupção do arquivo pela ferramenta de edição. A abordagem de aplicar patches incrementais se mostrou ineficaz e perigosa para a integridade do código nesses casos.

**Nova Estratégia de Execução:**

1.  **Abordagem de Reconstrução (Não Edição):** Para arquivos que demonstram ser problemáticos, a estratégia de "edição" será substituída pela de "reconstrução".

    - **Passo 1: Restaurar e Verificar.** A primeira ação será garantir que o arquivo esteja em um estado limpo e não corrompido, restaurando-o a partir do Git se necessário.
    - **Passo 2: Desmembrar em Handlers.** Em vez de editar o arquivo monolítico, a lógica de cada `procedure` será extraída para arquivos de `handler` dedicados (`nome-da-acao.handler.ts`), seguindo o padrão já existente no projeto.
    - **Passo 3: Reconstruir o Router.** O arquivo `_router.ts` original será esvaziado de lógica de implementação e se tornará um simples agregador que importa e delega para os `handlers`.
    - **Passo 4: Validar Individualmente.** Cada novo `handler` será validado com o linter de forma isolada _antes_ de ser integrado ao `_router.ts`.

2.  **Priorizar a Refatoração sobre a Correção Pontual:** O objetivo principal ao lidar com esses arquivos não é apenas "corrigir o erro de lint", mas sim "refatorar para diminuir a complexidade e produzir um código mais manutenível". Isso resolve o problema de forma definitiva, em vez de apenas contorná-lo.

---

## 💡 Lições Aprendidas

- **`Promise.allSettled` vs `Promise.all`**: O projeto possui uma regra de lint customizada (`no-restricted-syntax`) que **exige o uso de `Promise.allSettled`** em vez de `Promise.all`. O objetivo é prevenir falhas silenciosas em chamadas concorrentes. Qualquer tentativa de "simplificar" para `Promise.all` é um **anti-padrão** que introduzirá erros de build e deve ser evitada.

---

## ✅ Progresso de Correção

### Arquivos Corrigidos

#### 1. `ai-studio.service.test.ts`

- ✅ Convertido tipos `as never` para `as any` com tipagem adequada
- ✅ Simplificado acesso a métodos privados

#### 2. `autoCreateSessionWithMessage.handler.ts`

- ✅ Adicionado interfaces para tipos específicos
- ✅ Removido uso de `any` onde possível
- ✅ Corrigido operadores `||` para `??`
- ✅ Melhorado tratamento de erros

#### 3. `createEmptySession.handler.ts`

- ✅ Adicionado interfaces `ModelConfig` e `OpenAIResponse`
- ✅ Usado tipos inferidos com `Awaited<ReturnType<>>`
- ✅ Corrigido operadores `||` para `??`
- ✅ Tratamento de erros tipado

#### 4. `_router.ts`

- ✅ Removido schemas não utilizados
- ✅ Corrigido `Promise.all` para `Promise.allSettled`
- ✅ Removido async desnecessários

### Próximos Arquivos

1. `enviarMensagem.handler.ts` - 50+ erros
2. `generateSessionTitle.handler.ts` - 20+ erros
3. `getPreferredModel.handler.ts` - 15+ erros
4. Arquivos de teste com erros de escopo

## 🔧 Estratégia de Correção

### 1. Preparação do Ambiente

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Limpar caches
pnpm turbo clean
rm -rf node_modules/.cache

# Verificar estado inicial dos tipos
pnpm typecheck --filter=@kdx/api
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 2. Categorização de Erros

#### 2.1 Erros de Escopo de Métodos

- **Problema:** Métodos com acesso incorreto a `this`
- **Solução:** Conversão para arrow functions
- **Exemplo:**

  ```typescript
  // Antes
  function someMethod() { ... }

  // Depois
  const someMethod = () => { ... };
  ```

#### 2.2 Schemas Não Utilizados

- **Problema:** Schemas definidos mas não consumidos
- **Solução:** Remover ou definir uso explícito
- **Exemplo:**
  ```typescript
  // Consolidar em um objeto de schemas
  export const aiStudioSchemas = {
    createAIAgent: z.object({...}),
    createAILibrary: z.object({...}),
  };
  ```

#### 2.3 Atribuições `any`

- **Problema:** Uso de `any` que compromete type safety
- **Solução:** Definir tipos explícitos ou usar type guards
- **Exemplo:**

  ```typescript
  // Antes
  const unexpectedAny: any = someValue;

  // Depois
  const unexpectedAny: ExplicitType = someValue;
  ```

### 3. Validação de Schemas

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Padrão para definição e uso de schemas
export const aiStudioRouter = {
  createAgent: protectedProcedure
    .input(aiStudioSchemas.createAIAgent)
    .mutation(async ({ input }) => {
      // Validação automática pelo schema
    }),
};
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 4. Estratégia de Testes

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Verificação incremental de tipos
pnpm typecheck --filter=@kdx/shared
pnpm typecheck --filter=@kdx/validators
pnpm typecheck --filter=@kdx/api

# Lint específico
pnpm lint:api
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🧪 Métricas de Sucesso

- [ ] Zero erros de `any`
- [ ] Todos os schemas utilizados ou removidos
- [ ] Métodos com escopo correto
- [ ] `pnpm typecheck` passa sem erros
- [ ] Testes do Chat continuam passando (13/13)

## 🚨 Pontos Críticos de Atenção

- **Nomenclatura:** Manter endpoints em inglês
- **Imports:** Usar `import { useTRPC } from "~/trpc/react"`
- **Type Safety:** Evitar type assertions desnecessárias

## 📊 Registro de Mudanças

### Schemas Revisados

- [ ] `createAIAgentSchema`
- [ ] `createAILibrarySchema`
- [ ] `createTeamProviderSchema`

### Métodos Refatorados

- [ ] Conversão para arrow functions
- [ ] Correção de escopo de `this`

## 🔍 Próximos Passos

1. Implementar correções incrementalmente
2. Executar typecheck após cada mudança
3. Rodar testes unitários
4. Validar no navegador
5. Documentar mudanças em `lessons-learned.md`

## 💡 Reflexão Arquitetural

Esta correção não é apenas sobre resolver erros de lint, mas sobre elevar a qualidade arquitetural do código, seguindo os princípios de:

- Type safety rigorosa
- Pragmatismo na implementação
- Mínima complexidade
- Máxima clareza

---

**Última Atualização:** 2025-07-02  
**Próxima Revisão:** 2025-07-09

## 🏁 Meta

- **Zerar** os erros de lint nos arquivos da imagem antes de avançar para outros arquivos.
- Atualizar o progresso no plano a cada etapa concluída.
