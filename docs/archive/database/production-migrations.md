# Migrations para Produção - Guia Completo

Este documento explica como gerenciar mudanças no banco de dados de forma segura em produção usando migrations com Drizzle ORM.

## 📋 Conceitos Importantes

### Push vs Migrate

| Comando        | Ambiente            | Uso                           | Riscos                        |
| -------------- | ------------------- | ----------------------------- | ----------------------------- |
| `pnpm push`    | **Desenvolvimento** | Aplica mudanças diretamente   | ⚠️ Pode causar perda de dados |
| `pnpm migrate` | **Produção**        | Aplica migrations versionadas | ✅ Controlado e reversível    |

### Quando Usar Cada Um

- **Development**: `push` para iteração rápida
- **Staging/Production**: `migrate` sempre

## 🚀 Processo de Migration

### 1. Desenvolvimento Local

#### Fazer Mudanças no Schema

```typescript
// packages/db/src/schema/users.ts
export const users = mysqlTable("users", {
  id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),

  // ✅ Nova coluna adicionada
  phone: varchar("phone", { length: 20 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
```

#### Testar Localmente com Push

```bash
# Aplicar mudanças diretamente (desenvolvimento apenas)
cd packages/db
pnpm push
```

### 2. Gerar Migration para Produção

```bash
# Gerar arquivo de migration
cd packages/db
pnpm with-env drizzle-kit generate
```

Isso criará um arquivo como:

```
packages/db/drizzle/
└── 0001_add_phone_to_users.sql
```

#### Conteúdo da Migration

```sql
-- 0001_add_phone_to_users.sql
ALTER TABLE `users` ADD `phone` varchar(20);
```

### 3. Revisar a Migration

**⚠️ SEMPRE REVISAR** antes de aplicar em produção:

```bash
# Ver o que será executado
cat packages/db/drizzle/0001_add_phone_to_users.sql
```

#### Verificações Importantes

- [ ] Mudanças estão corretas?
- [ ] Não há `DROP COLUMN` perigosos?
- [ ] Índices necessários estão incluídos?
- [ ] Performance impact aceitável?

### 4. Aplicar em Produção

```bash
# Aplicar migration em produção
cd packages/db
MYSQL_URL="mysql://user:pass@prod-host:3306/kodix_prod" pnpm with-env drizzle-kit migrate
```

## 📁 Estrutura de Migrations

### Diretório de Migrations

```
packages/db/
├── drizzle/
│   ├── meta/
│   │   ├── _journal.json      # Histórico de migrations
│   │   └── 0000_snapshot.json # Estado inicial
│   ├── 0000_initial.sql      # Migration inicial
│   ├── 0001_add_phone.sql    # Adicionar telefone
│   └── 0002_add_index.sql    # Adicionar índices
└── drizzle.config.ts
```

### Journal de Migrations

```json
// drizzle/meta/_journal.json
{
  "version": "6",
  "dialect": "mysql",
  "entries": [
    {
      "idx": 0,
      "version": "6",
      "when": 1704067200000,
      "tag": "0000_initial",
      "breakpoints": true
    },
    {
      "idx": 1,
      "version": "6",
      "when": 1704153600000,
      "tag": "0001_add_phone",
      "breakpoints": true
    }
  ]
}
```

## 🔄 Tipos de Mudanças

### ✅ Mudanças Seguras (Sem Perda de Dados)

#### Adicionar Colunas

```sql
-- Adicionar coluna opcional
ALTER TABLE `users` ADD `phone` varchar(20);

-- Adicionar coluna com default
ALTER TABLE `users` ADD `status` varchar(20) DEFAULT 'active' NOT NULL;
```

#### Adicionar Índices

```sql
-- Melhorar performance
CREATE INDEX `phone_idx` ON `users` (`phone`);
CREATE INDEX `status_created_idx` ON `users` (`status`, `created_at`);
```

#### Adicionar Tabelas

```sql
-- Nova funcionalidade
CREATE TABLE `user_preferences` (
  `id` varchar(30) NOT NULL,
  `user_id` varchar(30) NOT NULL,
  `theme` varchar(20) DEFAULT 'light',
  `language` varchar(10) DEFAULT 'pt-BR',
  PRIMARY KEY (`id`)
);
```

### ⚠️ Mudanças Perigosas (Podem Causar Perda)

#### Remover Colunas

```sql
-- ❌ PERIGOSO: Perda permanente de dados
ALTER TABLE `users` DROP COLUMN `old_field`;
```

**Processo Seguro:**

1. Deploy código que não usa a coluna
2. Aguardar tempo de rollback (24-48h)
3. Executar DROP em migration separada

