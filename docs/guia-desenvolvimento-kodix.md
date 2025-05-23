# Guia de Desenvolvimento Kodix

Este documento serve como guia para desenvolvedores que desejam contribuir com o projeto Kodix, explicando os padrões de desenvolvimento, fluxos de trabalho e melhores práticas.

## Primeiros Passos

Antes de começar a desenvolver no projeto Kodix, certifique-se de ter lido a documentação principal em `@docs/documentacao-projeto-kodix.md` e que tenha configurado seu ambiente de desenvolvimento conforme descrito.

## Padrões de Código

### Convenções de Nomenclatura

- **Arquivos e diretórios**: Use kebab-case para arquivos de componentes e páginas (ex: `user-profile.tsx`)
- **Componentes React**: Use PascalCase (ex: `UserProfile`)
- **Funções e variáveis**: Use camelCase (ex: `getUserData`)
- **Constantes**: Use SNAKE_CASE_MAIÚSCULO (ex: `MAX_ATTEMPTS`)
- **Classes e Interfaces TypeScript**: Use PascalCase (ex: `UserInterface`)
- **Schemas de banco de dados**: Use camelCase para nomes de tabelas e colunas

### Estrutura de Arquivos

Mantenha uma estrutura de arquivos consistente dentro dos diretórios:

- **Componentes**:

  ```
  Component/
  ├── index.ts        # Exporta o componente
  ├── Component.tsx   # Implementação principal
  ├── Component.test.tsx # Testes
  └── utils.ts        # Funções auxiliares específicas do componente
  ```

- **Páginas** (para Next.js):
  ```
  app/(autenticado)/rota/
  ├── page.tsx        # Componente principal da página
  ├── layout.tsx      # Layout específico (se necessário)
  └── components/     # Componentes específicos da página
  ```

### Princípios de Codificação

