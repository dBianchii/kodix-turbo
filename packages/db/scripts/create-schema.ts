#!/usr/bin/env tsx

/**
 * Script para criar novos schemas de banco de dados seguindo os padrões do Kodix
 *
 * Uso: pnpm tsx packages/db/scripts/create-schema.ts <nome-do-schema> [--app]
 *
 * Exemplos:
 *   pnpm tsx packages/db/scripts/create-schema.ts note --app
 *   pnpm tsx packages/db/scripts/create-schema.ts userSettings
 */
import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
const schemaName = args[0];
const isApp = args.includes("--app");

if (!schemaName) {
  console.error("❌ Por favor, forneça o nome do schema");
  console.log(
    "Uso: pnpm tsx packages/db/scripts/create-schema.ts <nome-do-schema> [--app]",
  );
  process.exit(1);
}

// Converter para camelCase
const camelCase = schemaName.charAt(0).toLowerCase() + schemaName.slice(1);
const PascalCase = schemaName.charAt(0).toUpperCase() + schemaName.slice(1);

// Determinar o diretório baseado no tipo
const baseDir = path.join(__dirname, "..", "src", "schema");
const targetDir = isApp ? path.join(baseDir, "apps") : baseDir;
const schemaFile = path.join(targetDir, `${camelCase}.ts`);

// Template do schema
const schemaTemplate = `import { boolean, index, mysqlTable, timestamp, varchar, text, int } from "drizzle-orm/mysql-core";

import { createId } from "${isApp ? "../" : "./"}utils";
${!isApp ? 'import { user } from "./user";\nimport { team } from "./team";' : ""}

export const ${camelCase} = mysqlTable("${camelCase}", {
  // IDs sempre primeiro
  id: varchar("id", { length: 30 })
    .primaryKey()
    .$defaultFn(createId),
  
  // Foreign keys
  ${
    isApp
      ? `userId: varchar("userId", { length: 30 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  teamId: varchar("teamId", { length: 30 })
    .references(() => team.id, { onDelete: "set null" }),`
      : "// Adicione foreign keys aqui se necessário"
  }
  
  // Campos de dados
  name: varchar("name", { length: 255 })
    .notNull(),
  description: text("description"),
  isActive: boolean("isActive")
    .default(true)
    .notNull(),
  
  // Timestamps sempre por último
  createdAt: timestamp("createdAt")
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .onUpdateNow()
    .notNull(),
}, (table) => ({
  // Índices
  ${isApp ? `userIdIdx: index("user_id_idx").on(table.userId),` : "// Adicione índices aqui"}
}));

// Tipos inferidos
export type ${PascalCase} = typeof ${camelCase}.$inferSelect;
export type New${PascalCase} = typeof ${camelCase}.$inferInsert;
`;

// Template do repositório
const repositoryTemplate = `import { eq, desc, and } from "drizzle-orm";
import { db } from "../client";
import { ${camelCase} } from "../schema${isApp ? "/apps" : ""}/${camelCase}";
import type { ${PascalCase}, New${PascalCase} } from "../schema${isApp ? "/apps" : ""}/${camelCase}";

export const ${PascalCase}Repository = {
  // CREATE
  create: async (data: Omit<New${PascalCase}, "id" | "createdAt" | "updatedAt">) => {
    const [created] = await db
      .insert(${camelCase})
      .values(data)
      .returning();
    return created;
  },

  // READ
  findById: async (id: string) => {
    const [found] = await db
      .select()
      .from(${camelCase})
      .where(eq(${camelCase}.id, id))
      .limit(1);
    return found;
  },

  findAll: async (options?: { 
    limit?: number;
    offset?: number;
  }) => {
    return db
      .select()
      .from(${camelCase})
      .orderBy(desc(${camelCase}.createdAt))
      .limit(options?.limit ?? 50)
      .offset(options?.offset ?? 0);
  },

  // UPDATE
  update: async (id: string, data: Partial<Omit<${PascalCase}, "id" | "createdAt">>) => {
    const [updated] = await db
      .update(${camelCase})
      .set(data)
      .where(eq(${camelCase}.id, id))
      .returning();
    return updated;
  },

  // DELETE
  delete: async (id: string) => {
    await db
      .delete(${camelCase})
      .where(eq(${camelCase}.id, id));
  },
};
`;

// Criar arquivos
try {
  // Criar schema
  if (fs.existsSync(schemaFile)) {
    console.error(`❌ Schema ${camelCase}.ts já existe em ${targetDir}`);
    process.exit(1);
  }

  fs.writeFileSync(schemaFile, schemaTemplate);
  console.log(`✅ Schema criado: ${schemaFile}`);

  // Criar repositório
  const repositoryDir = path.join(__dirname, "..", "src", "repositories");
  const repositoryFile = path.join(repositoryDir, `${camelCase}.ts`);

  if (!fs.existsSync(repositoryDir)) {
    fs.mkdirSync(repositoryDir, { recursive: true });
  }

  fs.writeFileSync(repositoryFile, repositoryTemplate);
  console.log(`✅ Repositório criado: ${repositoryFile}`);

  // Instruções finais
  console.log("\n📝 Próximos passos:");
  console.log(
    `1. Adicione "export * from "./${camelCase}";" em ${isApp ? "packages/db/src/schema/apps/index.ts" : "packages/db/src/schema/index.ts"}`,
  );
  console.log(
    `2. Adicione "export * from "./${camelCase}";" em packages/db/src/repositories/index.ts`,
  );
  console.log("3. Ajuste os campos do schema conforme sua necessidade");
  console.log('4. Execute "pnpm db:push" para aplicar as mudanças ao banco');

  if (isApp) {
    console.log(
      `\n💡 Dica: Para SubApps, lembre-se de registrar o ID em packages/shared/src/db.ts`,
    );
  }
} catch (error) {
  console.error("❌ Erro ao criar arquivos:", error);
  process.exit(1);
}