#### Modificar Tipos

```sql
-- ❌ PERIGOSO: Pode truncar dados
ALTER TABLE `users` MODIFY `name` varchar(100);
```

**Processo Seguro:**

1. Criar nova coluna
2. Migrar dados com script
3. Atualizar código
4. Remover coluna antiga

#### Renomear Colunas

```sql
-- ❌ PERIGOSO: Quebra aplicações antigas
ALTER TABLE `users` RENAME COLUMN `name` TO `full_name`;
```

**Processo Seguro:**

1. Adicionar nova coluna
2. Sincronizar dados
3. Atualizar código
4. Remover coluna antiga

## 🛡️ Estratégias Seguras

### 1. Mudanças Backward Compatible

```typescript
// Passo 1: Adicionar nova coluna (opcional)
export const users = mysqlTable("users", {
  id: varchar("id", { length: 30 }).primaryKey(),
  name: varchar("name", { length: 255 }), // Manter existente
  fullName: varchar("full_name", { length: 255 }), // Adicionar nova
  email: varchar("email", { length: 255 }).notNull(),
});

// Passo 2: Atualizar código para usar ambas
// Passo 3: Migrar dados
// Passo 4: Remover coluna antiga
```

### 2. Feature Flags para Schema

```typescript
// Usar feature flags para mudanças grandes
const useNewUserSchema = process.env.NEW_USER_SCHEMA === "true";

export const userSchema = useNewUserSchema ? newUserTable : oldUserTable;
```

### 3. Migrations em Etapas

```bash
# Migration 1: Adicionar
0010_add_new_column.sql

# Migration 2: Migrar dados
0011_migrate_data.sql

# Migration 3: Atualizar aplicação
# (Deploy de código)

# Migration 4: Remover antigo
0012_remove_old_column.sql
```

## 🔧 Scripts de Migration

### Script de Backup Pré-Migration

```bash
#!/bin/bash
# scripts/backup-before-migration.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_pre_migration_${DATE}.sql"

echo "Creating backup: ${BACKUP_FILE}"
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_FILE

echo "Backup created successfully"
echo "To restore: mysql -h host -u user -p database < $BACKUP_FILE"
```

### Script de Migração de Dados

```typescript
// scripts/migrate-user-data.ts
import { db } from "../src/client";
import { users } from "../src/schema";

export async function migrateUserNames() {
  console.log("🔄 Migrating user names...");

  const usersToUpdate = await db
    .select()
    .from(users)
    .where(and(isNotNull(users.name), isNull(users.fullName)));

  for (const user of usersToUpdate) {
    await db
      .update(users)
      .set({
        fullName: user.name,
      })
      .where(eq(users.id, user.id));
  }

  console.log(`✅ Updated ${usersToUpdate.length} users`);
}

if (require.main === module) {
  migrateUserNames()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Migration failed:", error);
      process.exit(1);
    });
}
```

## 🚨 Rollback de Migrations

### Preparar Rollback

```sql
-- Sempre documentar como reverter
-- 0010_add_phone_column.sql

-- Forward migration
ALTER TABLE `users` ADD `phone` varchar(20);
CREATE INDEX `phone_idx` ON `users` (`phone`);

-- Rollback commands (documentar):
-- ALTER TABLE `users` DROP INDEX `phone_idx`;
-- ALTER TABLE `users` DROP COLUMN `phone`;
```

### Executar Rollback Manual

```bash
# 1. Backup atual
mysqldump -h $HOST -u $USER -p$PASS $DB > rollback_backup.sql

# 2. Executar comandos de rollback
mysql -h $HOST -u $USER -p$PASS $DB -e "
  ALTER TABLE users DROP INDEX phone_idx;
  ALTER TABLE users DROP COLUMN phone;
"

# 3. Atualizar journal manualmente
# Editar drizzle/meta/_journal.json removendo última entrada
```

### Rollback Automático

```typescript
// scripts/rollback.ts
import { db } from "../src/client";

export async function rollbackMigration(migrationId: string) {
  // Implementar lógica de rollback baseada no ID
  console.log(`Rolling back migration: ${migrationId}`);

  // Executar comandos de rollback específicos
  // Atualizar journal
}
```

## 🏗️ CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy with Migrations

on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: pnpm install

      - name: Backup Database
        run: |
          mysqldump -h ${{ secrets.DB_HOST }} \
                   -u ${{ secrets.DB_USER }} \
                   -p${{ secrets.DB_PASSWORD }} \
                   ${{ secrets.DB_NAME }} > backup.sql

      - name: Run Migrations
        env:
          MYSQL_URL: ${{ secrets.PRODUCTION_MYSQL_URL }}
        run: |
          cd packages/db
          pnpm with-env drizzle-kit migrate

      - name: Deploy Application
        # Deploy código apenas após migrations
        run: pnpm deploy
