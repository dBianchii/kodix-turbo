# Lições Aprendidas - Core Engine

**Data:** 2025-07-02  
**Autor:** KodixAgent  
**Status:** 🟢 Ativo

## 1. Visão Geral

Este documento registra as lições aprendidas especificamente durante o desenvolvimento e a manutenção do pacote `@kdx/core-engine`.

## 2. Lições de Implementação

### 2.1. Tipagem Forte Obrigatória em Utilitários (`deepMerge`)

- **Lição:** Utilitários genéricos como `deepMerge` devem ser construídos com tipagem genérica forte (usando `<T>` e `<U>`) para preservar a segurança de tipos end-to-end.
- **O Problema:** Uma implementação inicial do `deepMerge` com `(target: any, source: any): any` quebrou o contrato de tipos, forçando os serviços consumidores a também usar `any` e gerando uma cascata de erros `no-unsafe-assignment`.
- **Solução Arquitetural:** A tipagem do `deepMerge` deve ser robusta, como `deepMerge<T, U>(target: T, source: U): T & U`. A segurança de tipos deve ser mantida em todas as camadas, desde os utilitários de mais baixo nível até os serviços de mais alto nível, alinhado com a nossa política de tolerância zero com `any`.

### 2.2. Resolução de Módulos e Testes de Integração (TDD)

- **Lição:** A metodologia TDD (Test-Driven Development) é extremamente eficaz para validar problemas de arquitetura, como a resolução de módulos entre pacotes.
- **O Problema:** O `@kdx/core-engine` não conseguia importar repositórios de `@kdx/db` porque eles não eram expostos no `index.ts` do pacote.
- **Solução com TDD:**
  1.  **Criar um Teste que Falha:** Um teste simples foi criado no `@kdx/core-engine` com o único propósito de importar um repositório do `@kdx/db`.
  2.  **Validar a Falha:** O `pnpm typecheck` falhou com `Cannot find module`, provando o problema de arquitetura de forma inequívoca.
  3.  **Implementar a Correção:** O `index.ts` do `@kdx/db` foi atualizado para exportar os repositórios.
  4.  **Validar a Correção:** O mesmo `pnpm typecheck` que antes falhava agora passou, confirmando que o problema foi resolvido em sua causa raiz.

Este fluxo não apenas corrigiu o bug, mas também serviu como uma forma de documentação viva, provando a necessidade da mudança arquitetural.
