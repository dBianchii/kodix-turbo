# Backend Development Guide - Kodix Project

## 📖 Overview

Este guia detalha como implementar novas tabelas, relacionamentos, repositórios e APIs no backend do projeto Kodix. Para implementação de interfaces, consulte o [Frontend Development Guide](./frontend-guide.md).

## 🗄️ **1. Definição do Schema de Banco de Dados**

### 1.1 Criar Schema da Tabela Principal

```typescript
// packages/db/src/schema/apps/seuRecurso.ts
import {
  boolean,
  int,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

import { createId } from "../utils";

export const seuRecurso = mysqlTable(
  "seu_recurso",
  {
    id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
    nome: varchar("nome", { length: 255 }).notNull(),
    descricao: text("descricao"),
    ativo: boolean("ativo").default(true).notNull(),
    criadoEm: timestamp("criado_em").defaultNow().notNull(),
    atualizadoEm: timestamp("atualizado_em")
      .defaultNow()
      .onUpdateNow()
      .notNull(),

    // Chaves estrangeiras
    usuarioId: varchar("usuario_id", { length: 30 }).notNull(),
    equipeId: varchar("equipe_id", { length: 30 }).notNull(),
  },
  (table) => ({
    // Índices para performance
    nomeIdx: index("nome_idx").on(table.nome),
    usuarioIdx: index("usuario_idx").on(table.usuarioId),
    equipeIdx: index("equipe_idx").on(table.equipeId),
    ativoIdx: index("ativo_idx").on(table.ativo),
  }),
);
```

### 1.2 Criar Tabela de Ponte (Relacionamento Many-to-Many)

```typescript
// packages/db/src/schema/apps/seuRecurso.ts
export const seuRecursoCategoria = mysqlTable(
  "seu_recurso_categoria",
  {
    id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
    seuRecursoId: varchar("seu_recurso_id", { length: 30 }).notNull(),
    categoriaId: varchar("categoria_id", { length: 30 }).notNull(),
    criadoEm: timestamp("criado_em").defaultNow().notNull(),
  },
  (table) => ({
    // Índice único para evitar duplicatas
    uniqueRecursoCategoria: uniqueIndex("unique_recurso_categoria").on(
      table.seuRecursoId,
      table.categoriaId,
    ),
    // Índices para foreign keys
    recursoIdx: index("recurso_idx").on(table.seuRecursoId),
    categoriaIdx: index("categoria_idx").on(table.categoriaId),
  }),
);
```

### 1.3 Definir Relacionamentos com Drizzle

```typescript
// packages/db/src/schema/apps/seuRecurso.ts
import { relations } from "drizzle-orm";

import { teams } from "../app";
import { users } from "../auth";

export const seuRecursoRelations = relations(seuRecurso, ({ one, many }) => ({
  // Relacionamento com usuário
  usuario: one(users, {
    fields: [seuRecurso.usuarioId],
    references: [users.id],
  }),
  // Relacionamento com equipe
  equipe: one(teams, {
    fields: [seuRecurso.equipeId],
    references: [teams.id],
  }),
  // Relacionamento many-to-many via ponte
  categorias: many(seuRecursoCategoria),
}));

export const seuRecursoCategoriaRelations = relations(
  seuRecursoCategoria,
  ({ one }) => ({
    seuRecurso: one(seuRecurso, {
      fields: [seuRecursoCategoria.seuRecursoId],
      references: [seuRecurso.id],
      relationName: "recurso_categorias",
    }),
    categoria: one(categoria, {
      fields: [seuRecursoCategoria.categoriaId],
      references: [categoria.id],
      relationName: "categoria_recursos",
    }),
  }),
);
```

### 1.4 Exportar no Index

```typescript
// packages/db/src/schema/apps/index.ts
export * from "./seuRecurso";
```

### 1.5 Aplicar Mudanças

```bash
# Aplicar schema em desenvolvimento
pnpm db:push

# Visualizar dados
pnpm db:studio

# Gerar migration para produção (quando necessário)
pnpm db:generate
```

## 🏪 **2. Criar Repositórios (Camada de Acesso a Dados)**

### 2.1 Repositório Principal

