# Workflow de Desenvolvimento - Drizzle ORM

Este documento explica como trabalhar eficientemente com o banco de dados durante o desenvolvimento, incluindo trabalho em branches, colaboração em equipe e boas práticas para iteração rápida.

## 🎯 Conceitos Fundamentais

### Push vs Generate/Migrate no Desenvolvimento

| Comando         | Quando Usar                | O que Faz                     | Onde Fica                |
| --------------- | -------------------------- | ----------------------------- | ------------------------ |
| `pnpm push`     | **Desenvolvimento diário** | Aplica mudanças diretamente   | ❌ Não armazenado        |
| `pnpm generate` | **Antes do merge**         | Gera arquivo de migration     | ✅ Arquivo versionado    |
| `pnpm migrate`  | **Produção/Staging**       | Aplica migrations versionadas | ✅ Histórico persistente |

### O que Acontece com Mini Mudanças

```bash
# Durante desenvolvimento em um branch
git checkout feature/user-profile

# Mudança 1: Adicionar telefone
# schema: + phone: varchar("phone", { length: 20 })
pnpm push  # ✅ Aplicado no banco local
           # ❌ Não gera arquivo de migration

# Mudança 2: Adicionar endereço
# schema: + address: text("address")
pnpm push  # ✅ Aplicado no banco local
           # ❌ Não gera arquivo de migration

# Mudança 3: Adicionar índice
# schema: índice no telefone
pnpm push  # ✅ Aplicado no banco local
           # ❌ Não gera arquivo de migration
```

**Resultado:** As mudanças intermediárias **não ficam armazenadas em lugar algum**!

## 📍 Onde Ficam as Informações

### 1. Estado Atual do Banco

```sql
-- Banco MySQL local reflete APENAS o estado final
DESCRIBE users;
/*
+--------+--------------+------+-----+---------+
| Field  | Type         | Null | Key | Default |
+--------+--------------+------+-----+---------+
| phone  | varchar(20)  | YES  |     | NULL    |
| address| text         | YES  |     | NULL    |
+--------+--------------+------+-----+---------+
*/
```

### 2. Schema no Código

```typescript
// packages/db/src/schema/users.ts
// Sempre representa o estado "final" desejado
export const users = mysqlTable("users", {
  id: varchar("id", { length: 30 }).primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }), // Mini mudança 1
  address: text("address"), // Mini mudança 2
  // ... sem histórico de QUANDO cada um foi adicionado
});
```

### 3. Histórico do Git

```bash
# Git mantém histórico das mudanças no arquivo de schema
git log --oneline packages/db/src/schema/users.ts

abc123 feat: add user address field
def456 feat: add phone number to users
789xyz feat: enhance user profile structure
```

## 🔄 Workflow Recomendado

### Durante Desenvolvimento (Branch)

```bash
# 1. Criar branch para feature
git checkout -b feature/user-enhancements

# 2. Fazer mudanças iterativas no schema
# Edit: packages/db/src/schema/users.ts
cd packages/db
pnpm push  # Mudança 1

# 3. Testar funcionalidade
npm run dev
# Testar no app...

# 4. Mais mudanças conforme necessário
# Edit: packages/db/src/schema/users.ts
pnpm push  # Mudança 2

# 5. Continuar iterando...
```

### Antes de Merge/PR

```bash
# 6. Gerar migration final (contém TODAS as mudanças do branch)
cd packages/db
pnpm with-env drizzle-kit generate

# 7. Revisar SQL gerado
cat drizzle/0010_user_enhancements.sql
/*
-- Migration gerada contém TUDO:
ALTER TABLE `users` ADD `phone` varchar(20);
ALTER TABLE `users` ADD `address` text;
CREATE INDEX `phone_idx` ON `users` (`phone`);
*/

# 8. Commitar migration
git add drizzle/
git commit -m "feat: generate migration for user enhancements"

# 9. Criar PR
```

### Após Merge

```bash
# 10. Em staging/produção
cd packages/db
pnpm with-env drizzle-kit migrate  # Aplica migration versionada
```

## 🤝 Colaboração em Equipe

### Problema: Sincronização de Branches

```bash
# Situação comum:
# Dev A trabalha em feature/user-profile (adiciona phone)
# Dev B trabalha em feature/user-roles (adiciona role)
# Ambos fazem push em seus bancos locais
# Quando Dev B puxa branch do Dev A...
```

### Solução: Reset e Sincronização

```bash
# Ao trocar para branch com mudanças de schema
git checkout feature/other-developer-branch

# 🔄 Script de sincronização
./scripts/sync-branch-schema.sh
```

