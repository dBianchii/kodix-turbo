# Lições Aprendidas: Implementação User Personal Instructions

**Data:** 2025-01-28  
**Autor:** KodixAgent  
**Contexto:** Implementação da funcionalidade de instruções pessoais do usuário no AI Studio

---

## 🎯 Resumo Executivo

Durante a implementação inicial, identificamos padrões arquiteturais importantes do Kodix que devem ser seguidos para manter a consistência do sistema.

---

## 📚 Lições Aprendidas

### 1. ❌ **NÃO Criar Endpoints Duplicados**

- **Erro:** Tentamos criar endpoints específicos no router do AI Studio (`getUserPersonalInstructions`, `saveUserPersonalInstructions`)
- **Correto:** Usar os endpoints genéricos existentes (`app.getUserAppTeamConfig`, `app.saveUserAppTeamConfig`)
- **Razão:** O sistema já possui infraestrutura genérica para configurações de usuário por app

### 2. ✅ **Usar Sistema de Configuração Existente**

- O Kodix possui um sistema hierárquico de configurações bem definido
- Endpoints genéricos já tratam validação, permissões e persistência
- Cada app deve apenas definir seu schema específico

### 3. 📝 **Registro Correto de Schemas**

Para adicionar configurações de usuário a um SubApp:

1. Definir schema em `packages/shared/src/db.ts`
2. Adicionar appId em `AppIdsWithUserAppTeamConfig`
3. Registrar em `packages/db/src/repositories/_zodSchemas/userAppTeamConfigs.ts`
4. Usar endpoints genéricos no frontend

### 4. 🔧 **Imports de tRPC**

- **Erro:** `import { protectedProcedure, router } from "../../../trpc"`
- **Correto:**

  ```typescript
  import { protectedProcedure } from "../../../procedures";
  import { t } from "../../../trpc";

  // Usar t.router() e protectedProcedure diretamente
  ```

### 5. 🚀 **Scripts de Desenvolvimento**

- **Sempre usar:** Scripts da pasta `/scripts` para gerenciar o servidor
- **Iniciar:** `sh ./scripts/start-dev-bg.sh`
- **Verificar:** `sh ./scripts/check-server-simple.sh`
- **Parar:** `sh ./scripts/stop-dev.sh`
- **NÃO usar:** `pnpm dev:kdx` diretamente

### 6. 🎨 **Estrutura do AI Studio**

- O AI Studio usa padrão Sidebar + Content
- Seções são organizadas em grupos: Principal, Configuração, Personalização
- Cada seção tem seu próprio componente em `_components/sections/`

### 7. 🌍 **Internacionalização**

- Sempre adicionar traduções em `packages/locales/src/messages/kdx/`
- Adicionar em ambos os arquivos: `pt-BR.json` e `en.json`
- Usar chaves hierárquicas: `apps.aiStudio.sectionName.field`

### 8. 🐛 **Erros de TypeScript no appRepository**

- Problema com spread de tipos que podem ser primitivos
- Solução: Garantir que schemas sempre retornem objetos, não primitivos
- Usar `.parse()` com cuidado em configurações que podem não existir

---

## 🔄 Fluxo Correto de Implementação

1. **Backend First**

   - Definir schema em `@kdx/shared`
   - Registrar no sistema de configurações
   - Verificar se compila com `pnpm typecheck`

2. **Frontend Second**

   - Criar componente de seção
   - Adicionar ao sidebar (se necessário)
   - Adicionar ao switch de conteúdo
   - Usar endpoints genéricos

3. **Testes**
   - Iniciar servidor com scripts corretos
   - Verificar logs antes de testar no navegador
   - Testar fluxo completo E2E

---

## ⚠️ Pontos de Atenção

1. **AppConfigService vs Endpoints Diretos**

   - Frontend: Sempre usar endpoints tRPC
   - Backend: Pode usar AppConfigService diretamente

2. **Validação de Configurações**

   - Sempre usar schemas Zod
   - Tratar casos onde configuração não existe ainda
   - Usar `.optional()` quando apropriado

3. **Hierarquia de Configurações**
   - Nível 1: Plataforma (Platform Instructions)
   - Nível 2: Time (Team Instructions)
   - Nível 3: Usuário (User Instructions)
   - Maior número = maior precedência

---

## 🚦 Checklist Pré-Implementação

- [ ] Schema definido em `@kdx/shared`?
- [ ] AppId registrado em `AppIdsWithUserAppTeamConfig`?
- [ ] Schema registrado em `appIdToUserAppTeamConfigSchema`?
- [ ] Usando endpoints genéricos (não criando novos)?
- [ ] Imports de tRPC corretos?
- [ ] Traduções adicionadas?
- [ ] Scripts de desenvolvimento prontos?

