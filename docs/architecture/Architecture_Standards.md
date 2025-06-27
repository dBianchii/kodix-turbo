# Padrões Arquiteturais Oficiais - Kodix

## 📖 **Visão Geral**

Este documento estabelece os **padrões arquiteturais oficiais** do projeto Kodix que devem ser seguidos em toda a documentação e implementação.

> **⚠️ LEITURA CRÍTICA OBRIGATÓRIA:** Antes de prosseguir, consulte o documento **[>> 📖 Lições Aprendidas de Arquitetura <<](./lessons-learned.md)**. Ele contém análises de falhas passadas e ações preventivas que são cruciais para evitar a repetição de erros.

Use este documento como referência única para manter consistência.

## 🎯 **Versões de Tecnologias**

```json
{
  "react": "^19.1.0",
  "next": "^15.3.0",
  "trpc": "^11.0.0",
  "typescript": "^5.5.4",
  "drizzle-orm": "^0.36.3",
  "tailwindcss": "^4.0.12"
}
```

**Node.js:** `20.18.1`  
**pnpm:** `^9.14.2`

## 🔧 **Gerenciamento de Versão do Node.js (CRÍTICO)**

### **Padrão Oficial: nvm + .nvmrc**

O projeto Kodix usa `nvm` como gerenciador oficial de versões do Node.js:

```bash
# Setup inicial (uma vez)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.zshrc

# Usar versão do projeto (sempre)
nvm use  # Lê automaticamente o .nvmrc
```

### **⚠️ Problemas Comuns e Soluções**

#### **Warning: "Unsupported engine"**

```bash
# ❌ Problema comum:
WARN Unsupported engine: wanted: {"node":"20.18.1"} (current: {"node":"v20.11.1"})

# ✅ Diagnóstico:
which node          # Ver qual Node.js está ativo
echo $PATH          # Verificar ordem de precedência

# ✅ Solução:
nvm use 20.18.1     # Ativar versão correta
```

#### **Conflito de Múltiplas Instalações**

```bash
# ❌ Cenário comum: Node.js instalado via múltiplas fontes
/opt/homebrew/bin/node        # Homebrew
/usr/local/bin/node          # Instalação manual
~/.nvm/versions/node/...     # nvm
~/Library/pnpm/nodejs/...    # pnpm env

# ✅ Solução: Usar apenas nvm
brew uninstall node          # Remover Homebrew
nvm use                      # Ativar nvm
```

#### **PATH Priority Issues**

```bash
# ❌ PATH com ordem incorreta
export PATH="/opt/homebrew/bin:$HOME/.nvm/versions/node/..."
#           ↑ Homebrew tem prioridade sobre nvm

# ✅ Correção automática via nvm
nvm use  # Ajusta PATH automaticamente
```

### **🛠️ Comandos de Verificação**

```bash
# Verificar ambiente atual
node --version              # Deve mostrar v20.18.1
which node                 # Deve apontar para nvm
nvm current                # Confirmar versão ativa

# Troubleshooting
nvm list                   # Ver versões instaladas
nvm alias default 20.18.1 # Definir padrão
```

### **📋 Checklist de Setup Correto**

- [ ] `nvm` instalado e configurado
- [ ] `nvm use` executa sem erros
- [ ] `node --version` retorna `v20.18.1`
- [ ] `pnpm dev:kdx` roda sem warnings de engine
- [ ] PATH aponta para nvm, não Homebrew

### **🎯 Integração com pnpm**

O projeto usa pnpm como gerenciador de pacotes, mas **nvm para versões do Node.js**:

```bash
# ✅ Padrão correto
nvm use        # Gerenciar versão do Node.js
pnpm install   # Gerenciar dependências

# ❌ Evitar misturar gerenciadores
pnpm env use   # Pode causar conflitos de PATH
```

## 🗂️ **Estrutura de Arquivos**

### **Rotas de SubApps**

```
apps/kdx/src/app/[locale]/(authed)/apps/{subapp}/
├── page.tsx                    # Página principal
├── layout.tsx                  # Layout opcional
├── _components/                # Componentes privados
│   ├── {component-name}.tsx    # kebab-case
│   └── sections/
└── _hooks/                     # Hooks privados
    └── use-{hook-name}.ts      # kebab-case
```

