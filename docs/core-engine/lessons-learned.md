# Lições Aprendidas - Core Engine

**Data:** 2025-07-02  
**Autor:** KodixAgent  
**Status:** 🟢 Ativo

## 1. Visão Geral

Este documento registra as lições aprendidas especificamente durante o desenvolvimento e a manutenção do pacote `@kdx/core-engine`.

## 2. Lições de Implementação

### 2.1. Flexibilidade vs. Tipagem Estrita em Utilitários (`deepMerge`)

- **Lição:** Ao criar utilitários genéricos como `deepMerge`, que precisam lidar com uma variedade de estruturas de objetos (neste caso, diferentes schemas de configuração), uma abordagem excessivamente estrita com genéricos do TypeScript pode se tornar um obstáculo.
- **O Problema:** A tentativa inicial de criar um `deepMerge` com tipagem 100% segura e genérica resultou em tipos complexos que eram difíceis de manter e quebravam facilmente com novos schemas de configuração.
- **Solução Pragmática:** Para este caso de uso específico, relaxar a tipagem do `deepMerge` para `(target: any, source: any): any` foi uma decisão pragmática que simplificou o código e aumentou a flexibilidade. A segurança de tipo é garantida na camada de serviço (`ConfigurationService`) que consome o `deepMerge` e conhece os schemas Zod esperados.

### 2.2. Resolução de Módulos e Testes de Integração (TDD)

- **Lição:** A metodologia TDD (Test-Driven Development) é extremamente eficaz para validar problemas de arquitetura, como a resolução de módulos entre pacotes.
- **O Problema:** O `@kdx/core-engine` não conseguia importar repositórios de `@kdx/db` porque eles não eram expostos no `index.ts` do pacote.
- **Solução com TDD:**
  1.  **Criar um Teste que Falha:** Um teste simples foi criado no `@kdx/core-engine` com o único propósito de importar um repositório do `@kdx/db`.
  2.  **Validar a Falha:** O `pnpm typecheck` falhou com `Cannot find module`, provando o problema de arquitetura de forma inequívoca.
  3.  **Implementar a Correção:** O `index.ts` do `@kdx/db` foi atualizado para exportar os repositórios.
  4.  **Validar a Correção:** O mesmo `pnpm typecheck` que antes falhava agora passou, confirmando que o problema foi resolvido em sua causa raiz.

Este fluxo não apenas corrigiu o bug, mas também serviu como uma forma de documentação viva, provando a necessidade da mudança arquitetural.
