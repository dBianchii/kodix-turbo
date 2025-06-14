# Banco de Dados - Projeto Kodix

## Visão Geral

O projeto Kodix utiliza MySQL como banco de dados principal, gerenciado através do Drizzle ORM. Esta documentação detalha a estrutura, relacionamentos e práticas recomendadas para o banco de dados.

## Configuração

### Variáveis de Ambiente

```env
# Banco de dados
DATABASE_URL="mysql://usuario:senha@localhost:3306/kodix_db"

# Para desenvolvimento local
MYSQL_USER=kodix_user
MYSQL_PASSWORD=sua_senha
MYSQL_DATABASE=kodix_dev
MYSQL_ROOT_PASSWORD=root_password

# Para testes
DATABASE_URL_TEST="mysql://usuario:senha@localhost:3306/kodix_test"
```

### Setup Local com Docker

```yaml
# docker-compose.yml
version: "3.8"
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

## Estrutura do Schema

### Configuração Base

```typescript
// packages/db/src/schema/utils.ts
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 30);

export const createId = () => nanoid();
```

### Modelos de Autenticação

#### Users (Usuários)

```typescript
// packages/db/src/schema/auth/users.ts
import {
  boolean,
  index,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

import { createId } from "../utils";

export const users = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: timestamp("email_verified"),
    image: varchar("image", { length: 255 }),
    role: varchar("role", { length: 50 }).default("USER").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
    roleIdx: index("role_idx").on(table.role),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
  }),
);

export const accounts = mysqlTable(
  "accounts",
  {
    id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
    userId: varchar("user_id", { length: 30 }).notNull(),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refreshToken: varchar("refresh_token", { length: 255 }),
    accessToken: varchar("access_token", { length: 255 }),
    expiresAt: timestamp("expires_at"),
    tokenType: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    idToken: varchar("id_token", { length: 255 }),
    sessionState: varchar("session_state", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdx: index("user_idx").on(table.userId),
    providerIdx: index("provider_idx").on(table.provider),
  }),
);

export const sessions = mysqlTable(
  "sessions",
  {
    id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
    sessionToken: varchar("session_token", { length: 255 }).notNull(),
    userId: varchar("user_id", { length: 30 }).notNull(),
    expires: timestamp("expires").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    sessionTokenIdx: index("session_token_idx").on(table.sessionToken),
    userIdx: index("user_idx").on(table.userId),
  }),
);
```

### Modelos de Aplicação

#### Teams (Equipes)

```typescript
// packages/db/src/schema/app/teams.ts
import {
  boolean,
  index,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

import { createId } from "../utils";

export const teams = mysqlTable(
  "teams",
  {
    id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description"),
    image: varchar("image", { length: 255 }),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),

    // Chaves estrangeiras
    ownerId: varchar("owner_id", { length: 30 }).notNull(),
  },
  (table) => ({
    slugIdx: index("slug_idx").on(table.slug),
    ownerIdx: index("owner_idx").on(table.ownerId),
    activeIdx: index("active_idx").on(table.active),
    nameIdx: index("name_idx").on(table.name),
  }),
);

