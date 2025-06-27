# Plano de Ação: Operação Tolerância Zero com Débito Técnico - Chat SubApp

**Data:** 2025-01-13  
**Autor:** @KodixAgent  
**Status:** ✅ **Revisado e Assertivo**

## 1. 🎯 Resumo Executivo e Diagnóstico

### 1.1. O Problema

O Chat SubApp acumula **585 problemas** de linting e TypeScript, um débito técnico crítico introduzido por mim durante refatorações anteriores.

### 1.2. Diagnóstico da Causa Raiz (Pós-Análise)

A análise profunda revelou que os 585 erros no frontend eram **sintomas**, não a causa. A causa raiz era um **problema estrutural nos routers do backend**: a exportação de routers como objetos genéricos (`TRPCRouterRecord`) em vez de instâncias de `t.router`, o que quebrava a inferência de tipos end-to-end do tRPC.

## 2. 📜 Princípios da Operação

1.  **Estratégia "Top-Down"**: Corrigir a **causa raiz no backend primeiro**. A segurança de tipos deve fluir do servidor para o cliente.
2.  **Validação por Camada**: Validar a camada da API (`pnpm typecheck`) antes de prosseguir para a camada de UI.
3.  **Documentação de Lições**: Todas as descobertas e correções devem ser documentadas em `docs/architecture/lessons-learned.md`.

## 3. 🗺️ Plano de Ação Assertivo (Top-Down)

---

### **FASE 1: Correção da Causa Raiz - Estrutura dos Routers (Backend)**

- **Ação 1.1**: **Corrigir `chat/_router.ts`**: Alterar a exportação `export const chatRouter: TRPCRouterRecord` para `export const chatRouter = t.router({...})`.
- **Ação 1.2**: **Corrigir `ai-studio/_router.ts` e outros**: Garantir que todos os sub-routers aninhados (providers, models, etc.) também usem `t.router`.
- **Ação 1.3**: **Corrigir `app/_router.ts`**: Garantir que o router principal combine os sub-routers corretamente, sem a necessidade de `as any`.
- **Validação Imediata**: Executar `pnpm typecheck` após esta fase. **A expectativa é que a grande maioria dos 585 erros desapareça.**
- **Lição Aprendida**: Documentar em `lessons-learned.md` a lição crítica sobre a "Estrutura do Router como Causa Raiz de Erros de Tipo".

---

### **FASE 2: Limpeza Final e Validação (Frontend)**

Somente após a conclusão bem-sucedida da Fase 1.

- **Ação 2.1**: **Remover todos os `// @ts-nocheck`** dos arquivos do Chat SubApp, começando por `chat-thread-provider.tsx` e `app-sidebar.tsx`.
- **Ação 2.2**: **Corrigir Erros Remanescentes**: Com a inferência de tipos funcionando, corrigir os poucos erros de tipo restantes (se houver) e os avisos de boas práticas (`??`, imports não utilizados).
- **Validação**: Executar `pnpm typecheck` novamente para confirmar que **zero problemas** restam.
- **Lição Aprendida**: Documentar em `lessons-learned.md` a importância da "Tipagem de Dados de API na Camada de UI", mostrando como a correção do backend simplificou a do frontend.

---

### **FASE 3: Validação Funcional Completa**

- **Ação 3.1**: Executar a suíte de testes completa (`pnpm test:chat`) para garantir que não há regressões.
- **Ação 3.2**: Realizar um teste manual do fluxo completo do Chat (criar sessão, enviar mensagem, usar pastas) para confirmar que a aplicação está 100% funcional.

---

## 4. ✅ Entregáveis Finais

1.  **Zero Problemas**: O painel "Problemas" do VSCode deve exibir "0" para todo o projeto.
2.  **Código Seguro e Limpo**: Código totalmente tipado e alinhado com as melhores práticas.
3.  **`lessons-learned.md` Consolidado**: Documento de arquitetura atualizado com as causas raízes e soluções definitivas.
4.  **Confiança Restaurada**: Um sistema estável e um processo de correção que demonstra aprendizado e melhoria contínua.

---

Este plano é minha estratégia para corrigir minhas falhas anteriores de forma estruturada e segura. Agradeço a oportunidade de realizar esta limpeza e fortalecer o projeto. **Aguardo sua aprovação para iniciar a Fase 1.**
