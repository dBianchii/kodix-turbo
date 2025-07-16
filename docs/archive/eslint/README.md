# 📚 ESLint no Projeto Kodix

Este diretório contém a documentação completa sobre as configurações e regras do ESLint no monorepo Kodix.

## 🏗️ Estrutura de Configuração

O Kodix adota uma abordagem **por pacote** para configurações do ESLint:

- Cada pacote/app tem seu próprio `eslint.config.ts` (ou `.js`)
- Configurações base e regras principais estão em `tooling/eslint/`
- Configurações compartilhadas via `@kdx/eslint-config`

## 📂 Conteúdo

1. **[📚 Guia de Regras Obrigatórias](./kodix-eslint-coding-rules.md)** - **LEIA PRIMEIRO** - Regras críticas do projeto
2. **[ playbook-de-correcao-de-lint](./lint-correction-playbook.md)** - Guia estratégico para corrigir erros
3. [Regras Customizadas](./custom-rules.md) - Explicação das regras específicas do Kodix
4. [Configuração por Pacote](./per-package-config.md) - Como configurar ESLint em novos pacotes

## 🛠️ Comandos Úteis

```bash
# Verificar problemas de lint em todo o projeto
pnpm lint

# Verificar e corrigir automaticamente
pnpm lint:fix

# Verificar um pacote específico (NÃO use --filter)
pnpm eslint packages/api/
pnpm eslint apps/kdx/
```