#### Script de Sincronização

```bash
#!/bin/bash
# scripts/sync-branch-schema.sh

echo "🔄 Sincronizando schema do branch atual..."

# Parar aplicação se estiver rodando
echo "⏹️ Parando aplicação..."
pkill -f "npm.*dev" || true

# Reset completo do banco de dev
echo "🗑️ Resetando banco..."
cd packages/db-dev
docker-compose down -v
docker-compose up -d mysql

# Aguardar MySQL inicializar
echo "⏳ Aguardando MySQL..."
cd ../db
pnpm wait-for-db

# Aplicar schema do branch atual
echo "📄 Aplicando schema..."
pnpm push

# Aplicar seeds
echo "🌱 Aplicando seeds..."
pnpm seed

echo "✅ Banco sincronizado com o branch atual!"
echo "🚀 Pode reiniciar o desenvolvimento"
```

### Adicionando ao package.json

```json
{
  "scripts": {
    "db:sync": "./scripts/sync-branch-schema.sh",
    "db:reset": "cd packages/db-dev && docker-compose down -v && docker-compose up -d mysql"
  }
}
```

## ⚠️ Problemas Comuns e Soluções

### 1. Erro ao Fazer Push em Branch Antigo

```bash
# Problema: Branch tem mudanças que o banco local não tem
Error: Column 'new_field' doesn't exist

# Solução: Sincronizar antes de continuar
pnpm run db:sync
```

### 2. Conflitos de Schema Entre Branches

```bash
# Problema: Dois branches modificam a mesma tabela diferentemente
git checkout main
git pull origin main
git checkout feature/my-branch
git merge main  # Conflito no schema

# Solução: Resolver conflito no arquivo de schema
# Edit: packages/db/src/schema/users.ts
# Resolver conflitos manualmente
git add .
git commit -m "resolve: merge conflicts in user schema"

# Sincronizar banco com estado resolvido
pnpm run db:sync
```

### 3. Performance Lenta do Push

```bash
# Problema: Push demora muito em bases grandes
# Solução: Usar banco de dev menor

# Criar seed mínimo para desenvolvimento
pnpm db:seed:minimal
```

## 🛠️ Scripts Úteis para Desenvolvimento

### Verificar Estado do Schema

```bash
#!/bin/bash
# scripts/check-schema-status.sh

echo "📊 Status do Schema de Desenvolvimento"
echo "====================================="

# Verificar diferenças entre schema e banco
cd packages/db
echo "🔍 Verificando diferenças..."
pnpm with-env drizzle-kit check

# Mostrar estrutura das tabelas principais
echo ""
echo "📋 Estrutura das tabelas principais:"
mysql -h localhost -u root -p kodix -e "
  SELECT
    TABLE_NAME as Tabela,
    TABLE_ROWS as Registros,
    round(((data_length + index_length) / 1024 / 1024), 2) as TamanhoMB
  FROM information_schema.tables
  WHERE table_schema = 'kodix'
  ORDER BY table_rows DESC;
"
```

### Backup Rápido para Experimentos

```bash
#!/bin/bash
# scripts/quick-backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="dev_backup_${DATE}.sql"

echo "📦 Criando backup rápido: ${BACKUP_FILE}"
mysqldump -h localhost -u root -p kodix > "backups/${BACKUP_FILE}"

echo "✅ Backup criado em backups/${BACKUP_FILE}"
echo "🔄 Para restaurar: mysql -h localhost -u root -p kodix < backups/${BACKUP_FILE}"
```

### Restaurar Backup

```bash
#!/bin/bash
# scripts/restore-backup.sh

if [ -z "$1" ]; then
  echo "❌ Uso: ./restore-backup.sh <arquivo_backup>"
  echo "📁 Backups disponíveis:"
  ls -la backups/*.sql | tail -5
  exit 1
fi

echo "🔄 Restaurando backup: $1"
mysql -h localhost -u root -p kodix < "backups/$1"
echo "✅ Backup restaurado!"
```

## 📋 Checklist Diário de Desenvolvimento

### Ao Começar o Dia

- [ ] `git pull origin main` - Atualizar branch principal
- [ ] `git checkout my-feature-branch` - Voltar ao seu branch
- [ ] `pnpm run db:sync` - Sincronizar schema se necessário
- [ ] Verificar se aplicação inicia: `npm run dev`

### Durante Desenvolvimento

- [ ] Fazer mudanças incrementais no schema
- [ ] `pnpm push` após cada mudança significativa
- [ ] Testar funcionalidade antes de continuar
- [ ] Commitar mudanças do schema: `git add` + `git commit`

