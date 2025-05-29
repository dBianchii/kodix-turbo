# Guia de Desenvolvimento - Projeto Kodix

## Visão Geral

Este documento serve como guia completo para desenvolvedores que trabalham no projeto Kodix, um sistema de gestão de saúde modular construído com tecnologias modernas.

## Stack Tecnológico

### Frontend

- **React 19** - Biblioteca para construção de interfaces
- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework de CSS utilitário
- **Shadcn/ui** - Sistema de componentes
- **Tamagui** - Interface para React Native
- **React Hook Form** - Gerenciamento de formulários
- **Framer Motion** - Animações
- **next-intl** - Internacionalização

### Backend

- **tRPC v11** - APIs type-safe
- **oslo** - Sistema de autenticação (anteriormente lucia-auth)
- **Drizzle ORM** - ORM para banco de dados
- **MySQL** - Banco de dados principal
- **Vercel AI SDK** - Integração com LLMs

### Mobile

- **Expo** - Framework React Native
- **React Native** - Desenvolvimento mobile multiplataforma
- **Expo Router** - Sistema de navegação
- **Tamagui** - Sistema de componentes para mobile

### Infraestrutura

- **Turbo** - Build system para monorepos
- **PNPM** - Gerenciador de pacotes
- **Vercel** - Plataforma de deploy
- **Docker** - Containerização (desenvolvimento)
- **GitHub Actions** - CI/CD

## Estrutura do Projeto

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

> **📚 Para um guia completo sobre banco de dados, consulte [banco-de-dados-kodix.md](./banco-de-dados-kodix.md)**

Resumo rápido:

1. **Defina o schema** em `packages/db/src/schema/apps/seuRecurso.ts`
2. **Exporte no index** em `packages/db/src/schema/apps/index.ts`
3. **Crie repositórios** em `packages/db/src/repositories/seuRecurso.ts`
4. **Aplique as alterações**: `pnpm db:push`