```typescript
// packages/db/src/repositories/seuRecurso.ts
import { and, asc, count, desc, eq, like } from "drizzle-orm";

import { db } from "../client";
import { seuRecurso, seuRecursoCategoria } from "../schema/apps/seuRecurso";

export const SeuRecursoRepository = {
  // Criar novo recurso
  create: async (data: {
    nome: string;
    descricao?: string;
    usuarioId: string;
    equipeId: string;
  }) => {
    const [created] = await db.insert(seuRecurso).values(data).returning();
    return created;
  },

  // Buscar por ID com relacionamentos
  findById: async (id: string) => {
    return db.query.seuRecurso.findFirst({
      where: eq(seuRecurso.id, id),
      with: {
        usuario: {
          columns: { id: true, name: true, email: true },
        },
        equipe: {
          columns: { id: true, name: true },
        },
        categorias: {
          with: {
            categoria: {
              columns: { id: true, nome: true },
            },
          },
        },
      },
    });
  },

  // Listar com filtros e paginação
  findMany: async (params: {
    equipeId: string;
    busca?: string;
    ativo?: boolean;
    categoriaId?: string;
    limite?: number;
    offset?: number;
    ordenarPor?: "nome" | "criadoEm";
    ordem?: "asc" | "desc";
  }) => {
    const {
      equipeId,
      busca,
      ativo,
      categoriaId,
      limite = 20,
      offset = 0,
      ordenarPor = "criadoEm",
      ordem = "desc",
    } = params;

    const condicoes = [eq(seuRecurso.equipeId, equipeId)];

    if (busca) {
      condicoes.push(like(seuRecurso.nome, `%${busca}%`));
    }

    if (ativo !== undefined) {
      condicoes.push(eq(seuRecurso.ativo, ativo));
    }

    // Se filtrar por categoria, fazer join
    let query = db.query.seuRecurso.findMany({
      where: and(...condicoes),
      with: {
        categorias: {
          with: {
            categoria: {
              columns: { id: true, nome: true },
            },
          },
        },
      },
      limit: limite,
      offset,
      orderBy:
        ordem === "desc"
          ? [desc(seuRecurso[ordenarPor])]
          : [asc(seuRecurso[ordenarPor])],
    });

    return query;
  },

  // Contar total de registros (para paginação)
  count: async (params: {
    equipeId: string;
    busca?: string;
    ativo?: boolean;
  }) => {
    const { equipeId, busca, ativo } = params;
    const condicoes = [eq(seuRecurso.equipeId, equipeId)];

    if (busca) {
      condicoes.push(like(seuRecurso.nome, `%${busca}%`));
    }

    if (ativo !== undefined) {
      condicoes.push(eq(seuRecurso.ativo, ativo));
    }

    const [result] = await db
      .select({ count: count() })
      .from(seuRecurso)
      .where(and(...condicoes));

    return result?.count ?? 0;
  },

  // Atualizar
  update: async (id: string, data: Partial<typeof seuRecurso.$inferInsert>) => {
    const [updated] = await db
      .update(seuRecurso)
      .set({ ...data, atualizadoEm: new Date() })
      .where(eq(seuRecurso.id, id))
      .returning();
    return updated;
  },

  // Excluir (soft delete recomendado)
  softDelete: async (id: string) => {
    const [updated] = await db
      .update(seuRecurso)
      .set({ ativo: false, atualizadoEm: new Date() })
      .where(eq(seuRecurso.id, id))
      .returning();
    return updated;
  },

  // Excluir permanentemente
  delete: async (id: string) => {
    // Primeiro remover todas as categorias relacionadas
    await db
      .delete(seuRecursoCategoria)
      .where(eq(seuRecursoCategoria.seuRecursoId, id));

    // Depois excluir o recurso
    await db.delete(seuRecurso).where(eq(seuRecurso.id, id));
  },
};
```

### 2.2 Repositório da Ponte (Relacionamentos)