### Antes de Fazer PR

- [ ] `pnpm with-env drizzle-kit generate` - Gerar migration
- [ ] Revisar SQL gerado antes de commitar
- [ ] `git add drizzle/` - Commitar migration
- [ ] Testar migration em ambiente limpo
- [ ] Documentar breaking changes se houver

### Ao Trocar de Branch

- [ ] Commitar mudanças atuais
- [ ] `git checkout other-branch`
- [ ] `pnpm run db:sync` se branch tem mudanças de schema
- [ ] Verificar se aplicação funciona no novo contexto

## 🎯 Dicas de Produtividade

### 1. Aliases Úteis

```bash
# ~/.bashrc ou ~/.zshrc
alias db-push="cd packages/db && pnpm push"
alias db-studio="cd packages/db && pnpm studio"
alias db-sync="pnpm run db:sync"
alias db-status="cd packages/db && pnpm with-env drizzle-kit check"
```

### 2. VS Code Tasks

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "DB: Push Schema",
      "type": "shell",
      "command": "cd packages/db && pnpm push",
      "group": "build"
    },
    {
      "label": "DB: Sync Branch",
      "type": "shell",
      "command": "pnpm run db:sync",
      "group": "build"
    },
    {
      "label": "DB: Generate Migration",
      "type": "shell",
      "command": "cd packages/db && pnpm with-env drizzle-kit generate",
      "group": "build"
    }
  ]
}
```

### 3. Git Hooks

```bash
#!/bin/sh
# .git/hooks/post-checkout

# Auto-sync schema ao trocar para branch com mudanças de DB
CHANGED_FILES=$(git diff --name-only HEAD@{1} HEAD)

if echo "$CHANGED_FILES" | grep -q "packages/db/src/schema"; then
  echo "🔄 Schema changes detected, consider running: pnpm run db:sync"
fi
```

## 🚨 Troubleshooting

### "Column doesn't exist" ao fazer Push

```bash
# Problema: Banco local não tem coluna que o schema espera
# Causa: Branch foi trocado sem sincronizar

# Solução 1: Sincronizar
pnpm run db:sync

# Solução 2: Reset manual
cd packages/db-dev
docker-compose down -v
docker-compose up -d mysql
cd ../db
pnpm wait-for-db
pnpm push
pnpm seed
```

### "Table already exists" ao fazer Push

```bash
# Problema: Schema tem tabela que já existe no banco
# Causa: Conflito entre estado do banco e schema

# Solução: Verificar diferenças
pnpm with-env drizzle-kit check

# Se necessário, reset completo
pnpm run db:sync
```

### Push Muito Lento

```bash
# Problema: Push demora muito
# Causa: Banco tem muitos dados de desenvolvimento

# Solução: Usar seed mínimo
cd packages/db
pnpm run db:reset
pnpm wait-for-db
pnpm push
# Não aplicar seed completo, apenas dados essenciais
```

## 📚 Comandos de Referência Rápida

```bash
# Desenvolvimento diário
pnpm run db:push          # Aplicar mudanças do schema
pnpm run db:studio        # Abrir interface visual
pnpm run db:sync          # Sincronizar com branch atual

# Verificação
pnpm run db:status        # Ver diferenças schema vs banco
pnpm run db:check         # Alias para status

# Backup/Restore (desenvolvimento)
./scripts/quick-backup.sh
./scripts/restore-backup.sh backup_file.sql

# Preparar para produção
cd packages/db && pnpm with-env drizzle-kit generate

# Reset completo
pnpm run db:reset && pnpm run db:sync
```

## 🎯 Resumo das Melhores Práticas

### ✅ Faça Sempre

1. **Sincronize** ao trocar branches com mudanças de schema
2. **Teste** cada mudança antes de continuar
3. **Comite** mudanças de schema regularmente
4. **Gere migration** antes de fazer PR
5. **Documente** mudanças breaking

### ❌ Evite

1. **Trabalhar** em banco desatualizado por muito tempo
2. **Fazer** mudanças breaking sem avisar a equipe
3. **Commitar** schema sem testar
4. **Gerar** múltiplas migrations para mesma feature
5. **Ignorar** erros de push

### 💡 Lembre-se

- `push` é para **iteração rápida** em desenvolvimento
- `generate` é para **versionamento** antes de produção
- **Estado intermediário não é salvo** - só o final
- **Colaboração requer sincronização** consciente
- **Git mantém histórico** do schema, não das mudanças de banco

**🚀 Com esse workflow, você pode desenvolver rapidamente mantendo a equipe sincronizada!**
