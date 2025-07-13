<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="true" summary-threshold="low" -->category: architecture
complexity: intermediate
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: fullstack
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# Sistema de Internacionalização (i18n) - Kodix

## 🔍 📖 Overview

<!-- AI-COMPRESS: strategy="summary" max-tokens="150" -->
**Quick Summary**: Key points for rapid AI context understanding.
<!-- /AI-COMPRESS -->
O Kodix utiliza **next-intl** para fornecer suporte completo a múltiplos idiomas. O sistema permite que usuários escolham entre português brasileiro (`pt-BR`) e inglês (`en`), com persistência da preferência via cookies.

## 🌍 Idiomas Suportados

- **🇧🇷 Português Brasileiro** (`pt-BR`) - Idioma padrão
- **🇺🇸 Inglês** (`en`)

## 📁 Estrutura de Arquivos

```
packages/locales/
├── src/
│   ├── messages/
│   │   ├── kdx/
│   │   │   ├── pt-BR.json          # Traduções em português
│   │   │   └── en.json             # Traduções em inglês
│   │   ├── api/
│   │   ├── zod/
│   │   └── validators/
│   ├── index.ts                    # Exports principais
│   └── next-intl/
│       └── hooks/

apps/kdx/src/
├── i18n/
│   ├── routing.ts                  # Configuração de rotas
│   └── request.ts                  # Configuração de request
├── middlewares/
│   └── i18n.ts                     # Middleware de i18n
└── app/
    └── [locale]/                   # Rotas com locale dinâmico
        ├── layout.tsx
        └── (pages)/
```

## 🔧 Configuração Técnica

### 1. Middleware de Internacionalização

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// apps/kdx/src/middlewares/i18n.ts
import createMiddleware from "next-intl/middleware";

import { defaultLocale, locales } from "@kdx/locales";

