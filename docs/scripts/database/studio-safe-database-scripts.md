# Scripts Studio-Safe para Banco de Dados

## 🎯 Problemas Resolvidos

Esta metodologia resolve múltiplos problemas comuns em projetos Drizzle:

### 1. **Drizzle Studio Travando**
```
Error: Can't add new command when connection is in closed state
Unexpected error happened 😕
```

### 2. **Modelos/Dados Não Aparecendo na Interface**
- Foreign keys desatualizadas após migrações
- Referências usando IDs antigos em vez de novos
- Relacionamentos quebrados entre tabelas

### 3. **Problemas Pós-Migração**
- Dados órfãos com referências inválidas
- Inconsistências entre schema e dados existentes
- Relacionamentos many-to-many quebrados

## ✅ Solução Implementada

Criamos um padrão de scripts que usam o **cliente Drizzle oficial do projeto** em vez de conexões MySQL diretas, mantendo o Drizzle Studio sempre ativo e permitindo correções seguras de dados.

## 🏗️ Padrão de Implementação

### Estrutura Base

```typescript
#!/usr/bin/env tsx

import { config } from "dotenv";
import { eq, count } from "drizzle-orm";

// Load environment variables from root
config({ path: "../../.env" });

// Use official Drizzle client (Studio-safe)
import { db } from "../src/client";
import { aiModel, aiProvider } from "../src/schema";

async function myDatabaseOperation() {
  console.log("🔧 Executing Studio-safe database operation...");
  
  try {
    // Use Drizzle ORM syntax instead of raw SQL
    const result = await db
      .select()
      .from(aiProvider);
    
    console.log("✅ Operation completed successfully!");
    console.table(result);
    
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  myDatabaseOperation()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
```

### Comando de Execução

```bash
MYSQL_URL="mysql://root:password@localhost:3306/kodix" npx tsx packages/db/scripts/[SCRIPT_NAME].ts
```

## 🚫 O Que NÃO Fazer

### ❌ Conexões Diretas (Derrubam Studio)

```typescript
// NÃO FAZER - Derruba o Drizzle Studio
import { createConnection } from "mysql2/promise";

const connection = await createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'password',
  database: 'kodix'
});

const [rows] = await connection.execute("SELECT * FROM ai_provider");
```

## ✅ O Que Fazer

### ✅ Cliente Drizzle Oficial (Studio-Safe)

```typescript
// FAZER - Mantém o Drizzle Studio ativo
import { db } from "../src/client";
import { aiProvider } from "../src/schema";

const providers = await db
  .select()
  .from(aiProvider);
```

## 🛡️ Recursos de Segurança

### Studio-Safe Design
- ✅ Usa cliente Drizzle oficial (`packages/db/src/client.ts`)
- ✅ Compartilha pool de conexões com o Studio
- ✅ Não cria conexões paralelas conflitantes
- ✅ Mantém Drizzle Studio funcionando normalmente

### Boas Práticas
- ✅ Carregamento de variáveis de ambiente
- ✅ Tratamento de erros com try-catch
- ✅ Logs detalhados e informativos
- ✅ Exit codes apropriados
- ✅ Execução condicional

## 🔧 Casos de Uso Comuns

### 1. **Verificação de Status do Banco**
```typescript
// Script para verificar estado atual
const providers = await db.select().from(aiProvider);
const models = await db.select().from(aiModel).limit(10);
console.table(providers);
console.table(models);
```

### 2. **Correção de Foreign Keys Após Migração**
```typescript
// Exemplo: Corrigir foreign keys após renomear provider.id → provider.providerId
const updates = [
  { old: "OpenAI", new: "openai" },
  { old: "Google", new: "google" }
];

for (const update of updates) {
  await db
    .update(aiModel)
    .set({ providerId: update.new })
    .where(eq(aiModel.providerId, update.old));
}
```

### 3. **Validação de Relacionamentos**
```typescript
// Verificar se relacionamentos estão funcionando
const modelsWithProviders = await db.query.aiModel.findMany({
  with: { provider: true }
});

const orphanedModels = modelsWithProviders.filter(m => !m.provider);
console.log(`Found ${orphanedModels.length} orphaned models`);
```

### 4. **Limpeza de Dados Órfãos**
```typescript
// Remover registros órfãos após migração
const validProviderIds = await db.select({ providerId: aiProvider.providerId }).from(aiProvider);
const validIds = validProviderIds.map(p => p.providerId);

await db.delete(aiModel).where(not(inArray(aiModel.providerId, validIds)));
```

## 📁 Templates de Scripts

### Template 1: Verificação de Status
```typescript
#!/usr/bin/env tsx
import { config } from "dotenv";
import { count } from "drizzle-orm";

config({ path: "../../.env" });
import { db } from "../src/client";
import { yourTable } from "../src/schema";

async function checkStatus() {
  console.log("🔍 Checking database status...");
  
  const totalRecords = await db.select({ count: count() }).from(yourTable);
  console.log(`Total records: ${totalRecords[0]?.count}`);
  
  const sampleData = await db.select().from(yourTable).limit(5);
  console.table(sampleData);
}

checkStatus().then(() => process.exit(0)).catch(console.error);
```

