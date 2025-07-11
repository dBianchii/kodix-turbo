# 🔧 Regras Customizadas do ESLint

O Kodix possui regras ESLint personalizadas para garantir padrões arquiteturais e evitar antipadrões. Estas regras estão centralizadas em `tooling/eslint/`.

## 📜 Regras Críticas

### `no-api-import`

- **Localização**: `tooling/eslint/rules/no-api-import.js`
- **Proíbe**: `import { api } from "~/trpc/react"`
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