```typescript
// packages/db/src/repositories/seuRecurso.ts (continuação)

export const SeuRecursoCategoriaRepository = {
  // Adicionar categoria a um recurso
  adicionarCategoria: async (seuRecursoId: string, categoriaId: string) => {
    try {
      const [created] = await db
        .insert(seuRecursoCategoria)
        .values({ seuRecursoId, categoriaId })
        .returning();
      return created;
    } catch (error) {
      // Handle unique constraint violation
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error("Categoria já associada a este recurso");
      }
      throw error;
    }
  },

  // Remover categoria de um recurso
  removerCategoria: async (seuRecursoId: string, categoriaId: string) => {
    await db
      .delete(seuRecursoCategoria)
      .where(
        and(
          eq(seuRecursoCategoria.seuRecursoId, seuRecursoId),
          eq(seuRecursoCategoria.categoriaId, categoriaId),
        ),
      );
  },

  // Substituir todas as categorias de um recurso
  substituirCategorias: async (
    seuRecursoId: string,
    categoriaIds: string[],
  ) => {
    await db.transaction(async (tx) => {
      // Remover todas as categorias atuais
      await tx
        .delete(seuRecursoCategoria)
        .where(eq(seuRecursoCategoria.seuRecursoId, seuRecursoId));

      // Adicionar novas categorias
      if (categoriaIds.length > 0) {
        await tx.insert(seuRecursoCategoria).values(
          categoriaIds.map((categoriaId) => ({
            seuRecursoId,
            categoriaId,
          })),
        );
      }
    });
  },

  // Buscar recursos por categoria
  buscarPorCategoria: async (categoriaId: string, equipeId: string) => {
    return db
      .select({
        recurso: seuRecurso,
      })
      .from(seuRecurso)
      .innerJoin(
        seuRecursoCategoria,
        eq(seuRecurso.id, seuRecursoCategoria.seuRecursoId),
      )
      .where(
        and(
          eq(seuRecursoCategoria.categoriaId, categoriaId),
          eq(seuRecurso.equipeId, equipeId),
          eq(seuRecurso.ativo, true),
        ),
      );
  },
};
```

### 2.3 Exportar Repositórios

```typescript
// packages/db/src/repositories/index.ts
export * from "./seuRecurso";
```

## 🔗 **3. Criar Endpoints tRPC**

> ⚠️ **IMPORTANTE**: Para comunicação entre SubApps, use **Service Layer** em vez de endpoints HTTP. Consulte [SubApp Architecture](./subapp-architecture.md) para padrões de comunicação cross-app.

### 3.1 Definir Validadores

```typescript
// packages/validators/src/trpc/app/seuRecurso.ts
import { z } from "zod";

export const criarSeuRecursoSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(255, "Nome muito longo"),
  descricao: z.string().max(1000, "Descrição muito longa").optional(),
  categoriaIds: z.array(z.string()).optional(),
});

export const atualizarSeuRecursoSchema = z.object({
  id: z.string(),
  nome: z.string().min(2).max(255).optional(),
  descricao: z.string().max(1000).optional(),
  ativo: z.boolean().optional(),
  categoriaIds: z.array(z.string()).optional(),
});

export const buscarSeuRecursoSchema = z.object({
  busca: z.string().optional(),
  ativo: z.boolean().optional(),
  categoriaId: z.string().optional(),
  limite: z.number().min(1).max(100).default(20),
  pagina: z.number().min(1).default(1),
  ordenarPor: z.enum(["nome", "criadoEm"]).default("criadoEm"),
  ordem: z.enum(["asc", "desc"]).default("desc"),
});

export const gerenciarCategoriasSchema = z.object({
  seuRecursoId: z.string(),
  categoriaIds: z.array(z.string()),
});

// Exportar tipos inferidos
export type CriarSeuRecursoInput = z.infer<typeof criarSeuRecursoSchema>;
export type AtualizarSeuRecursoInput = z.infer<
  typeof atualizarSeuRecursoSchema
>;
export type BuscarSeuRecursoInput = z.infer<typeof buscarSeuRecursoSchema>;
```

### 3.2 Criar Router tRPC

