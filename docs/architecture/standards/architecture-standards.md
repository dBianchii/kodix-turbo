<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="true" summary-threshold="low" -->category: architecture
complexity: advanced
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: fullstack
ai-context-weight: important
last-ai-review: 2025-07-12
-->

<!-- AI-CONTEXT-BOUNDARY: start -->
# Padrões Arquiteturais Oficiais - Kodix

## 📖 **Visão Geral**

Este documento estabelece os **padrões arquiteturais oficiais** do projeto Kodix que devem ser seguidos em toda a documentação e implementação. Use este documento como referência única para manter consistência.

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

**Node.js:** `22.15.0`  
**pnpm:** `^9.14.2`

## 🔧 **Gerenciamento de Versão do Node.js (CRÍTICO)**

### **Padrão Oficial: nvm + .nvmrc**

O projeto Kodix usa `nvm` como gerenciador oficial de versões do Node.js:

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Setup inicial (uma vez)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.zshrc

# Usar versão do projeto (sempre)
nvm use  # Lê automaticamente o .nvmrc
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **⚠️ Problemas Comuns e Soluções**

#### **Warning: "Unsupported engine"**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# ❌ Problema comum:
WARN Unsupported engine: wanted: {"node":"22.15.0"} (current: {"node":"v20.11.1"})

# ✅ Diagnóstico:
which node          # Ver qual Node.js está ativo
echo $PATH          # Verificar ordem de precedência

# ✅ Solução:
nvm use 22.15.0     # Ativar versão correta
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

#### **Conflito de Múltiplas Instalações**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# ❌ Cenário comum: Node.js instalado via múltiplas fontes
/opt/homebrew/bin/node        # Homebrew
/usr/local/bin/node          # Instalação manual
~/.nvm/versions/node/...     # nvm
~/Library/pnpm/nodejs/...    # pnpm env

# ✅ Solução: Usar apenas nvm
brew uninstall node          # Remover Homebrew
nvm use                      # Ativar nvm
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

#### **PATH Priority Issues**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# ❌ PATH com ordem incorreta
export PATH="/opt/homebrew/bin:$HOME/.nvm/versions/node/..."
#           ↑ Homebrew tem prioridade sobre nvm

# ✅ Correção automática via nvm
nvm use  # Ajusta PATH automaticamente
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **🛠️ Comandos de Verificação**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Verificar ambiente atual
node --version              # Deve mostrar v22.15.0
which node                 # Deve apontar para nvm
nvm current                # Confirmar versão ativa

# Troubleshooting
nvm list                   # Ver versões instaladas
nvm alias default 22.15.0 # Definir padrão
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **📋 Checklist de Setup Correto**

- [ ] `nvm` instalado e configurado
- [ ] `nvm use` executa sem erros
- [ ] `node --version` retorna `v22.15.0`
- [ ] `pnpm dev:kdx` roda sem warnings de engine
- [ ] PATH aponta para nvm, não Homebrew

### **🎯 Integração com pnpm**

O projeto usa pnpm como gerenciador de pacotes, mas **nvm para versões do Node.js**:

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# ✅ Padrão correto
nvm use        # Gerenciar versão do Node.js
pnpm install   # Gerenciar dependências

# ❌ Evitar misturar gerenciadores
pnpm env use   # Pode causar conflitos de PATH
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

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

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
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
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **Regras de Comunicação**

- ✅ **USE**: Service Layer entre SubApps
- ❌ **NÃO USE**: Acesso direto a repositórios de outros SubApps
- ✅ **OBRIGATÓRIO**: Validação de `teamId` em todos os services
- ✅ **RECOMENDADO**: Logging de auditoria

## 🔧 **Padrões tRPC v11 (CRÍTICO)**

### **⚠️ IMPORTANTE: Padrão Web App**

O projeto Kodix usa **tRPC v11** com um padrão específico para o web app, baseado na implementação funcional do commit `92a76e90`.

> **⚠️ IMPORTANTE:** O padrão utilizado no `care-expo` (mobile app) ainda está em estudo e **não deve ser considerado** como referência arquitetural. Esta seção foca exclusivamente no padrão web validado e funcional.