1. **DRY (Don't Repeat Yourself)**: Evite duplicação de código. Extraia lógica compartilhada para funções/componentes reutilizáveis.
2. **KISS (Keep It Simple, Stupid)**: Prefira soluções simples a complexidades desnecessárias.
3. **SRP (Single Responsibility Principle)**: Cada função ou componente deve ter uma única responsabilidade.
4. **Arquivos pequenos**: Mantenha arquivos com menos de 300 linhas. Se crescerem mais, considere dividir.

## Fluxo de Desenvolvimento

### Criação de Novos Recursos

1. **Planejamento**:

   - Entenda completamente o requisito
   - Planeje a implementação, considerando modelos de dados e UI
   - Discuta abordagens com a equipe, se necessário

2. **Implementação do Backend**:

   - Defina novos modelos/tabelas em `packages/db/src/schema/`
   - Implemente funções de repositório em `packages/db/src/repositories/`
   - Crie endpoints tRPC em `packages/api/src/trpc/routers/`
   - Adicione validadores Zod em `packages/validators/`

3. **Implementação do Frontend**:

   - Crie componentes UI reutilizáveis em `packages/ui/`
   - Implemente as páginas necessárias na aplicação correspondente
   - Conecte com a API utilizando os hooks tRPC

4. **Testes**:
   - Escreva testes para novas funcionalidades
   - Verifique compatibilidade entre web e mobile, se aplicável
   - Teste em diferentes ambientes (desenvolvimento, produção)

### Fluxo de Ramificação (Git)

1. **Branches de feature**:

   - Nome: `feature/nome-descritivo`
   - Crie a partir da branch `main`
   - Implemente sua funcionalidade
   - Faça commits pequenos e descritivos

2. **Pull Requests**:

   - Faça um PR para `main` quando a feature estiver pronta
   - Preencha o template de PR com detalhes da implementação
   - Solicite revisão de pelo menos um outro desenvolvedor
   - Resolva comentários e conflitos, se houver

3. **Integrações**:
   - Após aprovação, faça merge do PR
   - Certifique-se que CI/CD passa com sucesso

## Expansão de Funcionalidades

### Adicionando Novos Modelos de Dados

1. **Defina o schema**:

   ```typescript
   // Em packages/db/src/schema/apps/seuRecurso.ts
   import { mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

   import { createId } from "../utils";

   export const seuRecurso = mysqlTable("seuRecurso", {
     id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
     nome: varchar("nome", { length: 255 }).notNull(),
     createdAt: timestamp("createdAt").defaultNow().notNull(),
     updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
   });
   ```

2. **Adicione ao index.ts para exportação**:

   ```typescript
   // Em packages/db/src/schema/apps/index.ts
   export * from "./seuRecurso";
   ```

3. **Crie repositórios para operações comuns**:

   ```typescript
   // Em packages/db/src/repositories/seuRecurso.ts
   import { db } from "../client";
   import { seuRecurso } from "../schema/apps/seuRecurso";

   export const SeuRecursoRepository = {
     create: async (data) => {
       return db.insert(seuRecurso).values(data).execute();
     },
     // Adicione outros métodos...
   };
   ```

4. **Aplique as alterações**:
   ```bash
   pnpm db:push
   ```

### Adicionando Novos Endpoints tRPC

1. **Crie um novo arquivo de roteador**:

   ```typescript
   // Em packages/api/src/trpc/routers/app/seuRecurso.ts
   import { z } from "zod";

   import { publicProcedure, router } from "../../trpc";

   export const seuRecursoRouter = router({
     getAll: publicProcedure.query(async ({ ctx }) => {
       // Implemente a lógica...
       return [];
     }),

     create: publicProcedure
       .input(
         z.object({
           nome: z.string(),
         }),
       )
       .mutation(async ({ ctx, input }) => {
         // Implemente a lógica...
         return { success: true };
       }),
   });
   ```

2. **Adicione o roteador ao roteador de app**:

   ```typescript
   // Em packages/api/src/trpc/routers/app/index.ts
   import { router } from "../../trpc";
   import { seuRecursoRouter } from "./seuRecurso";

   export const appRouter = router({
     // Outros roteadores...
     seuRecurso: seuRecursoRouter,
   });
   ```

3. **Use no frontend**:
   ```typescript
   // Em um componente React
   const { data, isLoading } = api.app.seuRecurso.getAll.useQuery();
   const { mutate } = api.app.seuRecurso.create.useMutation();
   ```

### Adicionando Novos Componentes UI

1. **Crie o componente**:

   ```typescript
   // Em packages/ui/src/components/seu-componente.tsx
   import * as React from "react";

   interface SeuComponenteProps {
     texto: string;
     onClick?: () => void;
   }

   export function SeuComponente({ texto, onClick }: SeuComponenteProps) {
     return (
       <div className="p-4 bg-white rounded shadow" onClick={onClick}>
         {texto}
       </div>
     );
   }
   ```

2. **Exporte o componente**:

   ```typescript
   // Em packages/ui/src/index.tsx
   export * from "./components/seu-componente";
   ```

3. **Use em uma aplicação**:

   ```typescript
   // Em um componente da aplicação
   import { SeuComponente } from "@kdx/ui";

   export function MinhaPage() {
     return (
       <div>
         <SeuComponente texto="Olá mundo!" onClick={() => alert("Clicado!")} />
       </div>
     );
   }
   ```

## Dicas e Melhores Práticas

### Performance

1. **Memoização**: Use `useMemo` e `useCallback` para componentes que renderizam frequentemente
2. **Carregamento lazy**: Importe componentes grandes com `dynamic` do Next.js
3. **Otimização de imagens**: Use componentes `Image` do Next.js ou `Image` do Expo
4. **Cache**: Utilize as configurações de staleTime e cacheTime do TanStack Query

### Segurança

1. **Validação de entrada**: Sempre valide dados de entrada com Zod
2. **Middlewares de autenticação**: Use os middlewares de proteção para rotas que exigem autenticação
3. **Sanitização de dados**: Evite SQL injection usando parâmetros em vez de concatenação de strings
4. **Permissões granulares**: Implemente verificações de permissão nas operações sensíveis

### Tratamento de Erros

1. **Erros tRPC**: Use o padrão de erros do tRPC para passar erros do servidor para o cliente

   ```typescript
   throw new TRPCError({
     code: "NOT_FOUND",
     message: "Recurso não encontrado",
   });
   ```

2. **Try/Catch**: Sempre encapsule operações assíncronas em blocos try/catch

   ```typescript
   try {
     await db.insert(tabela).values(dados);
   } catch (error) {
     console.error("Erro ao inserir dados:", error);
     throw new TRPCError({
       code: "INTERNAL_SERVER_ERROR",
       message: "Erro ao processar sua solicitação",
     });
   }
   ```

3. **Feedback ao usuário**: Forneça mensagens de erro claras e orientadas à solução

### UI/UX

1. **Estados de carregamento**: Sempre mostre estados de carregamento durante operações assíncronas
2. **Feedback de sucesso/erro**: Notifique o usuário sobre o resultado das ações
3. **Acessibilidade**: Siga as diretrizes WCAG para acessibilidade
4. **Responsividade**: Desenvolva interfaces que funcionem bem em diversos tamanhos de tela

## Solução de Problemas Comuns

### Problemas de Banco de Dados

**Problema**: Erro "Column doesn't exist" após atualizar o schema
**Solução**: Certifique-se de executar `pnpm db:push` para aplicar as alterações

### Problemas de TypeScript

**Problema**: Erro "Property does not exist on type"
**Solução**: Verifique definições de tipos e execute `pnpm typecheck` para ver todos os erros

### Problemas de tRPC

**Problema**: Erro "Procedure not found"
**Solução**: Certifique-se de que o procedimento foi adicionado ao roteador e exportado corretamente

### Problemas de Monorepo

**Problema**: Mudanças não são refletidas entre pacotes
**Solução**: Certifique-se de executar turbo com a flag `dev` ativa ou reinstale dependências

## Recursos para Aprendizado

- [Documentação do tRPC](https://trpc.io/docs)
- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do Drizzle](https://orm.drizzle.team/docs/overview)
- [Documentação do TanStack Query](https://tanstack.com/query/latest/docs/react/overview)
- [Documentação do Tailwind CSS](https://tailwindcss.com/docs)
- [Documentação do Expo](https://docs.expo.dev)
