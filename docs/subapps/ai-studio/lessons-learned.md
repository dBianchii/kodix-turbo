# Lições Aprendidas: AI Studio

**Data:** 2025-01-28  
**Autor:** KodixAgent  
**Contexto:** Lições aprendidas durante a implementação da funcionalidade de instruções pessoais do usuário e outras manutenções no AI Studio.
**Status:** 🟢 Documento de referência ativo.

---

## 🎯 Resumo Executivo

Durante a evolução do AI Studio, identificamos padrões arquiteturais importantes do Kodix que devem ser seguidos para manter a consistência, estabilidade e manutenibilidade do sistema. Este documento consolida essas lições.

---

## 📚 Lições Aprendidas

### 1. ❌ **NÃO Criar Endpoints Duplicados para Configurações**

- **Lição:** O sistema já possui infraestrutura genérica para configurações de usuário e de time (`app.getUserAppTeamConfig`, `app.saveUserAppTeamConfig`, etc.). NUNCA crie endpoints específicos para buscar ou salvar configurações de um SubApp.
- **Padrão Correto:**
  1. Definir o schema da configuração em `packages/shared/src/db.ts`.
  2. Registrar o `appId` e o schema nos mapeamentos corretos.
  3. Usar os endpoints tRPC genéricos existentes no frontend.

### 2. 🚀 **Gerenciamento do Servidor de Desenvolvimento**

- **Contexto**: Para evitar conflitos de porta e garantir que o servidor reinicie corretamente, é crucial usar os scripts de gerenciamento.
- **Padrão Correto:**
  - **Iniciar (do zero):** `pnpm dev:kdx` é o comando principal, que usa Turbopack e coordena todos os serviços, incluindo Docker.
  - **Reiniciar (servidor já rodando):** Use `sh ./scripts/stop-dev.sh` seguido de `sh ./scripts/start-dev-bg.sh`. Isso garante que o processo anterior seja finalizado antes de iniciar um novo.
- **Anti-Padrão**: Executar `pnpm dev:kdx` em um novo terminal sem parar o anterior geralmente causa o erro `PORT_OCCUPIED`.

### 3. 🔥 **Resolvendo Erros de TypeScript Persistentes (Cross-Package)**

- **Problema:** Erros de tipo que não desaparecem mesmo após as correções no código.
- **Causa:** Geralmente, cache do TypeScript ou a ordem incorreta de compilação dos pacotes no monorepo.
- **Solução Completa (Ordem de Execução Obrigatória):**

  1. **Modifique o package base** (ex: `@kdx/shared`).
  2. **Compile e verifique tipos APENAS nesse package:** `pnpm typecheck --filter=@kdx/shared`.
  3. **Repita o processo** para os packages dependentes, seguindo a hierarquia (`@kdx/validators` -> `@kdx/db` -> `@kdx/api` -> `apps/kdx`).
  4. **Se os erros persistirem:**

     ```bash
     # 1. Limpe o cache do Turbo e do TS
     pnpm turbo clean && rm -rf node_modules/.cache

     # 2. Recompile os pacotes afetados em ordem
     pnpm build --filter=@kdx/shared --filter=@kdx/validators...
     ```

- **Regra de Ouro:** Compile e verifique os tipos de forma incremental após cada mudança em um pacote compartilhado.

### 4. 📦 **Ordem de Implementação de Features Cross-Package**

- **Sequência OBRIGATÓRIA para evitar erros em cascata:**
  1. `@kdx/shared`: Definir schemas e tipos base.
  2. `@kdx/validators`: Atualizar schemas de validação tRPC que consomem os tipos do `shared`.
  3. `@kdx/db`: Registrar mapeamentos e repositórios.
  4. `@kdx/api`: Implementar ou usar os endpoints com os novos tipos e validações.
  5. `apps/kdx`: Implementar a interface que consome a API.

---

## 📋 Checklist de Implementação de Configurações (Generalizado)

1.  [ ] **Planejamento:** Identificar todos os packages afetados pela nova configuração.
2.  [ ] **Backend:** Definir o schema da configuração em `shared/src/db.ts`.
3.  [ ] **Backend:** Atualizar os tipos (`AppIdsWith...Config`) e mapeamentos (`appIdTo...ConfigSchema`) em `shared` e `validators`.
4.  [ ] **Backend:** Registrar os schemas nos repositórios (`userAppTeamConfigs.ts`).
5.  [ ] **Validação:** Compilar e verificar os tipos em cada package modificado, em ordem de dependência.
6.  [ ] **Frontend:** Criar o componente de interface no SubApp correspondente.
7.  [ ] **Frontend:** Integrar o componente na UI (Sidebar, Content Switch, etc.).
8.  [ ] **Frontend:** Adicionar as traduções necessárias em `pt-BR.json` e `en.json`.
9.  [ ] **Teste Final:** Executar `pnpm typecheck` na raiz e testar o fluxo completo no navegador.
10. [ ] **Cleanup:** Remover logs de debug.