### **✅ Padrão CORRETO - Web App (Next.js)**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// apps/kdx/src/trpc/react.tsx
import { createTRPCClient, httpBatchStreamLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

// Uso nos componentes Web
const trpc = useTRPC();
const query = useQuery(trpc.app.getAll.queryOptions());
const mutation = useMutation(trpc.app.installApp.mutationOptions());
const queryClient = useQueryClient();
queryClient.invalidateQueries(trpc.app.getAll.pathFilter());
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **❌ Padrões PROIBIDOS**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ❌ NUNCA USE - Import incorreto no web app
import { api } from "~/trpc/react";

// ❌ NUNCA USE - Métodos diretos no web app
const mutation = trpc.app.method.useMutation();
const query = trpc.app.method.useQuery();
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **🔄 Migração de Código Incorreto**

Se encontrar código incorreto no web app, migre:

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ❌ ANTES (incorreto)
import { api } from "~/trpc/react";
const mutation = api.app.method.useMutation();

// ✅ DEPOIS (correto)
import { useTRPC } from "~/trpc/react";
import { useMutation } from "@tanstack/react-query";

const trpc = useTRPC();
const mutation = useMutation(trpc.app.method.mutationOptions());
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **🛡️ Ferramentas de Validação**

Para garantir conformidade com a arquitetura tRPC v11:

#### **1. Script de Verificação Automática**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Verificar problemas tRPC no web app
pnpm check:trpc

# Deve retornar 0 problemas para web app
# Resultado esperado: ✅ 0 imports incorretos no web app
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

#### **2. Regra ESLint Customizada**

```javascript
// packages/eslint-config/eslint-rules/no-api-import.js
// Detecta e sugere correções para imports incorretos
```

#### **3. Regras de Arquitetura Atualizadas**

```markdown
# docs/eslint/kodix-eslint-coding-rules.md

## 🏗️ 🔧 tRPC v11 Architecture Rules (CRITICAL)

- Web App: SEMPRE use `useTRPC()` pattern
- NUNCA use `import { api }` pattern no web app
```

#### **4. Validação Obrigatória**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Antes de qualquer commit
pnpm check:trpc  # Deve mostrar 0 problemas

# Arquitetura baseada no commit 92a76e90 (kodix-care-web)
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🏗️ **Estrutura de SubApps**

### **IDs de SubApps**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// packages/shared/src/db.ts
export const todoAppId = "todo_app_123";
export const chatAppId = "chat_app_456";
export const aiStudioAppId = "ai_studio_789";
// ... outros
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **Dependências Entre SubApps**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
export const appDependencies: Record<KodixAppId, KodixAppId[]> = {
  [chatAppId]: [aiStudioAppId], // Chat depende de AI Studio
  [kodixCareAppId]: [calendarAppId], // KodixCare depende de Calendar
  [todoAppId]: [], // Todo é independente
};
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **Configurações por Team**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
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
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🗄️ **Banco de Dados**

### **Schema Padrão**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
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
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **Regras Obrigatórias**

- ✅ **teamId** em todas as tabelas principais
- ✅ **Timestamps** de criação e atualização
- ✅ **Índices** para foreign keys
- ✅ **nanoid** para IDs primárias

## 🎛️ **Scripts Padrão**

### **Desenvolvimento**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
pnpm dev:kdx          # Aplicação web principal (OBRIGATÓRIO: usa Turbopack)
pnpm dev:care         # Aplicação móvel
pnpm db:studio        # Interface visual do banco
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

#### **Uso Obrigatório do Turbopack**

É **obrigatório** o uso do Turbopack para o desenvolvimento do app web (`pnpm dev:kdx`). O script já está configurado com a flag `--turbo`.

**Motivo:** O bundler padrão (Webpack) demonstrou problemas crônicos de invalidação de cache em nosso monorepo, especificamente com dependências como `jiti`. Isso resulta em alterações no backend (APIs tRPC, repositórios) que não são refletidas no servidor de desenvolvimento, mesmo após reinicializações, causando bugs difíceis de diagnosticar. O Turbopack resolve este problema e oferece uma melhoria de performance significativa.

### **Banco de Dados**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
pnpm db:push          # Aplicar schema (dev)
pnpm db:seed          # Popular dados de teste
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **Drizzle Studio**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Método 1: Via package específico (Recomendado)
cd packages/db && pnpm studio

# Método 2: Via comando coordenado
pnpm dev:kdx          # Inclui Drizzle Studio automaticamente

# Acesso
https://local.drizzle.studio
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**⚠️ IMPORTANTE**: O Drizzle Studio roda em `https://local.drizzle.studio`, **não** em `localhost:4983`.

### **Qualidade**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
pnpm lint:fix         # Corrigir linting
pnpm format:fix       # Formatar código
pnpm typecheck        # Verificar tipos
pnpm build            # Build completo
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🔧 🔧 **Troubleshooting Rápido**

### **🚨 Problemas Mais Comuns**

#### **1. Warning "Unsupported engine"**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# ❌ Problema
WARN Unsupported engine: wanted: {"node":"22.15.0"}

# ✅ Solução
nvm use
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

#### **2. Comando "db:studio" não encontrado**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# ❌ Problema
ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command "db:studio" not found

# ✅ Soluções
pnpm dev:kdx                    # Opção 1: Comando completo
cd packages/db && pnpm studio  # Opção 2: Package específico

# ✅ Acesso correto
https://local.drizzle.studio    # URL correta (não localhost:4983)
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

#### **3. tRPC Import Incorreto**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# ❌ Verificar problemas
pnpm check:trpc

# ✅ Deve retornar
<!-- AI-PROGRESS: completed="true" verified="true" -->
✅ 0 imports incorretos no web app
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

#### **4. Docker/MySQL Connection Failed**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# ❌ Diagnóstico
docker ps | grep mysql

# ✅ Solução
cd packages/db-dev && docker-compose up -d
pnpm db:push
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

#### **5. Drizzle Studio 404 ou "wait-for-db"**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
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
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **⚡ Comandos de Verificação Rápida**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Ambiente completo
node --version        # v22.15.0
nvm current          # 22.15.0
pnpm --version       # 9.14.2
docker --version     # Docker version X.X.X

# Projeto funcional
pnpm check:trpc      # ✅ 0 problemas
pnpm dev:kdx         # ✅ Sem warnings
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 📋 **Checklist de Conformidade**

### **Para Setup Inicial**

- [ ] `nvm` instalado e configurado
- [ ] Node.js v22.15.0 ativo (`nvm use`)
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

- **[Service Layer Patterns](./service-layer-patterns.md)** - **NOVO**: Padrões de implementação de serviços.
- **<!-- AI-LINK: type="dependency" importance="high" -->
<!-- AI-CONTEXT-REF: importance="high" type="architecture" -->
[SubApp Architecture](./../../../architecture/subapps/../../../architecture/subapps/subapp-architecture.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->** - Padrões completos de SubApps
- **<!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[Backend Guide](./../../../architecture/backend/../../../architecture/backend/backend-guide.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->** - Implementação backend
- **<!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[Frontend Guide](./../../../architecture/frontend/../../../architecture/frontend/frontend-guide.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->** - Implementação frontend
- **[tRPC Patterns](./trpc-patterns.md)** - Padrões de API
- **[Development Setup](./../../development/setup/../../development/setup/development-setup.md)** - Setup de ambiente

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

### PROBLEMAS CRÍTICOS DE IMPORTS (tRPC)

- **ERRO RECORRENTE:** O uso de `import { trpc } from '~/trpc/react'` ou `import { api } from '~/trpc/react'` causa falhas de build e erros de tipo. O módulo `~/trpc/react` **NÃO** exporta uma instância do cliente tRPC diretamente.
- **CAUSA RAIZ:** A inferência de tipos do tRPC e a inicialização do cliente dependem do contexto do React, que é fornecido pelo hook `useTRPC`. Importar diretamente quebra este fluxo.
- **✅ SOLUÇÃO OBRIGATÓRIA:** A única forma correta de obter o cliente tRPC em um componente React é usando o hook `useTRPC`.

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// ✅ CORRETO: Padrão obrigatório
import { useTRPC } from "~/trpc/react";

function MyComponent() {
  const trpc = useTRPC(); // Hook obtém o cliente com o contexto correto

  const allSessionsQuery = useQuery(
    trpc.app.chat.getAllSessions.queryOptions(),
  );
  // ...
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

- **VERIFICAÇÃO:** Para garantir a conformidade, execute `pnpm check:trpc` antes de enviar o código.

<!-- AI-CONTEXT-BOUNDARY: end -->