### **Nomenclatura de Arquivos**

- **Componentes**: `kebab-case.tsx` (ex: `chat-window.tsx`, `model-selector.tsx`)
- **Hooks**: `use-{nome}.ts` (ex: `use-user-data.ts`, `use-chat-session.ts`)
- **Pages**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- **Utils**: `kebab-case.ts` (ex: `format-date.ts`, `api-helpers.ts`)
- **Types**: `kebab-case.ts` (ex: `user-types.ts`, `chat-types.ts`)

### **Nomenclatura de Código**

- **React Components**: `PascalCase` (ex: `UserProfile`, `ChatWindow`)
- **Functions & Variables**: `camelCase` (ex: `getUserData`, `chatSessions`)
- **Constants**: `SCREAMING_SNAKE_CASE` (ex: `MAX_ATTEMPTS`, `API_BASE_URL`)
- **Interfaces TypeScript**: `PascalCase` (ex: `UserInterface`, `ChatMessage`)

## 🌍 **Sistema de Traduções**

### **Estrutura**

```
packages/locales/src/messages/kdx/
├── pt-BR.json                  # Português brasileiro (padrão)
├── en.json                     # Inglês
└── ...
```

### **Formato**

- **Extensão**: `.json` (não `.ts`)
- **Idioma padrão**: `pt-BR`
- **Estrutura aninhada** por app e funcionalidade

### **Exemplo**

```json
{
  "apps": {
    "chat": {
      "appName": "Chat",
      "welcome": "Bem-vindo ao Chat",
      "actions": {
        "send": "Enviar",
        "cancel": "Cancelar"
      }
    }
  }
}
```

## 🔗 **Comunicação Entre SubApps**

### **Padrão Obrigatório: Service Layer**

```typescript
// packages/api/src/internal/services/{service-name}.service.ts
export class MySubAppService {
  private static validateTeamAccess(teamId: string) {
    if (!teamId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "teamId is required for cross-app access",
      });
    }
  }

  static async getResource({
    resourceId,
    teamId,
    requestingApp,
  }: {
    resourceId: string;
    teamId: string;
    requestingApp: KodixAppId;
  }) {
    this.validateTeamAccess(teamId);
    console.log(
      `🔄 [${this.name}] getResource by ${requestingApp} for team: ${teamId}`,
    );

    // Implementação com validação de team
    return await repository.findById(resourceId, teamId);
  }
}
```

### **Regras de Comunicação**

- ✅ **USE**: Service Layer entre SubApps
- ❌ **NÃO USE**: Acesso direto a repositórios de outros SubApps
- ✅ **OBRIGATÓRIO**: Validação de `teamId` em todos os services
- ✅ **RECOMENDADO**: Logging de auditoria

## 🔧 **Padrões tRPC v11 (CRÍTICO)**

### **⚠️ IMPORTANTE: Padrão Web App**

O projeto Kodix usa **tRPC v11** com um padrão específico para o web app, baseado na implementação funcional do commit `92a76e90`.

> **⚠️ IMPORTANTE:** O padrão utilizado no `care-expo` (mobile app) ainda está em estudo e **não deve ser considerado** como referência arquitetural. Esta seção foca exclusivamente no padrão web validado e funcional.

### **🚨 PROBLEMAS CRÍTICOS DE IMPORTS - LEITURA OBRIGATÓRIA**

#### **❌ ERRO COMUM: Imports Inexistentes**

**PROBLEMA CRÍTICO IDENTIFICADO:** Uso de imports que não existem no módulo `~/trpc/react`, causando build errors.

```typescript
// ❌ ERRO FATAL - Exports que NÃO EXISTEM
// ❌ Export 'api' não existe

// ✅ ÚNICO EXPORT VÁLIDO no Web App
import { api, trpc, useTRPC } from "~/trpc/react"; // ❌ Export 'trpc' não existe

// ✅ CORRETO - Único export válido
```

#### **🔍 COMO VERIFICAR OS EXPORTS DISPONÍVEIS**