### Template 2: Correção de Foreign Keys
```typescript
#!/usr/bin/env tsx
import { config } from "dotenv";
import { eq } from "drizzle-orm";

config({ path: "../../.env" });
import { db } from "../src/client";
import { childTable, parentTable } from "../src/schema";

async function fixForeignKeys() {
  console.log("🔧 Fixing foreign keys...");
  
  const mappings = [
    { old: "OldValue1", new: "newValue1" },
    { old: "OldValue2", new: "newValue2" }
  ];
  
  for (const mapping of mappings) {
    await db
      .update(childTable)
      .set({ foreignKey: mapping.new })
      .where(eq(childTable.foreignKey, mapping.old));
    
    console.log(`✅ Updated: ${mapping.old} → ${mapping.new}`);
  }
  
  // Verification
  const result = await db.select().from(childTable).limit(5);
  console.table(result);
}

fixForeignKeys().then(() => process.exit(0)).catch(console.error);
```

### Template 3: Validação de Relacionamentos
```typescript
#!/usr/bin/env tsx
import { config } from "dotenv";
import { eq, isNull } from "drizzle-orm";

config({ path: "../../.env" });
import { db } from "../src/client";

async function validateRelationships() {
  console.log("🔍 Validating relationships...");
  
  // Check for orphaned records
  const childRecords = await db.query.childTable.findMany({
    with: { parent: true }
  });
  
  const orphaned = childRecords.filter(child => !child.parent);
  
  if (orphaned.length > 0) {
    console.log(`⚠️  Found ${orphaned.length} orphaned records`);
    console.table(orphaned.slice(0, 5));
  } else {
    console.log("✅ All relationships are valid");
  }
  
  // Show relationship summary
  const summary = await db
    .select({ parentId: childTable.parentId, count: count() })
    .from(childTable)
    .groupBy(childTable.parentId);
    
  console.table(summary);
}

validateRelationships().then(() => process.exit(0)).catch(console.error);
```

## 🎯 Benefícios

- **Drizzle Studio permanece ativo** durante todas as operações
- **Visualização em tempo real** das mudanças no Studio
- **Debugging mais eficiente** com Studio + scripts simultâneos
- **Desenvolvimento mais produtivo** sem interrupções

## 🚨 Problemas Específicos e Soluções

### Problema: "Modelos não aparecem na interface"
**Causa**: Foreign keys desatualizadas após migração de schema
**Solução**: 
```typescript
// 1. Identificar foreign keys órfãs
const orphaned = await db.query.models.findMany({
  with: { provider: true }
});
const orphanedModels = orphaned.filter(m => !m.provider);

// 2. Corrigir mapeamentos
const mappings = [
  { old: "OpenAI", new: "openai" },
  { old: "Google", new: "google" }
];

for (const mapping of mappings) {
  await db.update(models)
    .set({ providerId: mapping.new })
    .where(eq(models.providerId, mapping.old));
}
```

### Problema: "Relacionamentos quebrados"
**Causa**: Mudanças de chave primária não refletidas em tabelas filhas
**Solução**:
```typescript
// 1. Verificar integridade
const children = await db.query.childTable.findMany({
  with: { parent: true }
});

// 2. Atualizar referências
await db.update(childTable)
  .set({ parentId: newParentId })
  .where(eq(childTable.parentId, oldParentId));
```

### Problema: "Dados não sincronizam"
**Causa**: Cache ou pool de conexões conflitante
**Solução**: Usar apenas cliente Drizzle oficial, nunca conexões diretas

## 📋 Checklist para Novos Scripts

- [ ] Usar `import { db } from "../src/client"` (nunca createConnection)
- [ ] Carregar variáveis de ambiente com `config({ path: "../../.env" })`
- [ ] Implementar tratamento de erros com try-catch
- [ ] Adicionar logs informativos e tabelas de resultados
- [ ] Verificar dados antes e depois da operação
- [ ] Testar com Drizzle Studio ativo
- [ ] Validar relacionamentos após mudanças
- [ ] Documentar o script e seu propósito

## 🚀 Guia Passo-a-Passo para Outros Repositórios

### 1. **Identificar o Problema**
```bash
# Execute no seu projeto
npx tsx scripts/check-status.ts
```

### 2. **Adaptar Templates**
- Copie um template adequado
- Substitua nomes de tabelas pelo seu schema
- Ajuste caminhos de import (`../src/client`, `../src/schema`)

### 3. **Configurar Ambiente**
```typescript
// Ajustar caminho do .env conforme estrutura do projeto
config({ path: "../../.env" }); // ou "../.env" ou ".env"
```

### 4. **Testar Progressivamente**
- Execute primeiro script de verificação (read-only)
- Confirme que Studio permanece ativo
- Execute scripts de correção
- Valide resultados

### 5. **Validar Resultado**
```typescript
// Sempre incluir verificação pós-operação
const result = await db.select().from(yourTable).limit(10);
console.table(result);
```

## ⚠️ Precauções

- **Sempre execute verificação antes** de fazer mudanças
- **Faça backup** em produção antes de executar correções
- **Teste em desenvolvimento** primeiro
- **Mantenha Studio aberto** para monitorar mudanças em tempo real
- **Documente** cada script para referência futura

---

**Última atualização**: 2025-07-19  
**Propósito**: Metodologia para scripts compatíveis com Drizzle Studio  
**Status**: Implementado e funcionando ✅