const I18nMiddleware = createMiddleware({
  locales: locales,
  defaultLocale: defaultLocale,
  localePrefix: "as-needed",
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 2. Configuração de Rotas

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// apps/kdx/src/i18n/routing.ts
import { defineRouting } from "next-intl/routing";

import { defaultLocale, locales } from "@kdx/locales";

export const routing = defineRouting({
  locales,
  defaultLocale,
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 3. Provider de Contexto

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// apps/kdx/src/app/[locale]/_components/cc-next-intl-client-provider.tsx
<NextIntlClientProvider
  locale={locale}
  messages={messages}
  timeZone="America/Sao_Paulo"
>
  {children}
</NextIntlClientProvider>
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🎯 Como Usar

### 1. Em Componentes Client-Side

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
import { useTranslations } from "next-intl";

export function MeuComponente() {
  const t = useTranslations();

  return (
    <div>
      <h1>{t("apps.meuApp.titulo")}</h1>
      <p>{t("apps.meuApp.descricao")}</p>
    </div>
  );
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 2. Em Páginas Server-Side

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function MinhaPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = (await params).locale;
  setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <div>
      <h1>{t("titulo")}</h1>
    </div>
  );
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 3. Seletor de Idiomas

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
import { I18nPicker } from "~/app/[locale]/_components/header/i18n-picker";

// Uso no header ou qualquer componente
<I18nPicker />
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 📝 Adicionando Traduções

### 1. Estrutura de Tradução

```json
// packages/locales/src/messages/kdx/pt-BR.json
{
  "apps": {
    "meuApp": {
      "appName": "Meu App",
      "titulo": "Bem-vindo",
      "descricao": "Descrição em português",
      "botoes": {
        "salvar": "Salvar",
        "cancelar": "Cancelar"
      }
    }
  }
}
```

```json
// packages/locales/src/messages/kdx/en.json
{
  "apps": {
    "meuApp": {
      "appName": "My App",
      "titulo": "Welcome",
      "descricao": "Description in English",
      "botoes": {
        "salvar": "Save",
        "cancelar": "Cancel"
      }
    }
  }
}
```

### 2. Convenções de Nomenclatura

- **Chaves**: Use camelCase para chaves simples
- **Namespaces**: Organize por app ou funcionalidade
- **Hierarquia**: Use estrutura aninhada para organização
- **Consistência**: Mantenha a mesma estrutura em todos os idiomas

## 🔄 Detecção de Idioma

O sistema detecta o idioma do usuário na seguinte ordem de prioridade:

1. **Cookie `NEXT_LOCALE`** (persistência da escolha do usuário)
2. **Pathname da URL** (`/pt-BR/...` ou `/en/...`)
3. **Header `Accept-Language`** (preferência do navegador)
4. **Fallback para português** (idioma padrão do sistema)

## 🤖 Sistema de Chat e IA

### System Prompts Multilíngues

O sistema de chat **automaticamente** adapta as respostas da IA baseado no idioma do usuário:

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Detecção automática do idioma
const systemPrompts = {
  "pt-BR":
    "Você é um assistente útil e responde sempre em português brasileiro...",
  en: "You are a helpful assistant and always respond in English...",
};
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Como Funciona

1. **Detecção**: API identifica idioma do usuário
2. **System Prompt**: Adiciona prompt no idioma correto
3. **Resposta**: IA responde no idioma escolhido

## 🧪 Testes de Internacionalização

### 1. Testar Mudança de Idioma

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Exemplo de teste
describe("Internacionalização", () => {
  it("deve mudar idioma corretamente", () => {
    // Simular mudança para inglês
    cy.get('[data-testid="i18n-picker"]').click();
    cy.get('[data-testid="locale-en"]').click();

    // Verificar se textos mudaram
    cy.contains("Welcome").should("be.visible");
  });
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 2. Testar Persistência

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
it("deve persistir idioma escolhido", () => {
  // Mudar idioma
  changeLanguage("en");

  // Recarregar página
  cy.reload();

  // Verificar se manteve inglês
  cy.get("html").should("have.attr", "lang", "en");
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🚀 Boas Práticas

### 1. Organização de Traduções

- ✅ **Agrupe por funcionalidade** (`apps.chat`, `apps.todo`)
- ✅ **Use estrutura hierárquica** para organização
- ✅ **Seja consistente** com nomenclatura
- ✅ **Documente contexto** quando necessário

### 2. Manutenção

- ✅ **Sincronize todas as traduções** ao adicionar novas chaves
- ✅ **Use pluralização** quando apropriado
- ✅ **Teste em ambos os idiomas** antes de fazer deploy
- ✅ **Mantenha fallbacks** para chaves não traduzidas

### 3. Performance

- ✅ **Carregue apenas traduções necessárias** por página
- ✅ **Use lazy loading** para traduções grandes
- ✅ **Cache traduções** no client-side
- ✅ **Minimize payloads** de tradução

## 🔧 🔧 Troubleshooting

### Problemas Comuns

1. **Tradução não aparece:**

   - ✓ Verificar se a chave existe em ambos os idiomas
   - ✓ Verificar sintaxe JSON
   - ✓ Verificar importação de mensagens

2. **Idioma não persiste:**

   - ✓ Verificar configuração de cookies
   - ✓ Verificar middleware de i18n
   - ✓ Verificar domínio dos cookies

3. **Rota não funciona:**
   - ✓ Verificar configuração de routing
   - ✓ Verificar middleware de internacionalização
   - ✓ Verificar `setRequestLocale()` em páginas

## 📚 Recursos Adicionais

- **[next-intl Documentation](https://next-intl-docs.vercel.app/)**
- **[Next.js Internationalization](https://nextjs.org/docs/advanced-features/i18n)**
- **<!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[Frontend Development Guide](./../../../architecture/frontend/frontend-guide.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->** para mais implementações
- **<!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[SubApp Creation Guide](./subapp-creation.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK -->** para exemplos práticos

---

_Para dúvidas sobre internacionalização, consulte esta documentação ou o guia de [Frontend Development](./../../../architecture/frontend/frontend-guide.md)._