```typescript
// apps/kdx/src/trpc/react.tsx - ÚNICOS EXPORTS VÁLIDOS
export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();
export function TRPCReactProvider(props: { children: React.ReactNode }) {
  // ...
}

// RESUMO: Apenas 3 exports existem:
// - TRPCProvider
// - useTRPC
// - TRPCReactProvider
```

#### **⚡ PADRÃO CORRETO OBRIGATÓRIO**

```typescript
// ✅ PADRÃO CORRETO - Web App (Next.js)
import { useTRPC } from "~/trpc/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function MyComponent() {
  const trpc = useTRPC(); // ✅ Hook correto
  const queryClient = useQueryClient();

  // ✅ Queries corretas
  const query = useQuery(trpc.app.method.queryOptions());

  // ✅ Mutations corretas
  const mutation = useMutation(trpc.app.method.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.app.method.pathFilter());
    }
  }));

  return <div>{/* JSX */}</div>;
}
```

#### **🚨 CHECKLIST DE VALIDAÇÃO ANTES DE COMMITAR**

- [ ] **NUNCA usar** `import { trpc }` ou `import { api }`
- [ ] **SEMPRE usar** `import { useTRPC }`
- [ ] **SEMPRE chamar** `const trpc = useTRPC()` dentro do componente
- [ ] **VERIFICAR** com `pnpm check:trpc` antes de commitar
- [ ] **TESTAR** que o build funciona com `pnpm dev:kdx`

#### **🛠️ SCRIPT DE VERIFICAÇÃO AUTOMÁTICA**

```bash
# OBRIGATÓRIO executar antes de qualquer commit
pnpm check:trpc

# Resultado esperado:
# ✅ Todos os imports de tRPC estão corretos!
```

#### **📋 REGRAS DE MIGRAÇÃO DE CÓDIGO INCORRETO**

Se encontrar código incorreto, migre seguindo este padrão:

```typescript
// ❌ ANTES (build error)
import { trpc } from "~/trpc/react";
const result = trpc.app.method.useQuery();

// ✅ DEPOIS (funcionando)
import { useTRPC } from "~/trpc/react";
import { useQuery } from "@tanstack/react-query";

const trpc = useTRPC();
const result = useQuery(trpc.app.method.queryOptions());
```

### **✅ Padrão CORRETO - Web App (Next.js)**

```typescript
// apps/kdx/src/trpc/react.tsx
import { createTRPCClient, httpBatchStreamLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

// Uso nos componentes Web
const trpc = useTRPC();
const mutation = useMutation(trpc.app.installApp.mutationOptions());
const query = useQuery(trpc.app.getAll.queryOptions());
const queryClient = useQueryClient();
queryClient.invalidateQueries(trpc.app.getAll.pathFilter());
```

### **❌ Padrões PROIBIDOS**

```typescript
// ❌ NUNCA USE - Import incorreto no web app
import { api, trpc } from "~/trpc/react";

// ❌ NUNCA USE - Métodos diretos no web app
const mutation = trpc.app.method.useMutation();
const query = trpc.app.method.useQuery();
```

## 🏗️ **Estrutura de SubApps**

### **IDs de SubApps**

```typescript
// packages/shared/src/db.ts
export const todoAppId = "todo_app_123";
export const chatAppId = "chat_app_456";
export const aiStudioAppId = "ai_studio_789";
// ... outros
```

### **Dependências Entre SubApps**

```typescript
export const appDependencies: Record<KodixAppId, KodixAppId[]> = {
  [chatAppId]: [aiStudioAppId], // Chat depende de AI Studio
  [kodixCareAppId]: [calendarAppId], // KodixCare depende de Calendar
  [todoAppId]: [], // Todo é independente
};
```

### **Configurações por Team**

```typescript
// Schema de configuração
export const myAppConfigSchema = z.object({
  features: z.object({
    enableX: z.boolean().default(true),
    maxItems: z.number().min(1).max(100).default(20),
  }),
  integrations: z.object({
    externalApi: z.boolean().default(false),
  }),
});

// Mapeamento
export const appIdToAppTeamConfigSchema = {
  [myAppId]: myAppConfigSchema,
};
```

