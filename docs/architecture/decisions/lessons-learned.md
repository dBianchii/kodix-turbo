<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="true" summary-threshold="low" -->category: architecture
complexity: intermediate
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: fullstack
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# 📖 Lições Aprendidas de Arquitetura - Kodix

**Data de Criação:** 2025-07-01  
**Status:** Documento vivo. Adicione novas lições após cada incidente ou descoberta relevante.

## 🎯 Objetivo

Este documento centraliza as **lições críticas aprendidas** durante o desenvolvimento do projeto Kodix. Seu propósito é servir como um guia prático para prevenir a repetição de erros, melhorar a qualidade do código e garantir a estabilidade da arquitetura em todo o monorepo.

A leitura deste documento é **obrigatória** para todos os desenvolvedores.

---

## 📚 Lições Críticas de Arquitetura e Implementação

### 1. ⚠️ NUNCA Acoplar Lógica de Negócio Pura com `tRPC`

- **Lição**: A lógica de negócio principal (o "core") deve ser agnóstica à camada de transporte. Acoplar o `core-engine` com `initTRPC` ou `TRPCError` foi um erro arquitetural grave.
- **O Problema**: Ao importar `TRPCError` dentro dos serviços, criamos um acoplamento direto com a implementação da API. Isso torna impossível reutilizar essa lógica em outros contextos (ex: CLIs, crons) sem arrastar o tRPC junto.
- **✅ Solução**:
  1. **Erros de Domínio**: O `core-engine` (ou `core-service`) deve lançar seus próprios erros de domínio (`EntityNotFoundError`, `ValidationError`).
  2. **Mapeamento na Camada de API**: O router tRPC é responsável por capturar esses erros de domínio e **mapeá-los** para os erros tRPC apropriados (`TRPCError` com códigos como `NOT_FOUND` ou `BAD_REQUEST`).
- **Benefício**: Desacoplamento total. A lógica de negócio pode ser testada e executada de forma isolada.

### 2. Simplificar: Interfaces Claras e DTOs São Contratos

- **Lição**: A complexidade dos tipos e a falta de interfaces bem definidas (DTOs - Data Transfer Objects) entre a API e a lógica de negócio levaram a um "inferno de tipos" e dificultaram a manutenção.
- **O Problema**: Tipos genéricos complexos e a exposição de tipos do ORM (Drizzle) diretamente para as camadas superiores tornaram o código frágil e difícil de entender.
- **✅ Solução**:
  1. **Interfaces Explícitas**: Definir interfaces (`type` ou `interface`) para todas as entradas e saídas dos métodos de serviço. Ex: `CreateUserInput`, `UserOutput`.
  2. **Agnosticismo de ORM**: Os serviços não devem expor tipos do Drizzle. O mapeamento de/para os tipos do ORM é responsabilidade da camada de repositório.
- **Benefício**: Contratos claros entre as camadas, tornando o sistema mais robusto a mudanças internas.

### 3. Pragmatismo > Pureza: Módulo Interno vs. Novo Pacote

- **Lição**: Nem toda separação lógica justifica a criação de um novo pacote no monorepo. O isolamento pode ser alcançado de forma mais simples e pragmática.
- **O Problema**: A proposta inicial de criar um pacote `@kdx/core-engine` separado adicionava complexidade desnecessária (novo `package.json`, build, etc.) para um serviço que é consumido exclusivamente pelo pacote `@kdx/api`.
- **✅ Solução**: Manter a lógica "core" como um módulo interno em `packages/api/src/core-service`. O isolamento da camada de transporte (tRPC) é garantido por uma regra de ESLint estrita que proíbe `imports` indesejados.
- **Benefício**: Simplicidade e coesão, atingindo o objetivo de desacoplamento com o mínimo de sobrecarga.

### 4. Efeitos Colaterais da Otimização de Performance

- **Lição**: Otimizações de performance profundas (como correção de N+1, adição de índices de banco de dados ou otimização de connection pooling) podem introduzir problemas sutis em outras camadas, especialmente quebrando a segurança de tipos (`type safety`).
- **O Problema**: A refatoração de queries para usar `JOIN`s explícitos alterou a forma dos objetos retornados, o que causou uma cascata de erros de tipo que não foram imediatamente aparentes.
- **✅ Solução**: Após qualquer refatoração significativa de performance, é **obrigatório** executar uma verificação completa de ponta a ponta, incluindo `pnpm typecheck` e testes de regressão, para garantir que nenhum contrato de tipo foi quebrado silenciosamente.

### 5. Segurança de Tipos em Middlewares tRPC

- **Lição**: Middlewares que alteram o contexto do tRPC (como o `protectedProcedure` que garante a existência de `ctx.auth.user`) devem ser projetados com cuidado para que o TypeScript entenda a mudança de tipo.
- **O Problema**: Fazer um simples `type assertion` (`ctx as TProtectedContext`) é perigoso e pode esconder bugs.
- **✅ Solução**: O padrão correto é retornar um **novo objeto de contexto** dentro do middleware, garantindo ao TypeScript que, a partir daquele ponto, os tipos são seguros e não-nulos.

  ```typescript
  // ✅ Padrão Seguro
  return next({
    ctx: {
      ...ctx,
      auth: {
        user: ctx.auth.user!,
        session: ctx.auth.session!,
      },
    },
  });
  ```