```typescript
// packages/api/src/trpc/routers/app/seuRecurso.ts
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  SeuRecursoCategoriaRepository,
  SeuRecursoRepository,
} from "@kdx/db/repositories/seuRecurso";
import {
  atualizarSeuRecursoSchema,
  buscarSeuRecursoSchema,
  criarSeuRecursoSchema,
  gerenciarCategoriasSchema,
} from "@kdx/validators/trpc/app/seuRecurso";

import { protectedProcedure, router } from "../../trpc";

export const seuRecursoRouter = router({
  // Listar recursos com paginação
  listar: protectedProcedure
    .input(buscarSeuRecursoSchema)
    .query(async ({ ctx, input }) => {
      const { limite, pagina, ...filtros } = input;
      const offset = (pagina - 1) * limite;

      const [recursos, total] = await Promise.all([
        SeuRecursoRepository.findMany({
          equipeId: ctx.user.activeTeamId,
          limite,
          offset,
          ...filtros,
        }),
        SeuRecursoRepository.count({
          equipeId: ctx.user.activeTeamId,
          busca: filtros.busca,
          ativo: filtros.ativo,
        }),
      ]);

      return {
        recursos,
        paginacao: {
          total,
          pagina,
          limite,
          totalPaginas: Math.ceil(total / limite),
        },
      };
    }),

  // Buscar por ID
  buscarPorId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const recurso = await SeuRecursoRepository.findById(input.id);

      if (!recurso) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recurso não encontrado",
        });
      }

      // Verificar se o usuário tem acesso (mesmo team)
      if (recurso.equipeId !== ctx.user.activeTeamId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Acesso negado",
        });
      }

      return recurso;
    }),

  // Criar recurso
  criar: protectedProcedure
    .input(criarSeuRecursoSchema)
    .mutation(async ({ ctx, input }) => {
      const { categoriaIds, ...dadosRecurso } = input;

      try {
        // Criar o recurso
        const recurso = await SeuRecursoRepository.create({
          ...dadosRecurso,
          usuarioId: ctx.user.id,
          equipeId: ctx.user.activeTeamId,
        });

        // Adicionar categorias se fornecidas
        if (categoriaIds && categoriaIds.length > 0) {
          await Promise.all(
            categoriaIds.map((categoriaId) =>
              SeuRecursoCategoriaRepository.adicionarCategoria(
                recurso.id,
                categoriaId,
              ),
            ),
          );
        }

        return recurso;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar recurso",
          cause: error,
        });
      }
    }),

  // Atualizar recurso
  atualizar: protectedProcedure
    .input(atualizarSeuRecursoSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, categoriaIds, ...dadosAtualizacao } = input;

      // Verificar se o recurso existe e pertence à equipe
      const recursoExistente = await SeuRecursoRepository.findById(id);
      if (
        !recursoExistente ||
        recursoExistente.equipeId !== ctx.user.activeTeamId
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recurso não encontrado",
        });
      }

      try {
        // Atualizar dados básicos
        const recurso = await SeuRecursoRepository.update(id, dadosAtualizacao);

        // Atualizar categorias se fornecidas
        if (categoriaIds !== undefined) {
          await SeuRecursoCategoriaRepository.substituirCategorias(
            id,
            categoriaIds,
          );
        }

        return recurso;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar recurso",
          cause: error,
        });
      }
    }),

  // Soft delete
  desativar: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const recurso = await SeuRecursoRepository.findById(input.id);
      if (!recurso || recurso.equipeId !== ctx.user.activeTeamId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recurso não encontrado",
        });
      }

      return SeuRecursoRepository.softDelete(input.id);
    }),

  // Excluir permanentemente
  excluir: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const recurso = await SeuRecursoRepository.findById(input.id);
      if (!recurso || recurso.equipeId !== ctx.user.activeTeamId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recurso não encontrado",
        });
      }

      await SeuRecursoRepository.delete(input.id);
      return { sucesso: true };
    }),

  // Gerenciar categorias
  gerenciarCategorias: protectedProcedure
    .input(gerenciarCategoriasSchema)
    .mutation(async ({ ctx, input }) => {
      const recurso = await SeuRecursoRepository.findById(input.seuRecursoId);
      if (!recurso || recurso.equipeId !== ctx.user.activeTeamId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recurso não encontrado",
        });
      }

      await SeuRecursoCategoriaRepository.substituirCategorias(
        input.seuRecursoId,
        input.categoriaIds,
      );

      return { sucesso: true };
    }),

  // Buscar por categoria
  buscarPorCategoria: protectedProcedure
    .input(z.object({ categoriaId: z.string() }))
    .query(async ({ ctx, input }) => {
      return SeuRecursoCategoriaRepository.buscarPorCategoria(
        input.categoriaId,
        ctx.user.activeTeamId,
      );
    }),
});
```

### 3.3 Registrar no Router Principal