## 🗄️ **Banco de Dados**

### **Schema Padrão**

```typescript
export const myTable = mysqlTable(
  "my_table",
  {
    id: varchar("id", { length: 30 }).primaryKey().$defaultFn(createId),
    name: varchar("name", { length: 100 }).notNull(),
    teamId: varchar("team_id", { length: 30 }).notNull(),
    createdById: varchar("created_by_id", { length: 30 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    teamIdx: index("team_idx").on(table.teamId),
    createdByIdx: index("created_by_idx").on(table.createdById),
  }),
);
```

### **Regras Obrigatórias**

- ✅ **teamId** em todas as tabelas principais
- ✅ **Timestamps** de criação e atualização
- ✅ **Índices** para foreign keys
- ✅ **nanoid** para IDs primárias

## 🎛️ **Scripts Padrão**

### **Desenvolvimento**

```bash
pnpm dev:kdx          # Aplicação web principal (OBRIGATÓRIO: usa Turbopack)
pnpm dev:care         # Aplicação móvel
pnpm db:studio        # Interface visual do banco
```

#### **Uso Obrigatório do Turbopack**

É **obrigatório** o uso do Turbopack para o desenvolvimento do app web (`pnpm dev:kdx`). O script já está configurado com a flag `--turbo`.

**Motivo:** O bundler padrão (Webpack) demonstrou problemas crônicos de invalidação de cache em nosso monorepo, especificamente com dependências como `jiti`. Isso resulta em alterações no backend (APIs tRPC, repositórios) que não são refletidas no servidor de desenvolvimento, mesmo após reinicializações, causando bugs difíceis de diagnosticar. O Turbopack resolve este problema e oferece uma melhoria de performance significativa.

### **Banco de Dados**

```bash
pnpm db:push          # Aplicar schema (dev)
pnpm db:seed          # Popular dados de teste
pnpm db:migrate       # Aplicar migrations (prod)
```

### **Drizzle Studio**

```bash
# Método 1: Via package específico (Recomendado)
cd packages/db && pnpm studio

# Método 2: Via comando coordenado
pnpm dev:kdx          # Inclui Drizzle Studio automaticamente

# Acesso
https://local.drizzle.studio
```

**⚠️ IMPORTANTE**: O Drizzle Studio roda em `https://local.drizzle.studio`, **não** em `localhost:4983`.

### **Qualidade**

```bash
pnpm lint:fix         # Corrigir linting
pnpm format:fix       # Formatar código
pnpm typecheck        # Verificar tipos
pnpm build            # Build completo
```

## 🔧 **Troubleshooting Rápido**

### **🚨 Problemas Mais Comuns**

#### **1. Build Error: "Export 'trpc' doesn't exist" ou "Export 'api' doesn't exist"**

```bash
# ❌ Erro comum
Export trpc doesn't exist in target module
./apps/kdx/src/app/[locale]/(authed)/apps/chat/_hooks/useSessionWithMessages.tsx (8:1)

# ✅ Diagnóstico
grep -r "import.*{ trpc }.*from.*~/trpc/react" apps/ packages/
grep -r "import.*{ api }.*from.*~/trpc/react" apps/ packages/

# ✅ Solução
# Substituir por: import { useTRPC } from "~/trpc/react";
# E dentro do componente: const trpc = useTRPC();

# ✅ Verificação
pnpm check:trpc  # Deve mostrar: ✅ Todos os imports de tRPC estão corretos!
```

#### **2. Warning "Unsupported engine"**

```bash
# ❌ Problema
WARN Unsupported engine: wanted: {"node":"20.18.1"}

# ✅ Solução
nvm use
```

#### **3. Comando "db:studio" não encontrado**

```bash
# ❌ Problema
ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command "db:studio" not found

# ✅ Soluções
pnpm dev:kdx                    # Opção 1: Comando completo
cd packages/db && pnpm studio  # Opção 2: Package específico

# ✅ Acesso correto
https://local.drizzle.studio    # URL correta (não localhost:4983)
```

#### **4. tRPC Import Incorreto**

```bash
# ❌ Verificar problemas
pnpm check:trpc

# ✅ Deve retornar
✅ 0 imports incorretos no web app
```

