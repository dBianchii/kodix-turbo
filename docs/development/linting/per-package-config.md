<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="high" -->category: development
complexity: basic
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: all
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# 📦 Configuração do ESLint por Pacote

Cada pacote/app no monorepo Kodix deve ter seu próprio arquivo `eslint.config.ts` (TypeScript) ou `eslint.config.js` (JavaScript).

## 🏗️ Estrutura Básica

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// eslint.config.ts
export default [
  {
    ignores: ["**/dist/**"], // Exemplo: ignorar pastas de build
  },
  ...(await import("@kdx/eslint-config")).default,
  // Adicione configurações específicas do pacote aqui
];
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 📌 Diretrizes

1. **Preferência**: Use `.ts` para novos pacotes (TypeScript)
2. **Ignorar**: Sempre ignore pastas de build (`dist`, `.next`)
3. **Herança**: Importe configurações de `@kdx/eslint-config`
4. **Customização**: Adicione regras específicas após as importações

## 🛠️ Exemplo para Apps Next.js

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// apps/kdx/eslint.config.ts
export default [
  {
    ignores: [".next/**"],
  },
  ...(await import("@kdx/eslint-config/nextjs")).default,
];
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

> ℹ️ As configurações base estão em `tooling/eslint/` e são compartilhadas via `@kdx/eslint-config`