```typescript
// packages/api/src/trpc/routers/app/index.ts
import { router } from "../../trpc";
import { seuRecursoRouter } from "./seuRecurso";

export const appRouter = router({
  // Outros routers existentes...
  seuRecurso: seuRecursoRouter,
});
```

## 🧪 **4. Adicionar Dados de Teste (Seed)**

### 4.1 Criar Seed

```typescript
// packages/db/src/seed/seuRecurso.ts
import {
  SeuRecursoCategoriaRepository,
  SeuRecursoRepository,
} from "../repositories/seuRecurso";

export async function seedSeuRecurso() {
  try {
    console.log("🌱 Iniciando seed de SeuRecurso...");

    // IDs de exemplo (substitua pelos IDs reais do seu ambiente)
    const usuarioExemploId = "user-exemplo-id";
    const equipeExemploId = "team-exemplo-id";
    const categoriaIds = ["cat-1", "cat-2", "cat-3"];

    // Criar recursos de exemplo
    const recursos = [
      {
        nome: "Recurso Principal",
        descricao: "Descrição detalhada do recurso principal da plataforma",
        usuarioId: usuarioExemploId,
        equipeId: equipeExemploId,
      },
      {
        nome: "Recurso Secundário",
        descricao: "Recurso complementar para funcionalidades avançadas",
        usuarioId: usuarioExemploId,
        equipeId: equipeExemploId,
      },
      {
        nome: "Recurso de Teste",
        descricao: "Recurso criado apenas para testes e desenvolvimento",
        usuarioId: usuarioExemploId,
        equipeId: equipeExemploId,
      },
    ];

    const recursosCreated = [];
    for (const recursoData of recursos) {
      const recurso = await SeuRecursoRepository.create(recursoData);
      recursosCreated.push(recurso);
      console.log(`✅ Recurso criado: ${recurso.nome}`);
    }

    // Associar categorias aos recursos
    for (let i = 0; i < recursosCreated.length; i++) {
      const recurso = recursosCreated[i];
      // Cada recurso terá 1-2 categorias aleatórias
      const numCategorias = Math.floor(Math.random() * 2) + 1;
      const categoriasParaRecurso = categoriaIds.slice(0, numCategorias);

      for (const categoriaId of categoriasParaRecurso) {
        try {
          await SeuRecursoCategoriaRepository.adicionarCategoria(
            recurso.id,
            categoriaId,
          );
          console.log(
            `🔗 Categoria ${categoriaId} associada ao recurso ${recurso.nome}`,
          );
        } catch (error) {
          console.log(
            `⚠️  Categoria ${categoriaId} já associada ao recurso ${recurso.nome}`,
          );
        }
      }
    }

    console.log("✅ Seed de SeuRecurso concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro durante o seed de SeuRecurso:", error);
    throw error;
  }
}
```

### 4.2 Registrar no Seed Principal

```typescript
// packages/db/src/seed/index.ts
import { seedSeuRecurso } from "./seuRecurso";

export async function runSeed() {
  try {
    // Outros seeds existentes...

    await seedSeuRecurso();

    console.log("🎉 Todos os seeds executados com sucesso!");
  } catch (error) {
    console.error("💥 Erro durante execução dos seeds:", error);
    process.exit(1);
  }
}
```

### 4.3 Executar Seeds

```bash
# Executar todos os seeds
pnpm db:seed

# Ou executar seed específico (se configurado)
pnpm db:seed --only=seuRecurso
```

## 📋 **5. Comandos Úteis**

### 5.1 Comandos de Banco de Dados

```bash
# Aplicar mudanças do schema (desenvolvimento)
pnpm db:push

# Gerar migration (produção)
pnpm db:generate

# Aplicar migrations (produção)
pnpm db:migrate

# Visualizar dados
pnpm db:studio

# Resetar banco (cuidado!)
pnpm db:reset

# Executar seeds
pnpm db:seed
```

### 5.2 Comandos de Desenvolvimento

```bash
# Iniciar ambiente de desenvolvimento
pnpm dev

# Verificar tipos TypeScript
pnpm type-check

# Executar testes
pnpm test

# Executar linter
pnpm lint

# Formatar código
pnpm format
```

## 🔍 **6. Debugging e Troubleshooting**

