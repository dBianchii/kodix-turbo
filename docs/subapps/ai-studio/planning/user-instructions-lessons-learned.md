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