- **Benefício**: Garante que o restante da cadeia de chamadas opere com os tipos corretos, prevenindo erros de `null` ou `undefined` em tempo de execução.

### 6. ⛓️ Validação de Tipos em Pacotes Compartilhados é a Base da Estabilidade

- **Lição**: Erros de tipo aparentemente complexos em pacotes consumidores (como `apps/kdx`) são quase sempre um sintoma de um problema mais profundo nos pacotes base (`@kdx/shared`, `@kdx/validators`).
- **O Problema**: Durante a refatoração da UI de configurações do AI Studio, o `useQuery` para `app.getConfig` falhou com um erro de tipo. A causa raiz não era o componente, mas sim uma definição de tipo (`AppIdsWithConfig`) incompleta no pacote `@kdx/validators`, que não incluía o `aiStudioAppId`.
- **✅ Solução**:
  1.  **Diagnóstico Top-Down, Correção Bottom-Up**: Ao encontrar um erro de tipo, comece a investigação no componente, mas espere que a correção seja necessária na base da cadeia de dependências.
  2.  **Ordem de Correção**: Sempre corrija e valide os tipos nos pacotes base primeiro (`@kdx/shared` -> `@kdx/validators` -> `@kdx/db` -> `@kdx/api`) antes de tentar consertar o código que os consome.
- **Benefício**: Evita "consertar" o código do frontend com `type assertions` (`as any`) ou workarounds, resolvendo o problema na fonte e garantindo a integridade do sistema de tipos em todo o monorepo.

### 7. 💣 Refatoração Incremental vs. "Big Bang": A Síndrome do Caminho Tortuoso

- **Lição**: Tentar refatorar múltiplos pacotes ou corrigir muitos "pequenos problemas" de uma só vez (`Big Bang Refactoring`) é extremamente arriscado em um monorepo e quase sempre leva a um estado de build quebrado e difícil de reverter.
- **O Problema**: Uma tentativa de padronizar importações em `@kdx/db` gerou erros em cascata em `@kdx/api` e `apps/kdx`. A tentativa de corrigir todos os erros de tipo e build simultaneamente resultou em um ambiente instável e na perda de rastreabilidade.
- **✅ Solução**: Adotar uma abordagem estritamente incremental para qualquer refatoração que cruze os limites dos pacotes.
  1.  **Plano de Ação Detalhado**: Sempre documente o que será alterado, em que ordem e qual é o critério de sucesso para cada etapa.
  2.  **Um Pacote de Cada Vez**: Faça a alteração no pacote base, valide-o (`build`, `lint`, `test`) até que ele esteja 100% funcional de forma isolada.
  3.  **Commits Atômicos**: Faça um commit após validar cada pacote. Isso cria pontos de restauração seguros.
  4.  **Rollback Rápido**: Se uma alteração em um pacote dependente causar uma cascata de erros inesperados, reverta para o último commit estável e reavalie o plano. Não tente "consertar para frente".
- **Benefício**: Mantém o monorepo em um estado funcional durante todo o processo de refatoração, reduz drasticamente o risco de regressão e torna o processo de depuração mais simples.

### 8. fluxo de Frontend vs. "Magia" do Backend

- **Lição**: Tentar criar endpoints de backend "inteligentes" que executam múltiplas ações (ex: `autoCreateSessionWithMessage` que cria a sessão E a primeira mensagem) pode quebrar a previsibilidade do frontend e criar bugs complexos, como mensagens duplicadas ou falta de resposta da IA.
- **O Problema**: O endpoint `autoCreateSessionWithMessage` criava a mensagem do usuário no banco de dados, mas não iniciava o streaming da IA, deixando essa responsabilidade para o frontend. No entanto, o frontend também tentava processar a mensagem (que ele guardava no `sessionStorage`), levando a duplicações. Tentar "consertar" isso no frontend com `useEffect`s complexos para detectar "sessões novas" se provou frágil e ineficaz.
- **✅ Solução**: Retornar ao padrão "burro" e previsível. O backend deve ter endpoints com responsabilidade única.
  1.  **`createEmptySession`**: O backend expõe um endpoint que **apenas** cria a sessão vazia. Ele não sabe sobre mensagens.
  2.  **Frontend Orquestra**: O frontend salva a primeira mensagem do usuário no `sessionStorage`, chama o `createEmptySession`, e após ser redirecionado para a nova sessão, lê a mensagem do `sessionStorage` e a envia para o `useChat` via `append()`.
- **Benefício**: Este padrão é mais robusto porque o fluxo é explícito e controlado inteiramente pelo frontend. Não há "mágica" no backend. O `useChat` se torna a única fonte de verdade para iniciar o streaming, eliminando a causa raiz da duplicação e da falta de resposta.

---

Este documento deve ser o primeiro lugar a ser consultado ao encontrar um bug inesperado e o último a ser atualizado após a resolução, garantindo que o conhecimento da equipe evolua constantemente.
