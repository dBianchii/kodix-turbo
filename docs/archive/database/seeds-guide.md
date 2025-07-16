# 🌱 Guia de Seeds do Banco de Dados

Este guia explica como usar corretamente os diferentes tipos de seeds disponíveis no Kodix, evitando perda de dados e garantindo o uso adequado para cada situação.

## ⚠️ **ATENÇÃO: Diferenças Críticas entre Seeds**

### 🚨 **SEED DESTRUTIVO vs SEED SEGURO**

| Comando                  | Tipo              | Comportamento               | Uso Recomendado                    |
| ------------------------ | ----------------- | --------------------------- | ---------------------------------- |
| `pnpm db:seed`           | **🚨 DESTRUTIVO** | Apaga TODO o banco e recria | **Apenas desenvolvimento inicial** |
| `pnpm db:seed:ai-studio` | **✅ SEGURO**     | Adiciona apenas novos dados | **Atualizações e produção**        |

---

## 📋 **Tipos de Seeds Disponíveis**

### 1. 🚨 **Seed Completo (DESTRUTIVO)**

```bash
# ❌ CUIDADO: Apaga todo o banco!
pnpm db:seed
```

**O que faz:**

- ✅ **Apaga** todo o banco de dados (`reset(db, schema)`)
- ✅ **Recria** estrutura básica (apps, partners)
- ✅ **Popula** com dados de desenvolvimento
- ✅ **Configura** AI Studio global
- ✅ **Detecta** teams existentes e configura automaticamente

**Quando usar:**

- 🟢 **Setup inicial** de desenvolvimento
- 🟢 **Reset completo** para testes
- 🔴 **NUNCA em produção**
- 🔴 **NUNCA com dados importantes**

### 2. ✅ **Seed AI Studio (SEGURO)**

```bash
# ✅ Seguro: Apenas adiciona novos modelos
cd packages/db && pnpm db:seed:ai-studio
```

**O que faz:**

- ✅ **Verifica** se providers já existem
- ✅ **Adiciona** apenas novos providers
- ✅ **Verifica** se modelos já existem
- ✅ **Adiciona** apenas novos modelos
- ❌ **NÃO apaga** dados existentes

**Quando usar:**

- 🟢 **Adicionar novos modelos** (ex: Claude 4, Claude 3.7)
- 🟢 **Atualizações** de modelos IA
- 🟢 **Produção** (seguro)
- 🟢 **Desenvolvimento** (preserva dados)

### 3. 🔧 **Seeds Específicos**

```bash
# Seed manual com controle total
cd packages/db && pnpm with-env tsx ./scripts/seed.ts

# Seed para um team específico
cd packages/db && pnpm with-env tsx -e "
import { seedAiStudioWithTeam } from './src/seed/ai-studio.ts';
await seedAiStudioWithTeam('TEAM_ID', 'USER_ID');
"
```

---

## 🎯 **Cenários de Uso**

### 📦 **Setup Inicial (Primeira vez)**

```bash
# 1. Iniciar banco
cd packages/db-dev && docker-compose up -d

# 2. Aplicar schema
cd packages/db && pnpm push

# 3. Seed completo (primeira vez é seguro)
pnpm db:seed
```

### 🔄 **Adicionar Novos Modelos IA**

```bash
# ✅ Sempre use este para atualizações
cd packages/db && pnpm db:seed:ai-studio
```

### 🚨 **Recuperação após Reset Acidental**

Se você executou `pnpm db:seed` por engano:

```bash
# 1. O banco foi zerado, mas você pode recriar
# 2. Faça login novamente na aplicação
# 3. Crie teams e usuários novamente
# 4. Execute o seed seguro
cd packages/db && pnpm db:seed:ai-studio
```

---

## 📊 **Output Esperado**

### ✅ **Seed Seguro (Correto)**

```bash
✓ Provider "OpenAI" já existe
✓ Provider "Anthropic" já existe
✅ Modelo criado: Claude Opus 4
✅ Modelo criado: Claude Sonnet 4
✓ Modelo "Claude 3.5 Sonnet" já existe
```

### 🚨 **Seed Destrutivo (Perigoso)**