export const teamMembers = mysqlTable(
  "team_members",
  {
    id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
    teamId: varchar("team_id", { length: 30 }).notNull(),
    userId: varchar("user_id", { length: 30 }).notNull(),
    role: varchar("role", { length: 50 }).default("MEMBER").notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => ({
    teamIdx: index("team_idx").on(table.teamId),
    userIdx: index("user_idx").on(table.userId),
    roleIdx: index("role_idx").on(table.role),
    uniqueTeamUser: index("unique_team_user").on(table.teamId, table.userId),
  }),
);
```

#### Patients (Pacientes)

```typescript
// packages/db/src/schema/app/patients.ts
import {
  date,
  index,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

import { createId } from "../utils";

export const patients = mysqlTable(
  "patients",
  {
    id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    cpf: varchar("cpf", { length: 14 }),
    dateOfBirth: date("date_of_birth"),
    gender: varchar("gender", { length: 20 }),
    address: text("address"),
    emergencyContact: varchar("emergency_contact", { length: 255 }),
    medicalHistory: text("medical_history"),
    allergies: text("allergies"),
    medications: text("medications"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),

    // Chaves estrangeiras
    createdById: varchar("created_by_id", { length: 30 }).notNull(),
    teamId: varchar("team_id", { length: 30 }).notNull(),
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
    cpfIdx: index("cpf_idx").on(table.cpf),
    phoneIdx: index("phone_idx").on(table.phone),
    createdByIdx: index("created_by_idx").on(table.createdById),
    teamIdx: index("team_idx").on(table.teamId),
    nameIdx: index("name_idx").on(table.name),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
  }),
);
```

#### Appointments (Consultas)

```typescript
// packages/db/src/schema/app/appointments.ts
import {
  datetime,
  index,
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

import { createId } from "../utils";

export const appointments = mysqlTable(
  "appointments",
  {
    id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
    dateTime: datetime("date_time").notNull(),
    duration: int("duration").default(30).notNull(), // em minutos
    status: varchar("status", { length: 50 }).default("SCHEDULED").notNull(),
    type: varchar("type", { length: 50 }).default("CONSULTATION").notNull(),
    notes: text("notes"),
    symptoms: text("symptoms"),
    diagnosis: text("diagnosis"),
    treatment: text("treatment"),
    followUpDate: datetime("follow_up_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),

    // Chaves estrangeiras
    patientId: varchar("patient_id", { length: 30 }).notNull(),
    doctorId: varchar("doctor_id", { length: 30 }).notNull(),
    teamId: varchar("team_id", { length: 30 }).notNull(),
  },
  (table) => ({
    patientIdx: index("patient_idx").on(table.patientId),
    doctorIdx: index("doctor_idx").on(table.doctorId),
    teamIdx: index("team_idx").on(table.teamId),
    statusIdx: index("status_idx").on(table.status),
    typeIdx: index("type_idx").on(table.type),
    dateTimeIdx: index("date_time_idx").on(table.dateTime),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
  }),
);
```

### Definir Relacionamentos

```typescript
// packages/db/src/schema/app/relations.ts
import { relations } from "drizzle-orm";

import { users } from "../auth";
import { appointments, patients, teamMembers, teams } from "./index";

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  ownedTeams: many(teams),
  teamMemberships: many(teamMembers),
  createdPatients: many(patients),
  appointments: many(appointments),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  owner: one(users, {
    fields: [teams.ownerId],
    references: [users.id],
  }),
  members: many(teamMembers),
  patients: many(patients),
  appointments: many(appointments),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [patients.createdById],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [patients.teamId],
    references: [teams.id],
  }),
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  doctor: one(users, {
    fields: [appointments.doctorId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [appointments.teamId],
    references: [teams.id],
  }),
}));
```

### Exportar Schemas

```typescript
// packages/db/src/schema/index.ts
export * from "./auth";
export * from "./app";
export * from "./utils";
```

## Configuração do Cliente

```typescript
// packages/db/src/client.ts
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import * as schema from "./schema";

const connection = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export const db = drizzle(connection, { schema, mode: "default" });
```

## Comandos de Desenvolvimento

### Comandos Drizzle

```bash
# Aplicar mudanças do schema em desenvolvimento
pnpm db:push

# Gerar migration para produção
pnpm db:generate

# Aplicar migrations em produção
pnpm db:migrate

# Visualizar e editar dados
pnpm db:studio

# Reset do banco (cuidado!)
pnpm db:reset

# Executar seeds
pnpm db:seed
```

### Scripts no package.json

```json
{
  "scripts": {
    "db:push": "drizzle-kit push:mysql",
    "db:studio": "drizzle-kit studio",
    "db:generate": "drizzle-kit generate:mysql",
    "db:migrate": "drizzle-kit migrate",
    "db:seed": "tsx src/seed/index.ts",
    "db:reset": "tsx src/seed/reset.ts"
  }
}
```

## Seeds e Dados Iniciais

```typescript
// packages/db/src/seed/index.ts
import { eq } from "drizzle-orm";

import { db } from "../client";
import { teamMembers, teams, users } from "../schema";

export async function runSeed() {
  try {
    console.log("🌱 Iniciando seeds...");

    // Criar usuário admin
    const [admin] = await db
      .insert(users)
      .values({
        name: "Administrador",
        email: "admin@kodix.com",
        role: "ADMIN",
      })
      .onDuplicateKeyUpdate({
        set: { name: "Administrador" },
      })
      .returning();

    console.log("✅ Usuário admin criado");

    // Criar equipe exemplo
    const [team] = await db
      .insert(teams)
      .values({
        name: "Clínica Exemplo",
        slug: "clinica-exemplo",
        description: "Equipe de exemplo para desenvolvimento",
        ownerId: admin.id,
      })
      .onDuplicateKeyUpdate({
        set: { name: "Clínica Exemplo" },
      })
      .returning();

    console.log("✅ Equipe exemplo criada");

    // Adicionar admin à equipe
    await db
      .insert(teamMembers)
      .values({
        teamId: team.id,
        userId: admin.id,
        role: "OWNER",
      })
      .onDuplicateKeyUpdate({
        set: { role: "OWNER" },
      });

    console.log("✅ Admin adicionado à equipe");

    // Seeds específicos para desenvolvimento
    if (process.env.NODE_ENV === "development") {
      await seedDevelopmentData(admin.id, team.id);
    }

    console.log("🎉 Seeds executados com sucesso!");
  } catch (error) {
    console.error("❌ Erro durante execução dos seeds:", error);
    process.exit(1);
  }
}

