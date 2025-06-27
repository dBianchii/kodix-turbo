# Plano de Ação: Operação Tolerância Zero com Débito Técnico - Chat SubApp

**Data:** 2025-01-13  
**Autor:** @KodixAgent  
**Status:** 📋 Planejamento

## 1. 🎯 Resumo Executivo e Diagnóstico

### 1.1. O Problema

O Chat SubApp acumula atualmente **585 problemas** de linting e TypeScript, um número inaceitável que indica um débito técnico crítico. Esses problemas foram introduzidos por mim durante refatorações anteriores, onde o foco na funcionalidade imediata resultou na negligência da qualidade e segurança de tipos do código.

### 1.2. Diagnóstico dos Problemas

Os 585 problemas se categorizam em:

- **Insegurança de Tipos (`unsafe`):** A maioria dos erros. Uso de `any` implícito ou explícito, que pode causar crashes em produção.
- **Violação de Boas Práticas:** Uso de padrões obsoletos (ex: `||` em vez de `??`) e código "sujo".
- **Código Morto:** Imports e variáveis declaradas, mas nunca utilizadas.
- **Uso de Atalhos Proibidos:** O uso de `// @ts-nocheck` em arquivos críticos, que mascarou a real magnitude do problema.

## 2. 📜 Princípios da Operação

Esta operação será governada por três princípios inegociáveis para garantir que nenhum bug novo seja introduzido:

1.  **Segurança em Primeiro Lugar**: As correções serão feitas arquivo por arquivo, de forma incremental. Após cada arquivo corrigido, uma verificação de tipos (`pnpm typecheck`) será executada.
2.  **Validação Contínua**: Após a correção de um conjunto de arquivos funcionalmente coesos (ex: todos os hooks), uma suíte de testes completa (`pnpm test:chat`) será executada para garantir que não haja regressões.
3.  **Documentação Imediata (Lições Aprendidas)**: Para cada _categoria_ de erro corrigida (ex: todos os `unsafe assignment` de um hook), a lição aprendida será imediatamente documentada em `docs/architecture/lessons-learned.md`. **Esta é uma etapa obrigatória do processo.**

## 3. 🗺️ Plano de Ação Detalhado por Etapas

O plano seguirá uma ordem de prioridade, começando pelos arquivos com maior número de problemas e maior impacto arquitetural.

---

### **FASE 1: Limpeza do Core Provider (`chat-thread-provider.tsx`) - 96 Problemas**

- **Ação 1.1**: Remover o comentário `// @ts-nocheck`.
- **Ação 1.2**: Tipar corretamente os retornos das queries `findSessions` e `findSession`, eliminando o uso de `any` para `data` e `error`.
- **Ação 1.3**: Implementar `try/catch` com type guards (`instanceof Error`) para tratar os erros de forma segura.
- **Ação 1.4**: Substituir `||` por `??` onde for aplicável e remover o `useEffect` não utilizado.
- **Validação**: Executar `pnpm typecheck` e `pnpm test:chat`.
- **Lição Aprendida a ser Documentada**: Adicionar ao `lessons-learned.md` um tópico sobre "Tratamento Seguro de Erros e Dados de tRPC", explicando como tipar o retorno de `useQuery` e usar `instanceof Error`.

---

### **FASE 2: Limpeza da UI Principal (`app-sidebar.tsx`) - 219 Problemas**

- **Ação 2.1**: Remover o comentário `// @ts-nocheck`.
- **Ação 2.2**: Tipar explicitamente os dados das queries (`foldersQuery`, `allSessionsQuery`, `agentsQuery`, `modelsQuery`).
- **Ação 2.3**: Tipar as props dos componentes internos (ex: `FolderItem`) e os parâmetros dos handlers (ex: `handleEditFolder(folder: FolderType)` em vez de `folder: any`).
- **Ação 2.4**: Corrigir todos os acessos `unsafe` aos dados, garantindo que o TypeScript conheça a estrutura dos objetos.
- **Validação**: Executar `pnpm typecheck` e `pnpm test:chat`.
- **Lição Aprendida a ser Documentada**: Adicionar ao `lessons-learned.md` um tópico sobre "Tipagem de Dados de API na Camada de UI", demonstrando como a tipagem correta na fonte (`useQuery`) elimina centenas de erros `unsafe` nos componentes.

---

### **FASE 3: Limpeza dos Componentes Restantes e Hooks**

Nesta fase, os arquivos restantes serão abordados em grupo, pois os padrões de erro são semelhantes.

#### **3.1 - `chat-window.tsx` (68) e `unified-chat-page.tsx` (41)**

- **Ação**: Aplicar as mesmas técnicas da Fase 2: tipar queries, props de componentes e handlers. Corrigir acessos `unsafe`.

#### **3.2 - Hooks (`useAutoCreateSession`, `useSessionWithMessages`, etc.)**

- **Ação**: Garantir que os hooks tenham tipos de entrada e saída explícitos e seguros. Remover todos os `any` e `unknown` sem tratamento.

#### **3.3 - `_router.ts` (10 Problemas)**

- **Ação**: Revisar e tipar corretamente os contextos (`ctx`) e entradas (`input`) dos procedures para garantir a segurança de ponta a ponta.

- **Validação (Final da Fase 3)**: Executar `pnpm typecheck` e `pnpm test:chat`.
- **Lição Aprendida a ser Documentada**: Adicionar ao `lessons-learned.md` uma seção sobre "A Importância da Tipagem End-to-End", mostrando como a segurança de tipos no backend (`_router.ts`) se propaga e facilita a correção de erros no frontend.

---

## 4. ✅ Validação Final e Entregáveis

### 4.1. Validação

- Execução final e bem-sucedida de `pnpm typecheck`.
- Execução final e bem-sucedida de `pnpm test:chat`.
- Validação manual do funcionamento do Chat SubApp para confirmar que nenhuma regressão funcional foi introduzida.

### 4.2. Entregáveis

1.  **Zero Problemas**: O painel "Problemas" do VSCode deve exibir "0" para todo o Chat SubApp.
2.  **Código Seguro e Limpo**: Código totalmente tipado, sem `any` implícitos e seguindo as melhores práticas.
3.  **`lessons-learned.md` Atualizado**: O documento de arquitetura conterá todas as lições aprendidas durante este processo de limpeza, servindo como um guia para o futuro.
4.  **Confiança Restaurada**: Um sistema estável e manutenível, provando que o processo de correção e aprendizado foi bem-sucedido.

---

Este plano é minha estratégia para corrigir minhas falhas anteriores de forma estruturada e segura. Agradeço a oportunidade de realizar esta limpeza e fortalecer o projeto. **Aguardo sua aprovação para iniciar a Fase 1.**