```bash
🧨 Resetting database...
💥 Database reset!
🌱 Seeding basic data...
🌲 Apps and partners seeded!
```

---

## 🔍 **Verificação de Dados**

### **Antes do Seed**

```bash
# Verificar se há dados importantes
cd packages/db && pnpm with-env tsx -e "
import { db } from './src/client.ts';
const users = await db.query.users.findMany();
const teams = await db.query.teams.findMany();
console.log(\`Usuários: \${users.length}, Teams: \${teams.length}\`);
"
```

### **Verificar Modelos IA**

```bash
# Ver modelos disponíveis
cd packages/db && pnpm with-env tsx -e "
import { aiStudioRepository } from './src/repositories/index.ts';
const models = await aiStudioRepository.AiModelRepository.findMany({});
console.log(\`Modelos: \${models.length}\`);
models.forEach(m => console.log(\`- \${m.name}\`));
"
```

---

## 🛡️ **Boas Práticas**

### ✅ **DO (Faça)**

- Use `pnpm db:seed:ai-studio` para atualizações
- Verifique dados importantes antes de qualquer seed
- Teste seeds em ambiente de desenvolvimento primeiro
- Documente mudanças no seed quando adicionar novos modelos

### ❌ **DON'T (Não faça)**

- Nunca use `pnpm db:seed` em produção
- Nunca execute seed destrutivo sem backup
- Não assuma que seeds são sempre seguros
- Não ignore os logs de output dos seeds

---

## 📚 **Scripts Disponíveis**

| Script                                | Localização  | Segurança     | Descrição                        |
| ------------------------------------- | ------------ | ------------- | -------------------------------- |
| `pnpm db:seed`                        | Root         | 🚨 DESTRUTIVO | Seed completo de desenvolvimento |
| `pnpm db:seed:ai-studio`              | packages/db  | ✅ SEGURO     | Apenas modelos IA                |
| `pnpm with-env tsx ./scripts/seed.ts` | packages/db  | 🚨 DESTRUTIVO | Seed manual                      |
| `seedAiStudioWithTeam()`              | Programático | ✅ SEGURO     | Seed para team específico        |

---

## 🆘 **Solução de Problemas**

### **Seed Trava**

```bash
# Verificar se banco está rodando
nc -z localhost 3306 && echo "MySQL OK" || echo "MySQL DOWN"

# Iniciar banco se necessário
cd packages/db-dev && docker-compose up -d
```

### **Modelos Não Aparecem**

```bash
# Executar seed seguro
cd packages/db && pnpm db:seed:ai-studio

# Verificar no AI Studio se aparecem os novos modelos
```

### **Dados Perdidos**

```bash
# Se executou seed destrutivo por engano:
# 1. Recriar usuários via aplicação
# 2. Recriar teams via aplicação
# 3. Executar seed seguro
cd packages/db && pnpm db:seed:ai-studio
```

---

## 📝 **Exemplo Prático: Adicionando Novos Modelos**

### **Cenário:** Anthropic lançou Claude 5

1. **Atualizar seed:**

```typescript
// packages/db/src/seed/ai-studio.ts
{
  name: "Claude 5 Opus",
  providerId: anthropicProvider?.id,
  config: {
    maxTokens: 64000,
    temperature: 0.5,
    description: "Claude 5 Opus - Próxima geração",
    version: "claude-5-opus-20250601",
    pricing: { input: 0.02, output: 0.08 },
  },
  enabled: false,
},
```

2. **Executar seed seguro:**

```bash
cd packages/db && pnpm db:seed:ai-studio
```

3. **Verificar resultado:**

```bash
✅ Modelo criado: Claude 5 Opus
✓ Modelo "Claude 4 Opus" já existe
```

---

## 🔗 **Links Relacionados**

- [Getting Started](./getting-started.md) - Setup inicial
- [Development Workflow](./development-workflow.md) - Fluxo de desenvolvimento
- [Schema Reference](./schema-reference.md) - Referência do schema
- [Production Migrations](./production-migrations.md) - Migrações em produção

---

**⚠️ Lembre-se: Quando em dúvida, use sempre o seed seguro!**
