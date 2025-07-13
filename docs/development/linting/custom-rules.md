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

# 🔧 Regras Customizadas do ESLint

O Kodix possui regras ESLint personalizadas para garantir padrões arquiteturais e evitar antipadrões. Estas regras estão centralizadas em `tooling/eslint/`.

## 📜 Regras Críticas

### `no-api-import`

- **Localização**: `tooling/eslint/rules/no-api-import.js`
- **❌ PROÍBE**: `import { api } from "~/trpc/react"`
- **Força**: `import { useTRPC } from "~/trpc/react"`
- **Motivo**: Alinhamento com a arquitetura tRPC v10 do Kodix

### `no-ts-nocheck`

- **Localização**: `tooling/eslint/rules/no-ts-nocheck.js`
- **Proíbe**: `// @ts-nocheck`
- **Motivo**: Garantir type safety em todo o código

## 🛠️ Como Adicionar Novas Regras

1. Crie um arquivo em `tooling/eslint/rules/`
2. Exporte a regra seguindo o padrão do ESLint
3. Adicione a regra em `tooling/eslint/index.js`
4. Documente aqui a nova regra
