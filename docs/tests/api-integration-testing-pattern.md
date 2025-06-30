# 🧪 Padrão de Teste de Integração de API (Backend)

## 📖 Visão Geral

Este documento define o padrão para criar testes de integração para os endpoints da API tRPC. O objetivo é validar a lógica completa de um procedure (handler, chamadas de serviço, etc.) de ponta a ponta, sem a necessidade de um servidor HTTP rodando ou de um cliente externo.

Este padrão é ideal para cenários onde você precisa garantir que a lógica do backend funciona como esperado antes de ser consumida pelo frontend.

## 🎯 Ferramenta Principal: `appRouter.createCaller`

A chave para este padrão é o `createCaller` do tRPC. Ele nos permite invocar os procedures da API diretamente no nosso ambiente de teste Node.js (Vitest), simulando um cliente autenticado.

### Vantagens

- **Rápido:** Não há overhead de rede (HTTP).
- **Isolado:** Não depende de um servidor rodando.
- **Type-Safe:** Mantém toda a segurança de tipos do tRPC.
- **Integrado:** Roda com o mesmo comando `pnpm test` dos testes unitários.
- **Abrangente:** Testa toda a pilha do backend, desde o router até a camada de repositório (que pode ser mockada).

## 🏗️ Estrutura de Arquivos

```
packages/api/src/
├── __tests__/
│   └── trpc/
│       ├── {router-name}.test.ts             # Testes unitários do router
│       └── {router-name}.integration.test.ts # 🧪 Testes de integração (este padrão)
```

## ✅ Exemplo de Implementação: Validando o `getSystemPromptForChat`

Vamos usar o caso real do `getSystemPromptForChat` que implementamos no AI Studio. Queremos validar se o endpoint retorna o prompt correto, com as variáveis do usuário substituídas.

### `packages/api/src/__tests__/trpc/ai-studio.integration.test.ts`

```typescript
import { beforeAll, describe, expect, it, vi } from "vitest";

import { db } from "@kdx/db/client";

import { appRouter } from "../../../trpc/root";
import { createInnerTRPCContext } from "../../../trpc/trpc";

// Mock do banco de dados para controlar os dados do usuário
vi.mock("@kdx/db/client", () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
  },
}));

describe("AI Studio tRPC Integration Test", () => {
  // Mock do usuário que será usado no contexto de autenticação
  const mockUser = {
    id: "user_test_123",
    name: "Usuário de Teste",
    email: "test@kodix.com.br",
    activeTeamId: "team_test_456",
    ActiveTeam: {
      id: "team_test_456",
      name: "Equipe de Teste",
    },
  };

  // Criar um "caller" autenticado antes de todos os testes
  const ctx = createInnerTRPCContext({
    auth: {
      user: mockUser,
      session: null, // Não necessário para este teste
    },
    headers: new Headers(),
  });

  const caller = appRouter.createCaller(ctx);

  beforeAll(() => {
    // Garantir que a chamada ao banco retorne nosso usuário mockado
    vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser);
  });

  describe("getSystemPromptForChat Query", () => {
    it("should return the processed prompt with user variables substituted", async () => {
      // Act: Chamar o endpoint da API através do caller
      const result = await caller.app.aiStudio.getSystemPromptForChat({
        requestingApp: "chat",
      });

      // Assert: Verificar se o resultado está correto
      expect(result.hasContent).toBe(true);
      expect(result.prompt).toContain("Usuário de Teste");
      expect(result.prompt).toContain("Equipe de Teste");
      expect(result.prompt).not.toContain("{{userName}}"); // Garantir que a variável foi substituída
    });

    it("should handle cases where the user is not found in the db", async () => {
      // Arrange: Simular que o banco não encontrou o usuário
      vi.mocked(db.query.users.findFirst).mockResolvedValue(null);

      // Act
      const result = await caller.app.aiStudio.getSystemPromptForChat({
        requestingApp: "chat",
      });

      // Assert: O serviço deve retornar o template sem substituição
      expect(result.prompt).toContain("{{userName}}");
    });
  });
});
```

### Principais Pontos da Implementação

1.  **`createInnerTRPCContext`**: Criamos um contexto de tRPC falso, fornecendo um objeto de `auth` para simular um usuário logado.
2.  **`appRouter.createCaller`**: Usamos o router principal da nossa aplicação para criar um "caller", que é um cliente tRPC para o backend.
3.  **Mock do DB**: Mockamos a chamada `db.query.users.findFirst` para controlar os dados que o `PlatformService` receberá, isolando o teste do banco de dados real.
4.  **Invocação Direta**: Chamamos o endpoint como uma função assíncrona: `await caller.app.aiStudio.getSystemPromptForChat.query(...)`.
5.  **Assertiva**: Verificamos a saída para garantir que a lógica de negócio foi executada corretamente.

---

## 🚀 Como Aplicar este Padrão

1.  Crie um novo arquivo de teste com o sufixo `.integration.test.ts` no diretório `__tests__/trpc/` do pacote da API.
2.  Importe `createInnerTRPCContext` e `appRouter`.
3.  Crie um contexto mockado com as informações de autenticação necessárias para o seu teste.
4.  Crie um `caller` usando `appRouter.createCaller(ctx)`.
5.  Mocque as dependências externas, como chamadas de banco de dados, para tornar o teste determinístico.
6.  Chame os procedures do seu router através do `caller` e valide os resultados.