---

## 📊 Métricas da Tentativa

- **Tempo gasto:** ~2 horas
- **Arquivos modificados:** 8
- **Arquivos criados:** 2
- **Erros encontrados:** 5 principais
- **Retrabalho necessário:** 60% do código

---

## 🆕 Lições Adicionais da Implementação Final

### 9. 🔥 **Erros de TypeScript Persistentes**

- **Problema:** Erros de tipo que não desaparecem mesmo após correções
- **Causa:** Cache do TypeScript e ordem incorreta de compilação dos packages
- **Solução Completa:**

  ```bash
  # 1. Limpar cache do TypeScript
  rm -rf node_modules/.cache

  # 2. Reinstalar dependências
  pnpm install

  # 3. Compilar na ordem correta
  pnpm build --filter=@kdx/shared --filter=@kdx/validators --filter=@kdx/db

  # 4. Verificar tipos após cada mudança
  pnpm typecheck
  ```

### 10. 📦 **Ordem de Implementação Cross-Package**

- **Sequência OBRIGATÓRIA para evitar erros:**

  1. `@kdx/shared` - Definir schemas e tipos base
  2. `@kdx/validators` - Atualizar schemas de validação tRPC
  3. `@kdx/db` - Registrar mapeamentos
  4. `@kdx/api` - Implementar/usar endpoints
  5. Apps - Criar interface

- **Por quê:** Cada package depende dos tipos do anterior. Pular etapas = erros em cascata

### 11. 🎯 **Type Assertion vs Type Safety**

- **Quando usar Type Assertion:** Apenas quando o sistema de tipos genéricos não pode inferir corretamente
- **Exemplo válido:**
  ```typescript
  // AI Studio config tem estrutura específica não inferível pelo sistema genérico
  const aiStudioConfig = config as {
    userInstructions?: { content?: string; enabled?: boolean };
  };
  ```
- **Sempre preferir:** Tipos explícitos e interfaces bem definidas

### 12. 🐞 **Debugging de Imports tRPC**

- **Sintoma:** "Cannot find module" ou "Property does not exist on type"
- **Diagnóstico:**

  ```bash
  # Verificar se os tipos foram gerados
  ls packages/api/src/trpc/routers/**/*.ts

  # Verificar exports
  grep -r "export.*router" packages/api/src/trpc/
  ```

- **Solução:** Sempre usar imports específicos, não imports de barril

### 13. ⚡ **Verificação Incremental**

- **Regra de Ouro:** Após CADA modificação de schema/tipo, execute `pnpm typecheck`
- **Não acumule mudanças:** Erros de tipo se propagam e ficam difíceis de rastrear
- **Se houver erro:** PARE e corrija antes de continuar

### 14. 🏗️ **Build Mental do Grafo de Dependências**

Antes de modificar um tipo compartilhado:

1. Pergunte: "Quais packages usam este tipo?"
2. Liste a ordem de dependência
3. Planeje os builds necessários
4. Execute na ordem correta

### 15. 🎪 **Testes Manuais Durante Desenvolvimento**

- **Não confie apenas em:** `pnpm typecheck` passando
- **Sempre teste:**
  - Build completo do package modificado
  - Funcionamento no browser
  - Console sem erros
  - Dados salvando/carregando corretamente

---

## 📋 Checklist de Implementação Completo v2

1. [ ] **Planejamento:** Identificar todos os packages afetados
2. [ ] **Backend:** Schema em `shared/src/db.ts`
3. [ ] **Backend:** Build e typecheck de `@kdx/shared`
4. [ ] **Backend:** Atualizar `AppIdsWithUserAppTeamConfig` em shared E validators
5. [ ] **Backend:** Build e typecheck de `@kdx/validators`
6. [ ] **Backend:** Registros em `userAppTeamConfigs.ts`
7. [ ] **Backend:** Build e typecheck de `@kdx/db`
8. [ ] **Frontend:** Criar componente section
9. [ ] **Frontend:** Adicionar ao sidebar
10. [ ] **Frontend:** Adicionar ao content switch
11. [ ] **Frontend:** Adicionar traduções
12. [ ] **Validação:** `pnpm typecheck` sem erros
13. [ ] **Validação:** Build completo sem erros
14. [ ] **Validação:** Teste manual no browser
15. [ ] **Cleanup:** Remover logs de debug e código temporário

---

## 💡 Dica Final

> "Na dúvida, compile incrementalmente. É melhor gastar 30 segundos compilando após cada mudança do que 3 horas debugando erros de tipo em cascata."
