# 🗄️ Database Scripts - Kodix

Scripts para gerenciamento do banco de dados MySQL.

## 🔧 **Configuração de Ambiente**

### ⚠️ **Importante: Localização do .env**

Os scripts deste diretório **NÃO carregam automaticamente** o arquivo `.env`.

- 📂 **Arquivo .env**: Localizado na **raiz do monorepo** (`../../.env`)
- 🔗 **Variável do banco**: `MYSQL_URL` (não `DATABASE_URL`)

### 🛠️ **Como Executar Scripts**

**✅ Opção 1: Do root do projeto (Recomendado)**

```bash
cd /path/to/kodix-turbo
npx tsx packages/db/scripts/script-name.ts
```

**✅ Opção 2: Scripts modernos com dotenv (Automático)**

```bash
cd packages/db
npx tsx scripts/script-name.ts  # Scripts com dotenv funcionam automaticamente
```

**✅ Opção 3: Com variável inline**

```bash
cd packages/db
MYSQL_URL="mysql://root:password@localhost:3306/kodix" npx tsx scripts/script-name.ts
```

## 📋 **Scripts Disponíveis**

### 🚀 **Migração AI Studio**

```bash
# Verificar status da migração
npx tsx scripts/check-migration-status.ts

# Executar migração para nova estrutura
npx tsx scripts/migrate-to-new-ai-structure.ts

# Criptografar tokens existentes
npx tsx scripts/encrypt-existing-tokens.ts
```

### 🌱 **Seeds e Verificação**

```bash
# Verificar dados aplicados
npx tsx scripts/verify-seeds.ts

# Testar repositórios AI
npx tsx scripts/test-ai-provider.ts
```

## 🔗 **Configuração do .env**

Certifique-se que seu `.env` na raiz contém:

```bash
# Database (MySQL) - OBRIGATÓRIO
MYSQL_URL="mysql://root:password@localhost:3306/kodix"

# Outras configurações...
AUTH_GOOGLE_CLIENT_ID="..."
AUTH_GOOGLE_CLIENT_SECRET="..."
```

## ❌ **Problemas Comuns**

### **"DATABASE_URL não encontrada"**

- ❌ **Problema**: Script não encontra a variável
- ✅ **Solução**: Use `MYSQL_URL` em vez de `DATABASE_URL`

### **"Error: ECONNREFUSED"**

- ❌ **Problema**: MySQL não está rodando
- ✅ **Solução**: Inicie o MySQL:
  ```bash
  brew services start mysql
  # ou
  sudo systemctl start mysql
  ```

### **"Module not found" ou "require is not defined"**

- ❌ **Problema**: Incompatibilidade ES modules
- ✅ **Solução**: Use `npx tsx` em vez de `node`

## 🧭 **Estrutura dos Scripts**

```text
packages/db/scripts/
├── README.md                      ← Este arquivo
├── check-migration-status.ts      ← Verificar migração AI Studio
├── migrate-to-new-ai-structure.ts ← Executar migração
├── encrypt-existing-tokens.ts     ← Criptografar tokens
├── verify-seeds.ts               ← Verificar seeds aplicados
├── test-ai-provider.ts           ← Testar repositories
└── sql-check-migration.sql       ← Queries SQL diretas
```

## 💡 **Dicas**

1. **Sempre do root**: Execute scripts do diretório raiz para evitar problemas
2. **MYSQL_URL**: Use sempre esta variável, não `DATABASE_URL`
3. **MySQL ativo**: Certifique-se que o MySQL está rodando antes de executar
4. **Dotenv automático**: Scripts modernos carregam `.env` automaticamente

---

**📖 Documentação principal**: [`../../README.md`](../../README.md)
