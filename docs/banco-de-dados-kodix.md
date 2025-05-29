# Guia de Banco de Dados - Kodix

> Documentação completa sobre padrões, convenções e melhores práticas para trabalhar com banco de dados no projeto Kodix.

## Sumário

1. [Visão Geral](#visão-geral)
2. [Estrutura de Arquivos](#estrutura-de-arquivos)
3. [Convenções de Nomenclatura](#convenções-de-nomenclatura)
4. [Criando Novos Schemas](#criando-novos-schemas)
5. [Tipos de Campos](#tipos-de-campos)
6. [Relações entre Tabelas](#relações-entre-tabelas)
7. [Repositórios](#repositórios)
8. [Migrações](#migrações)
9. [Seeds](#seeds)
10. [Índices e Performance](#índices-e-performance)
11. [Validações](#validações)
12. [Exemplos Práticos](#exemplos-práticos)
13. [Comandos Úteis](#comandos-úteis)
14. [Troubleshooting](#troubleshooting)

---

## 1. Visão Geral

O Kodix utiliza **Drizzle ORM** com **MySQL** como banco de dados principal. Esta escolha oferece:

- **Type Safety**: Tipagem completa do TypeScript
- **Performance**: Queries otimizadas e sem overhead
- **Developer Experience**: API intuitiva e migrações automáticas
- **Flexibilidade**: Suporte para queries complexas quando necessário

### Stack de Banco de Dados

- **ORM**: Drizzle ORM
- **Database**: MySQL 8.0+
- **Client**: mysql2
- **IDs**: nanoid (30 caracteres)
- **Timestamps**: UTC com `timestamp`

---

## 2. Estrutura de Arquivos

```
packages/db/
├── src/
│   ├── client.ts              # Cliente do banco de dados
│   ├── schema/                # Definições de tabelas
│   │   ├── index.ts          # Export central
│   │   ├── auth/             # Tabelas de autenticação
│   │   ├── team/             # Tabelas de equipes
│   │   ├── user/             # Tabelas de usuários
│   │   └── apps/             # Tabelas dos SubApps
│   │       ├── index.ts
│   │       ├── kodixCare.ts
│   │       ├── calendar.ts
│   │       └── todo.ts
│   ├── repositories/          # Camada de repositórios
│   │   ├── index.ts
│   │   └── [model].ts
│   └── utils.ts              # Utilitários (createId, etc)
├── scripts/
│   ├── seed.ts               # Script de seed
│   └── migrations/           # Migrações customizadas
└── drizzle.config.ts         # Configuração do Drizzle
```

---

## 3. Convenções de Nomenclatura

### Tabelas

- **Nome**: camelCase singular (ex: `user`, `teamMember`, `careTask`)
- **Prefixo por contexto**: Opcional para SubApps (ex: `careTask`, `calendarEvent`)

### Campos

- **IDs**: Sempre `id` (não `userId`, `taskId`)
- **Timestamps**: `createdAt`, `updatedAt`, `deletedAt`
- **Foreign Keys**: `[tabela]Id` (ex: `userId`, `teamId`)
- **Booleanos**: Prefixo `is` ou `has` (ex: `isActive`, `hasNotifications`)
- **Enums**: SCREAMING_SNAKE_CASE

### Exemplos de Nomenclatura

```ts
// ✅ BOM
export const user = mysqlTable("user", {
  id: varchar("id", { length: 30 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ❌ EVITAR
export const users = mysqlTable("users", {
  user_id: varchar("user_id", { length: 30 }).primaryKey(),
  user_email: varchar("user_email", { length: 255 }),
  active: boolean("active"),
  created: timestamp("created"),
});
```

---

## 4. Criando Novos Schemas

### 4.1 Estrutura Básica

```ts
// packages/db/src/schema/apps/notes.ts
import {
  boolean,
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

import { createId } from "../utils";

export const note = mysqlTable("note", {
  // IDs sempre primeiro
  id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),

  // Foreign keys
  userId: varchar("userId", { length: 30 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  teamId: varchar("teamId", { length: 30 }).references(() => team.id, {
    onDelete: "set null",
  }),

  // Campos de dados
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  priority: int("priority").default(0),
  isArchived: boolean("isArchived").default(false).notNull(),

  // Timestamps sempre por último
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
```

### 4.2 Usando o Script Utilitário (Recomendado)

Para facilitar a criação de novos schemas seguindo os padrões do projeto, use o script `create-schema`:

```bash
# Para criar um schema geral
pnpm --filter @kdx/db create-schema userSettings

# Para criar um schema de SubApp
pnpm --filter @kdx/db create-schema note --app
```

O script automaticamente:

- ✅ Cria o arquivo de schema com a estrutura padrão
- ✅ Cria o repositório correspondente com métodos CRUD
- ✅ Usa as convenções de nomenclatura corretas
- ✅ Inclui campos essenciais (id, timestamps)
- ✅ Adiciona imports necessários
- ✅ Gera tipos TypeScript

Após executar o script:

1. Ajuste os campos do schema conforme necessário
2. Adicione os exports nos arquivos index.ts
3. Execute `pnpm db:push` para aplicar ao banco

### 4.3 Exportar o Schema

```ts
// packages/db/src/schema/apps/index.ts
export * from "./notes";
export * from "./kodixCare";
// ... outros schemas
```

### 4.4 Tipos TypeScript

O Drizzle gera automaticamente os tipos:

```ts
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { note } from "../schema/apps/notes";

// Tipo para SELECT
export type Note = InferSelectModel<typeof note>;

// Tipo para INSERT
export type NewNote = InferInsertModel<typeof note>;
```

---

## 5. Tipos de Campos

### 5.1 Campos Comuns

```ts
// IDs - sempre varchar(30) com nanoid
id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),

// Strings curtas
name: varchar("name", { length: 255 }).notNull(),

// Textos longos
description: text("description"),

// Números
quantity: int("quantity").default(0),
price: decimal("price", { precision: 10, scale: 2 }),

// Booleanos
isActive: boolean("isActive").default(true).notNull(),

// Datas
birthDate: date("birthDate"),
appointmentTime: datetime("appointmentTime"),

// Timestamps
createdAt: timestamp("createdAt").defaultNow().notNull(),
updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
deletedAt: timestamp("deletedAt"), // Para soft delete

// Enums
status: mysqlEnum("status", ["PENDING", "ACTIVE", "COMPLETED", "CANCELLED"])
  .default("PENDING")
  .notNull(),

// JSON
metadata: json("metadata").$type<{ key: string; value: any }>(),
```

### 5.2 Constraints e Validações

```ts
// Unique
email: varchar("email", { length: 255 }).unique().notNull(),

// Check constraints
age: int("age").notNull(),
// Adicionar depois: sql`CHECK (age >= 0 AND age <= 150)`

// Índices compostos (definir após a tabela)
export const userIndex = index("user_email_idx").on(user.email);
```

---

## 6. Relações entre Tabelas

### 6.1 One-to-Many

```ts
// Um usuário tem muitas tarefas
export const task = mysqlTable("task", {
  id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
  userId: varchar("userId", { length: 30 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
});

// Relações (opcional, para queries)
export const userRelations = relations(user, ({ many }) => ({
  tasks: many(task),
}));

export const taskRelations = relations(task, ({ one }) => ({
  user: one(user, {
    fields: [task.userId],
    references: [user.id],
  }),
}));
```

### 6.2 Many-to-Many

```ts
// Tabela de junção
export const userTeam = mysqlTable(
  "userTeam",
  {
    userId: varchar("userId", { length: 30 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    teamId: varchar("teamId", { length: 30 })
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    role: mysqlEnum("role", ["MEMBER", "ADMIN"]).default("MEMBER"),
    joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey(table.userId, table.teamId),
  }),
);
```

### 6.3 One-to-One

```ts
export const userProfile = mysqlTable("userProfile", {
  userId: varchar("userId", { length: 30 })
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  bio: text("bio"),
  avatarUrl: varchar("avatarUrl", { length: 500 }),
});
```

---

## 7. Repositórios

### 7.1 Estrutura Padrão

```ts
// packages/db/src/repositories/note.ts
import { and, desc, eq, isNull } from "drizzle-orm";

import type { NewNote, Note } from "../types";
import { db } from "../client";
import { note } from "../schema/apps/notes";

export const NoteRepository = {
  // CREATE
  create: async (data: NewNote) => {
    const [created] = await db.insert(note).values(data).returning();
    return created;
  },

  // READ
  findById: async (id: string) => {
    const [found] = await db
      .select()
      .from(note)
      .where(eq(note.id, id))
      .limit(1);
    return found;
  },

  findByUser: async (
    userId: string,
    options?: {
      includeArchived?: boolean;
      limit?: number;
      offset?: number;
    },
  ) => {
    const conditions = [eq(note.userId, userId)];
    if (!options?.includeArchived) {
      conditions.push(eq(note.isArchived, false));
    }

    return db
      .select()
      .from(note)
      .where(and(...conditions))
      .orderBy(desc(note.createdAt))
      .limit(options?.limit ?? 50)
      .offset(options?.offset ?? 0);
  },

  // UPDATE
  update: async (id: string, data: Partial<Omit<Note, "id" | "createdAt">>) => {
    const [updated] = await db
      .update(note)
      .set(data)
      .where(eq(note.id, id))
      .returning();
    return updated;
  },

  // DELETE
  delete: async (id: string) => {
    await db.delete(note).where(eq(note.id, id));
  },

  // Soft Delete
  archive: async (id: string) => {
    return NoteRepository.update(id, { isArchived: true });
  },

  // Queries complexas
  getStats: async (userId: string) => {
    const result = await db
      .select({
        total: sql<number>`count(*)`,
        archived: sql<number>`sum(case when ${note.isArchived} then 1 else 0 end)`,
      })
      .from(note)
      .where(eq(note.userId, userId));

    return result[0];
  },
};
```

### 7.2 Exportar Repositório

```ts
// packages/db/src/repositories/index.ts
export * from "./user";
export * from "./team";
export * from "./note";
// ... outros repositórios
```

---

## 8. Migrações

### 8.1 Aplicar Schemas

```bash
# Desenvolvimento - aplica mudanças diretamente
pnpm db:push

# Produção - gera SQL de migração
pnpm db:generate
pnpm db:migrate
```

### 8.2 Migração Manual

```ts
// packages/db/scripts/migrations/add-note-tags.ts
import { sql } from "drizzle-orm";

import { db } from "../../src/client";

async function migrate() {
  await db.execute(sql`
    CREATE TABLE noteTag (
      noteId VARCHAR(30) NOT NULL,
      tag VARCHAR(50) NOT NULL,
      PRIMARY KEY (noteId, tag),
      FOREIGN KEY (noteId) REFERENCES note(id) ON DELETE CASCADE
    )
  `);

  console.log("✅ Tabela noteTag criada");
}

migrate().catch(console.error);
```

---

## 9. Seeds

### 9.1 Estrutura de Seed

```ts
// packages/db/scripts/seed.ts
import { db } from "../src/client";
import { note, team, user } from "../src/schema";
import { createId } from "../src/utils";

async function seed() {
  console.log("🌱 Iniciando seed...");

  // Criar usuário de teste
  const [testUser] = await db
    .insert(user)
    .values({
      id: createId(),
      email: "test@kodix.com",
      name: "Usuário Teste",
    })
    .returning();

  // Criar time
  const [testTeam] = await db
    .insert(team)
    .values({
      id: createId(),
      name: "Time Teste",
      ownerId: testUser.id,
    })
    .returning();

  // Criar notas
  const notes = Array.from({ length: 10 }, (_, i) => ({
    id: createId(),
    userId: testUser.id,
    teamId: testTeam.id,
    title: `Nota ${i + 1}`,
    content: `Conteúdo da nota ${i + 1}`,
  }));

  await db.insert(note).values(notes);

  console.log("✅ Seed concluído!");
}

seed()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
```

---

## 10. Índices e Performance

### 10.1 Definindo Índices

```ts
import { index, uniqueIndex } from "drizzle-orm/mysql-core";

export const note = mysqlTable(
  "note",
  {
    // ... campos
  },
  (table) => ({
    // Índice simples
    userIdIdx: index("user_id_idx").on(table.userId),

    // Índice composto
    userTeamIdx: index("user_team_idx").on(table.userId, table.teamId),

    // Índice único
    slugIdx: uniqueIndex("slug_idx").on(table.slug),
  }),
);
```

### 10.2 Boas Práticas de Performance

```ts
// ✅ BOM - Usar select específico
const notes = await db
  .select({
    id: note.id,
    title: note.title,
  })
  .from(note)
  .where(eq(note.userId, userId));

// ❌ EVITAR - Select *
const notes = await db.select().from(note);

// ✅ BOM - Paginação
const notes = await db
  .select()
  .from(note)
  .limit(20)
  .offset(page * 20);

// ✅ BOM - Usar prepared statements
const getNoteById = db
  .select()
  .from(note)
  .where(eq(note.id, sql.placeholder("id")))
  .prepare();

const result = await getNoteById.execute({ id: noteId });
```

---

## 11. Validações

### 11.1 Validação com Zod

```ts
// packages/validators/src/schemas/note.ts
import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().optional(),
  teamId: z.string().length(30).optional(),
  priority: z.number().int().min(0).max(5).default(0),
});

export const updateNoteSchema = createNoteSchema.partial();

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
```

### 11.2 Uso no Repositório

```ts
import { createNoteSchema } from "@kdx/validators";

export const NoteRepository = {
  create: async (data: unknown) => {
    // Validar entrada
    const validated = createNoteSchema.parse(data);

    const [created] = await db.insert(note).values(validated).returning();

    return created;
  },
};
```

---

## 12. Exemplos Práticos

### 12.1 SubApp Completo - Sistema de Tarefas

```ts
// 1. Schema
// packages/db/src/schema/apps/taskManager.ts
export const taskList = mysqlTable("taskList", {
  id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
  teamId: varchar("teamId", { length: 30 })
    .notNull()
    .references(() => team.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  color: varchar("color", { length: 7 }).default("#3B82F6"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const task = mysqlTable(
  "task",
  {
    id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
    listId: varchar("listId", { length: 30 })
      .notNull()
      .references(() => taskList.id, { onDelete: "cascade" }),
    assigneeId: varchar("assigneeId", { length: 30 }).references(
      () => user.id,
      { onDelete: "set null" },
    ),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    priority: mysqlEnum("priority", [
      "LOW",
      "MEDIUM",
      "HIGH",
      "URGENT",
    ]).default("MEDIUM"),
    status: mysqlEnum("status", [
      "TODO",
      "IN_PROGRESS",
      "DONE",
      "CANCELLED",
    ]).default("TODO"),
    dueDate: timestamp("dueDate"),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    listIdx: index("list_idx").on(table.listId),
    assigneeIdx: index("assignee_idx").on(table.assigneeId),
    statusIdx: index("status_idx").on(table.status),
  }),
);

// 2. Repositório
// packages/db/src/repositories/task.ts
export const TaskRepository = {
  createList: async (data: NewTaskList) => {
    const [created] = await db.insert(taskList).values(data).returning();
    return created;
  },

  createTask: async (data: NewTask) => {
    const [created] = await db.insert(task).values(data).returning();
    return created;
  },

  getTasksByList: async (listId: string, status?: TaskStatus) => {
    const conditions = [eq(task.listId, listId)];
    if (status) conditions.push(eq(task.status, status));

    return db
      .select({
        task: task,
        assignee: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
      .from(task)
      .leftJoin(user, eq(task.assigneeId, user.id))
      .where(and(...conditions))
      .orderBy(
        sql`FIELD(${task.priority}, 'URGENT', 'HIGH', 'MEDIUM', 'LOW')`,
        task.createdAt,
      );
  },

  updateTaskStatus: async (taskId: string, status: TaskStatus) => {
    const updates: any = { status };
    if (status === "DONE") {
      updates.completedAt = new Date();
    }

    const [updated] = await db
      .update(task)
      .set(updates)
      .where(eq(task.id, taskId))
      .returning();

    return updated;
  },

  getTaskStats: async (teamId: string) => {
    return db
      .select({
        status: task.status,
        count: sql<number>`count(*)`,
      })
      .from(task)
      .innerJoin(taskList, eq(task.listId, taskList.id))
      .where(eq(taskList.teamId, teamId))
      .groupBy(task.status);
  },
};
```

### 12.2 Transações

```ts
export const TaskRepository = {
  moveTask: async (taskId: string, newListId: string) => {
    return db.transaction(async (tx) => {
      // Verificar se a lista existe
      const [list] = await tx
        .select()
        .from(taskList)
        .where(eq(taskList.id, newListId))
        .limit(1);

      if (!list) {
        throw new Error("Lista não encontrada");
      }

      // Mover tarefa
      const [moved] = await tx
        .update(task)
        .set({ listId: newListId })
        .where(eq(task.id, taskId))
        .returning();

      // Registrar no log
      await tx.insert(activityLog).values({
        action: "TASK_MOVED",
        entityId: taskId,
        metadata: { from: moved.listId, to: newListId },
      });

      return moved;
    });
  },
};
```

---

## 13. Comandos Úteis

```bash
# Desenvolvimento
pnpm db:push          # Aplica schemas ao banco
pnpm db:seed          # Popula com dados de teste
pnpm db:studio        # Interface visual do Drizzle
pnpm --filter @kdx/db create-schema <nome>  # Cria novo schema e repositório

# Produção
pnpm db:generate      # Gera arquivos de migração
pnpm db:migrate       # Aplica migrações
pnpm db:rollback      # Reverter última migração

# Manutenção
pnpm db:check         # Verifica integridade
pnpm db:optimize      # Otimiza tabelas
```

---

## 14. Troubleshooting

### Problemas Comuns

**1. "Column doesn't exist"**

```bash
# Solução: Aplicar schemas
pnpm db:push
```

**2. "Cannot add foreign key constraint"**

```ts
// Verificar ordem de criação das tabelas
// Tabela referenciada deve existir primeiro
```

**3. "Data truncated for column"**

```ts
// Aumentar tamanho do varchar
title: varchar("title", { length: 500 }); // Era 255
```

**4. Performance lenta**

```ts
// Adicionar índices apropriados
userIdIdx: index("user_id_idx").on(table.userId),
```

### Debug de Queries

```ts
// Habilitar logging
import { drizzle } from "drizzle-orm/mysql2";
import { createConnection } from "mysql2";

const connection = await createConnection({
  // ... config
});

export const db = drizzle(connection, {
  logger: true, // Mostra SQL no console
});
```

---

## Resumo de Boas Práticas

1. **Sempre use `createId()`** para gerar IDs
2. **Inclua `createdAt` e `updatedAt`** em todas as tabelas
3. **Use transações** para operações múltiplas
4. **Crie índices** para campos de busca frequente
5. **Valide com Zod** antes de inserir dados
6. **Use repositórios** para encapsular lógica
7. **Documente relações complexas** com comentários
8. **Teste migrações** em ambiente de desenvolvimento primeiro

Este guia fornece uma base sólida para trabalhar com banco de dados no Kodix, mantendo consistência e facilitando a manutenção do código.