```

### Script de Deploy

```bash
#!/bin/bash
# scripts/deploy-with-migrations.sh

set -e

echo "🚀 Starting deployment with migrations..."

# 1. Backup
echo "📦 Creating backup..."
./scripts/backup-before-migration.sh

# 2. Run migrations
echo "🔄 Running migrations..."
cd packages/db
pnpm with-env drizzle-kit migrate

# 3. Deploy application
echo "🚢 Deploying application..."
pnpm build
pnpm deploy

echo "✅ Deployment completed successfully!"
```

## 📊 Monitoramento

### Verificar Status das Migrations

```sql
-- Ver migrations aplicadas
SELECT * FROM __drizzle_migrations ORDER BY id;

-- Verificar integridade
DESCRIBE users;
SHOW INDEX FROM users;
```

### Script de Verificação

```typescript
// scripts/verify-migrations.ts
import { db } from "../src/client";

export async function verifyMigrations() {
  try {
    // Verificar se tabelas críticas existem
    await db.execute(sql`DESCRIBE users`);
    await db.execute(sql`DESCRIBE teams`);
    await db.execute(sql`DESCRIBE ai_provider`);

    console.log("✅ All critical tables exist");

    // Verificar dados críticos
    const userCount = await db.$count(users);
    const teamCount = await db.$count(teams);

    console.log(`📊 Users: ${userCount}, Teams: ${teamCount}`);

    return true;
  } catch (error) {
    console.error("❌ Migration verification failed:", error);
    return false;
  }
}
```

## 🎯 Melhores Práticas

### ✅ Faça Sempre

1. **Backup antes** de qualquer migration em produção
2. **Teste migrations** em staging primeiro
3. **Revise SQL** gerado antes de aplicar
4. **Documente rollback** para cada migration
5. **Use transactions** para mudanças atômicas
6. **Monitor performance** durante aplicação

### ❌ Nunca Faça

1. **Aplicar push** diretamente em produção
2. **Modificar migrations** já aplicadas
3. **Fazer mudanças breaking** sem processo gradual
4. **Pular backup** em produção
5. **Aplicar migrations** durante pico de tráfego

### 📋 Checklist de Migration

#### Antes de Aplicar

- [ ] Migration testada em desenvolvimento
- [ ] Migration testada em staging
- [ ] Backup da produção realizado
- [ ] Plano de rollback documentado
- [ ] Equipe notificada sobre janela de manutenção
- [ ] Monitoramento ativo

#### Durante Aplicação

- [ ] Aplicar em horário de baixo tráfego
- [ ] Monitorar performance do banco
- [ ] Verificar logs de erro
- [ ] Testar funcionalidades críticas

#### Após Aplicação

- [ ] Verificar integridade dos dados
- [ ] Testar aplicação completamente
- [ ] Monitorar métricas por 24h
- [ ] Manter backup por período de rollback

## 🛠️ Comandos Essenciais

```bash
# Gerar nova migration
cd packages/db && pnpm with-env drizzle-kit generate

# Aplicar migrations
cd packages/db && pnpm with-env drizzle-kit migrate

# Ver status das migrations
cd packages/db && pnpm with-env drizzle-kit status

# Verificar diferenças
cd packages/db && pnpm with-env drizzle-kit check

# Backup antes de migration
mysqldump -h host -u user -p database > backup_$(date +%Y%m%d_%H%M%S).sql

# Aplicar migration específica (se suportado)
cd packages/db && pnpm with-env drizzle-kit migrate --to 0010

# Ver história de migrations
mysql -h host -u user -p -e "SELECT * FROM __drizzle_migrations ORDER BY id;"
```

## 🚨 Cenários de Emergência

### Migration Falha Parcialmente

1. **Não entrar em pânico**
2. **Verificar logs** para entender o erro
3. **Avaliar estado** do banco
4. **Decidir**: continuar correção ou rollback
5. **Executar ação** escolhida
6. **Verificar integridade** após correção

### Rollback de Emergência

```bash
# 1. Parar aplicação
pm2 stop kodix-app

# 2. Restaurar backup
mysql -h host -u user -p database < backup_before_migration.sql

# 3. Verificar integridade
mysql -h host -u user -p -e "SELECT COUNT(*) FROM users;"

# 4. Reiniciar aplicação com versão anterior
git checkout previous-working-commit
pm2 start kodix-app
```

**🎯 Lembre-se: Migrations são uma responsabilidade crítica. Sempre priorize segurança sobre velocidade em produção!**