Para informações detalhadas sobre convenções, tipos de campos, relações e boas práticas, consulte o [Guia de Banco de Dados](./banco-de-dados-kodix.md).

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
5. **Banco de Dados**: Consulte o [Guia de Banco de Dados](./banco-de-dados-kodix.md#índices-e-performance) para otimizações

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

> **📚 Para troubleshooting completo de banco de dados, consulte [banco-de-dados-kodix.md#troubleshooting](./banco-de-dados-kodix.md#troubleshooting)**

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

### Documentação Interna

- [Documentação Principal](./documentacao-projeto-kodix.md) - Visão geral do projeto
- [Guia de Banco de Dados](./banco-de-dados-kodix.md) - Tudo sobre banco de dados
- [Criando SubApps](./creating-subapps.md) - Como criar novos módulos

### Documentação Externa

- [Documentação do tRPC](https://trpc.io/docs)
- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do Drizzle](https://orm.drizzle.team/docs/overview)
- [Documentação do TanStack Query](https://tanstack.com/query/latest/docs/react/overview)
- [Documentação do Tailwind CSS](https://tailwindcss.com/docs)
- [Documentação do Expo](https://docs.expo.dev)

### Estrutura Avançada (Para SubApps Complexos)

Este SubApp forneceria:

- Dashboard de métricas em tempo real
- Geração de relatórios customizados
- Visualizações interativas
- Exportação de dados
- APIs para integração

---

Para mais detalhes sobre desenvolvimento, consulte o [Guia de Desenvolvimento](./guia-desenvolvimento-kodix.md).

## Passo a Passo: Criando um SubApp

### 1. Estrutura Inicial

```bash
# Criar diretório do SubApp
mkdir packages/subapp-exemplo
cd packages/subapp-exemplo

# Criar estrutura básica
mkdir -p src/{components,pages,hooks,utils,types}
touch src/index.ts
touch package.json
touch tsconfig.json
touch README.md
```

### 2. Configuração do package.json

```json
{
  "name": "@kdx/subapp-exemplo",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./src/index.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint .",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@kdx/ui": "workspace:*",
    "@kdx/api": "workspace:*",
    "@kdx/db": "workspace:*",
    "react": "^18.2.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@kdx/eslint-config": "workspace:*",
    "@kdx/typescript-config": "workspace:*",
    "@types/react": "^18.2.45",
    "typescript": "^5.3.3"
  }
}
```

### 3. Configuração do TypeScript

```json
{
  "extends": "@kdx/typescript-config/react.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4. Implementação Base

#### src/index.ts

```typescript
// Exports principais do SubApp
export * from "./components";
export * from "./hooks";
export * from "./utils";
export * from "./types";

// Configuração do SubApp
export const subappConfig = {
  name: "exemplo",
  displayName: "Exemplo SubApp",
  version: "0.1.0",
  routes: [
    {
      path: "/exemplo",
      component: "ExemploPage",
    },
    {
      path: "/exemplo/settings",
      component: "ExemploSettingsPage",
    },
  ],
};
```

#### src/types/index.ts

```typescript
// Tipos específicos do SubApp
export interface ExemploConfig {
  enabled: boolean;
  settings: {
    apiKey?: string;
    endpoint?: string;
  };
}

export interface ExemploData {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### src/components/index.ts

```typescript
// Exports dos componentes
export { ExemploPage } from "./exemplo-page";
export { ExemploForm } from "./exemplo-form";
export { ExemploList } from "./exemplo-list";
```

### 5. Componente Principal

#### src/components/exemplo-page.tsx

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@kdx/ui/card';
import { Button } from '@kdx/ui/button';
import { useExemplo } from '../hooks/use-exemplo';

export function ExemploPage() {
  const { data, isLoading, refetch } = useExemplo();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Exemplo SubApp</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Esta é a página principal do SubApp Exemplo.</p>
          <Button onClick={() => refetch()} className="mt-4">
            Recarregar Dados
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 6. Custom Hook

#### src/hooks/use-exemplo.ts

```typescript
import { api } from "@kdx/api/react";

export function useExemplo() {
  const query = api.exemplo.getAll.useQuery();

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
```

## Integração com APIs (tRPC)

### 1. Criar Router tRPC

#### packages/api/src/router/exemplo.ts

```typescript
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const exemploRouter = createTRPCRouter({
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

### 2. Adicionar ao Router Principal

#### packages/api/src/root.ts

```typescript
import { exemploRouter } from "./router/exemplo";

export const appRouter = createTRPCRouter({
  // Outros roteadores...
  exemplo: exemploRouter,
});
```

## Schemas de Banco de Dados

### 1. Definir Schema

#### packages/db/src/schema/exemplo.ts

```typescript
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const exemplo = pgTable("exemplo", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const exemploRelations = relations(exemplo, ({ many }) => ({
  // Definir relações se necessário
}));

export type Exemplo = typeof exemplo.$inferSelect;
export type NewExemplo = typeof exemplo.$inferInsert;
```

### 2. Adicionar ao Schema Principal

#### packages/db/src/schema/index.ts

```typescript
export * from "./exemplo";
```

## Roteamento no Frontend

### 1. Registrar Rotas

#### apps/web/app/(dashboard)/exemplo/page.tsx

```typescript
import { ExemploPage } from '@kdx/subapp-exemplo';

export default function Page() {
  return <ExemploPage />;
}
```

#### apps/web/app/(dashboard)/exemplo/settings/page.tsx

```typescript
import { ExemploSettingsPage } from '@kdx/subapp-exemplo';

export default function SettingsPage() {
  return <ExemploSettingsPage />;
}
```

### 2. Adicionar ao Menu de Navegação

#### apps/web/src/components/nav/main-nav.tsx

```typescript
const navigation = [
  // ... outros itens
  {
    name: "Exemplo",
    href: "/exemplo",
    icon: ExampleIcon,
    subItems: [
      { name: "Dashboard", href: "/exemplo" },
      { name: "Configurações", href: "/exemplo/settings" },
    ],
  },
];
```

## Configuração e Permissões

### 1. Sistema de Permissões

#### src/config/permissions.ts

```typescript
export enum ExemploPermission {
  READ = "exemplo:read",
  WRITE = "exemplo:write",
  DELETE = "exemplo:delete",
  ADMIN = "exemplo:admin",
}

export const exemploPermissions = {
  [ExemploPermission.READ]: "Visualizar exemplo",
  [ExemploPermission.WRITE]: "Criar/editar exemplo",
  [ExemploPermission.DELETE]: "Excluir exemplo",
  [ExemploPermission.ADMIN]: "Administrar exemplo",
};
```

### 2. Middleware de Proteção

#### src/middleware/exemplo-auth.ts

```typescript
import { protectedProcedure } from "@kdx/api";

import { ExemploPermission } from "../config/permissions";

export const exemploProtectedProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Não autorizado",
      });
    }

    // Verificar permissões específicas
    const hasPermission = await checkUserPermission(
      ctx.session.user.id,
      ExemploPermission.READ,
    );

    if (!hasPermission) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Sem permissão para acessar este recurso",
      });
    }

    return next({ ctx });
  },
);
```

## Testes

### 1. Testes de Componentes

#### src/components/**tests**/exemplo-page.test.tsx

```typescript
import { render, screen } from '@testing-library/react';
import { ExemploPage } from '../exemplo-page';

// Mock do hook
jest.mock('../hooks/use-exemplo', () => ({
  useExemplo: () => ({
    data: [],
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

describe('ExemploPage', () => {
  it('should render correctly', () => {
    render(<ExemploPage />);

    expect(screen.getByText('Exemplo SubApp')).toBeInTheDocument();
    expect(screen.getByText('Recarregar Dados')).toBeInTheDocument();
  });
});
```

### 2. Testes de API

#### src/api/**tests**/exemplo.test.ts

```typescript
import { createTRPCMsw } from "msw-trpc";

import { appRouter } from "@kdx/api";

const trpcMsw = createTRPCMsw(appRouter);

describe("Exemplo API", () => {
  it("should return empty array initially", async () => {
    const caller = appRouter.createCaller({
      session: null,
      db: mockDb,
    });

    const result = await caller.exemplo.getAll();
    expect(result).toEqual([]);
  });
});
```

## Deploy e CI/CD

### 1. Adicionar ao turbo.json

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### 2. Incluir no Build Pipeline

#### .github/workflows/ci.yml

```yaml
- name: Build SubApps
  run: pnpm build --filter="@kdx/subapp-*"

- name: Test SubApps
  run: pnpm test --filter="@kdx/subapp-*"
```

## Melhores Práticas

### 1. Convenções de Nomenclatura

- **Packages**: `@kdx/subapp-{nome}`
- **Componentes**: `{Nome}Page`, `{Nome}Form`, etc.
- **Hooks**: `use{Nome}`, `use{Nome}Api`
- **Types**: `{Nome}Config`, `{Nome}Data`

### 2. Estrutura de Arquivos

- Mantenha arquivos pequenos (< 200 linhas)
- Agrupe por funcionalidade, não por tipo
- Use barrel exports (`index.ts`)
- Documente APIs públicas

### 3. Performance

- Lazy load componentes pesados
- Use React.memo quando apropriado
- Otimize queries do banco
- Implemente cache adequado

### 4. Segurança

- Valide todas as entradas
- Implemente permissões granulares
- Use middleware de autenticação
- Sanitize dados sensíveis

## Exemplo Completo: SubApp Analytics

Para um exemplo prático e completo, vamos criar um SubApp de Analytics:

### Estrutura Final

```
packages/subapp-analytics/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── analytics-dashboard.tsx
│   │   │   ├── metrics-card.tsx
│   │   │   └── charts/
│   │   ├── reports/
│   │   │   ├── report-generator.tsx
│   │   │   └── report-viewer.tsx
│   │   └── index.ts
│   ├── hooks/
│   │   ├── use-analytics.ts
│   │   ├── use-metrics.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── analytics.ts
│   │   └── index.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

Este SubApp forneceria:

- Dashboard de métricas em tempo real
- Geração de relatórios customizados
- Visualizações interativas
- Exportação de dados
- APIs para integração

---

Para mais detalhes sobre desenvolvimento, consulte o [Guia de Desenvolvimento](./guia-desenvolvimento-kodix.md).