### 6.1 Logs Úteis

```typescript
// Adicionar logs no repositório
console.log("🔍 Buscando recurso com ID:", id);
console.log("📊 Query executada:", query);
console.log("✅ Resultado encontrado:", result);
```

### 6.2 Problemas Comuns

**Erro de Unique Constraint:**

```typescript
// Tratar duplicatas na ponte
try {
  await SeuRecursoCategoriaRepository.adicionarCategoria(
    recursoId,
    categoriaId,
  );
} catch (error) {
  if (error.message.includes("ER_DUP_ENTRY")) {
    // Categoria já associada, ignorar ou informar usuário
    return { message: "Categoria já associada" };
  }
  throw error;
}
```

**Performance com Muitos Relacionamentos:**

```typescript
// Usar select específico em vez de buscar todos os campos
const recursos = await db
  .select({
    id: seuRecurso.id,
    nome: seuRecurso.nome,
    // Apenas campos necessários
  })
  .from(seuRecurso)
  .limit(limite);
```

## 📚 **9. Next Steps**

1. **Implement Frontend**: Consulte [Frontend Development Guide](./frontend-guide.md)
2. **Configure Permissions**: Definir roles específicos se necessário
3. **Add Tests**: Implementar testes unitários e de integração

## 🔗 **10. Service Layer para Comunicação Cross-App**

### **Quando Criar Service Layer**

Se seu SubApp precisa ser acessado por outros SubApps, implemente um Service Layer:

```typescript
// packages/api/src/internal/services/seu-recurso.service.ts
import { TRPCError } from "@trpc/server";

import type { KodixAppId } from "@kdx/shared";
import { SeuRecursoRepository } from "@kdx/db/repositories/seuRecurso";

export class SeuRecursoService {
  private static validateTeamAccess(teamId: string) {
    if (!teamId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "teamId is required for cross-app access",
      });
    }
  }

  private static logAccess(
    action: string,
    params: { teamId: string; requestingApp: KodixAppId },
  ) {
    console.log(
      `🔄 [SeuRecursoService] ${action} by ${params.requestingApp} for team: ${params.teamId}`,
    );
  }

  static async getRecursoById({
    recursoId,
    teamId,
    requestingApp,
  }: {
    recursoId: string;
    teamId: string;
    requestingApp: KodixAppId;
  }) {
    this.validateTeamAccess(teamId);
    this.logAccess("getRecursoById", { teamId, requestingApp });

    const recurso = await SeuRecursoRepository.findById(recursoId);

    if (!recurso || recurso.equipeId !== teamId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Recurso not found or access denied",
      });
    }

    return recurso;
  }

  static async getAvailableRecursos({
    teamId,
    requestingApp,
  }: {
    teamId: string;
    requestingApp: KodixAppId;
  }) {
    this.validateTeamAccess(teamId);
    this.logAccess("getAvailableRecursos", { teamId, requestingApp });

    return await SeuRecursoRepository.findMany({
      equipeId: teamId,
      ativo: true,
    });
  }
}
```

### **Uso do Service Layer em Outros SubApps**

```typescript
// packages/api/src/trpc/routers/app/outroSubApp/_router.ts
import { outroSubAppId } from "@kdx/shared";

import { SeuRecursoService } from "../../../../internal/services/seu-recurso.service";

export const outroSubAppRouter = {
  usarRecurso: protectedProcedure
    .input(z.object({ recursoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // ✅ Usar Service Layer para acessar outro SubApp
      const recurso = await SeuRecursoService.getRecursoById({
        recursoId: input.recursoId,
        teamId: ctx.auth.user.activeTeamId,
        requestingApp: outroSubAppId,
      });

      // Usar o recurso na lógica do seu SubApp
      return await processarComRecurso(recurso);
    }),
} satisfies TRPCRouterRecord;
```

> 📚 **Referência Completa**: Para padrões completos de Service Layer, consulte [SubApp Architecture](./subapp-architecture.md#-comunicação-entre-subapps-via-service-layer).

## 📖 **11. Related Documentation**

- [Frontend Development Guide](./frontend-guide.md)
- [Project Documentation](../project/overview.md)
- [Development Setup](./development-setup.md)

---

_Este documento deve ser atualizado sempre que houver mudanças nos padrões de implementação backend._
