# 📦 Configuração do ESLint por Pacote

Cada pacote/app no monorepo Kodix deve ter seu próprio arquivo `eslint.config.ts` (TypeScript) ou `eslint.config.js` (JavaScript).

## 🏗️ Estrutura Básica

```typescript
// eslint.config.ts
export default [
  {
    ignores: ["**/dist/**"], // Exemplo: ignorar pastas de build
  },
  ...(await import("@kdx/eslint-config")).default,
  // Adicione configurações específicas do pacote aqui
];
```

## 📌 Diretrizes

1. **Preferência**: Use `.ts` para novos pacotes (TypeScript)
2. **Ignorar**: Sempre ignore pastas de build (`dist`, `.next`)
3. **Herança**: Importe configurações de `@kdx/eslint-config`
4. **Customização**: Adicione regras específicas após as importações

## 🛠️ Exemplo para Apps Next.js

```typescript
// apps/kdx/eslint.config.ts
export default [
  {
    ignores: [".next/**"],
  },
  ...(await import("@kdx/eslint-config/nextjs")).default,
];
```

> ℹ️ As configurações base estão em `tooling/eslint/` e são compartilhadas via `@kdx/eslint-config`