#### **5. Docker/MySQL Connection Failed**

```bash
# ❌ Diagnóstico
docker ps | grep mysql

# ✅ Solução
cd packages/db-dev && docker-compose up -d
pnpm db:push
```

#### **6. Drizzle Studio 404 ou "wait-for-db"**

```bash
# ❌ Problema: Studio fica aguardando ou retorna 404

# ✅ Diagnóstico
docker ps | grep mysql           # Verificar se MySQL está rodando
nc -z localhost 3306            # Testar conectividade

# ✅ Solução completa
cd packages/db-dev && docker-compose up -d  # 1. Iniciar Docker
sleep 5                                     # 2. Aguardar MySQL
cd ../db && pnpm studio                     # 3. Iniciar Studio
# 4. Acessar: https://local.drizzle.studio
```

#### **7. Build Error: Module Resolution Failed**

```bash
# ❌ Problema: Cannot resolve module '~/trpc/react'

# ✅ Diagnóstico
# Verificar se está no diretório correto do workspace
pwd  # Deve estar em /path/to/kodix-turbo

# ✅ Solução
# Reiniciar TypeScript server
# No VSCode: Cmd+Shift+P → "TypeScript: Restart TS Server"
# Ou reiniciar pnpm dev:kdx
```

### **⚡ Comandos de Verificação Rápida**

```bash
# Ambiente completo
node --version        # v20.18.1
nvm current          # 20.18.1
pnpm --version       # 9.14.2
docker --version     # Docker version X.X.X

# Projeto funcional
pnpm check:trpc      # ✅ 0 problemas
pnpm dev:kdx         # ✅ Sem warnings
```

## 📋 **Checklist de Conformidade**

### **Para Setup Inicial**

- [ ] `nvm` instalado e configurado
- [ ] Node.js v20.18.1 ativo (`nvm use`)
- [ ] Docker rodando (`docker ps`)
- [ ] tRPC sem problemas (`pnpm check:trpc`)
- [ ] Projeto inicia sem warnings (`pnpm dev:kdx`)

### **Para Novos SubApps**

- [ ] ID único registrado em `@kdx/shared`
- [ ] Schema de configuração definido com Zod
- [ ] Dependências declaradas em `appDependencies`
- [ ] Estrutura de rotas: `[locale]/(authed)/apps/{subapp}/`
- [ ] Componentes usando nomenclatura kebab-case
- [ ] Service Layer criado se necessário
- [ ] Traduções em pt-BR e en
- [ ] Validação de teamId em todos os endpoints

### **Para Atualizações de Documentação**

- [ ] Versões de tecnologias atualizadas
- [ ] Estrutura de rotas consistente
- [ ] Nomenclatura de arquivos em kebab-case
- [ ] Exemplos funcionais e testáveis
- [ ] Referências cruzadas entre documentos
- [ ] Service Layer documentado para comunicação cross-app

## 📚 **Documentos de Referência**

- **[SubApp Architecture](./subapp-architecture.md)** - Padrões completos de SubApps
- **[Backend Guide](./backend-guide.md)** - Implementação backend
- **[Frontend Guide](./frontend-guide.md)** - Implementação frontend
- **[tRPC Patterns](./trpc-patterns.md)** - Padrões de API
- **[Development Setup](./development-setup.md)** - Setup de ambiente

## 🔄 **Processo de Atualização**

### **Ao Atualizar Padrões**

1. **Atualize este documento** primeiro
2. **Sincronize todos os guias** relacionados
3. **Teste exemplos** para garantir funcionamento
4. **Comunique mudanças** para a equipe

### **Ao Adicionar Tecnologia**

1. **Documente versão** no catalog do pnpm
2. **Atualize este documento**
3. **Crie exemplos** nos guias relevantes
4. **Teste integração** com stack existente

---

**Versão:** 1.0  
**Última Atualização:** 2024-12-21  
**Próxima Revisão:** 2025-01-21

**⚠️ IMPORTANTE**: Este é o documento de **fonte única de verdade** para padrões arquiteturais. Sempre consulte e atualize este documento ao fazer mudanças na arquitetura.