async function seedDevelopmentData(adminId: string, teamId: string) {
  // Importar e executar seeds específicos
  const { seedPatients } = await import("./patients");
  const { seedAppointments } = await import("./appointments");

  await seedPatients(adminId, teamId);
  await seedAppointments(adminId, teamId);
}

if (require.main === module) {
  runSeed();
}
```

## Práticas Recomendadas

### Performance

1. **Índices Estratégicos**

```typescript
// Sempre indexar:
// - Chaves estrangeiras
// - Campos de busca frequente
// - Campos de ordenação
// - Campos de filtro

export const examples = mysqlTable(
  "examples",
  {
    // ... campos
  },
  (table) => ({
    // Índices essenciais
    foreignKeyIdx: index("fk_idx").on(table.foreignKey),
    searchFieldIdx: index("search_idx").on(table.searchField),
    statusIdx: index("status_idx").on(table.status),
    createdAtIdx: index("created_at_idx").on(table.createdAt),

    // Índices compostos para queries complexas
    compositeIdx: index("composite_idx").on(
      table.teamId,
      table.status,
      table.createdAt,
    ),
  }),
);
```

2. **Paginação Eficiente**

```typescript
// Use offset/limit para pequenos datasets
const results = await db
  .select()
  .from(patients)
  .limit(20)
  .offset(page * 20);

// Use cursor-based pagination para grandes datasets
const results = await db
  .select()
  .from(patients)
  .where(gt(patients.createdAt, cursor))
  .limit(20)
  .orderBy(asc(patients.createdAt));
```

3. **Seleção Otimizada**

```typescript
// Evite SELECT *
const patients = await db
  .select({
    id: patients.id,
    name: patients.name,
    email: patients.email,
  })
  .from(patients);

// Use relacionamentos apenas quando necessário
const patientsWithTeam = await db.query.patients.findMany({
  columns: {
    id: true,
    name: true,
  },
  with: {
    team: {
      columns: {
        name: true,
      },
    },
  },
});
```

### Segurança

1. **Validação de Dados**

```typescript
import { z } from "zod";

export const patientSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email().optional(),
  phone: z
    .string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .optional(),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    .optional(),
});
```

2. **Controle de Acesso**

```typescript
// Sempre filtrar por teamId para isolamento de dados
const userPatients = await db
  .select()
  .from(patients)
  .where(
    and(eq(patients.teamId, user.activeTeamId), eq(patients.active, true)),
  );
```

### Backup e Recuperação

```bash
# Backup completo
mysqldump -h localhost -u user -p database_name > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup apenas estrutura
mysqldump -h localhost -u user -p --no-data database_name > schema_backup.sql

# Backup apenas dados
mysqldump -h localhost -u user -p --no-create-info database_name > data_backup.sql

# Restauração
mysql -h localhost -u user -p database_name < backup_file.sql
```

## Monitoramento

### Configuração de Logs

```typescript
// packages/db/src/client.ts
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const connection = mysql.createPool({
  // ... configurações
});

export const db = drizzle(connection, {
  schema,
  mode: "default",
  logger: process.env.NODE_ENV === "development",
});

// Log de queries lentas
if (process.env.NODE_ENV !== "production") {
  const originalQuery = db.execute;
  db.execute = async function (...args) {
    const start = Date.now();
    const result = await originalQuery.apply(this, args);
    const duration = Date.now() - start;

    if (duration > 1000) {
      // Queries > 1s
      console.warn(`🐌 Query lenta (${duration}ms):`, args[0]);
    }

    return result;
  };
}
```

### Métricas Importantes

- Tempo de resposta das queries
- Conexões ativas no pool
- Tamanho das tabelas
- Uso de índices
- Queries mais frequentes

### Health Check

```typescript
// packages/db/src/health.ts
export async function checkDatabaseHealth() {
  try {
    const start = Date.now();
    await db.execute(sql`SELECT 1`);
    const responseTime = Date.now() - start;

    return {
      status: "healthy",
      responseTime,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}
```

## Estrutura de Arquivos
