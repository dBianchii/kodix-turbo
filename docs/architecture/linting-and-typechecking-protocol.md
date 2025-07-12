# Protocolo de Linting e Type-Checking no Monorepo

**Data:** 05/07/2025
**Autor:** Gemini
**Status:** 🏛️ **CONSTITUCIONAL - Padrão Arquitetural Obrigatório**

## 1. O Mandato

Este documento estabelece o protocolo oficial para executar verificações de `lint` e `type-checking` no monorepo Kodix, que utiliza uma stack moderna com **pnpm, Turborepo e ESLint v9+ (flat config)**.

Sua criação é uma resposta direta às falhas recorrentes na execução de comandos de `lint`, que dificultaram a validação de tarefas e a manutenção da qualidade do código. O cumprimento deste protocolo é **obrigatório**.

## 2. A Causa Raiz das Falhas

A análise dos erros de execução revelou uma causa única e fundamental:

- **Mudança no ESLint v9:** A configuração "flat" (`eslint.config.js`) adotada pelo projeto tornou obsoletas certas flags de linha de comando, mais notavelmente a flag `--filter`.
- **Interpretação Incorreta pelo `turbo`:** O comando `pnpm lint` na raiz executa `turbo run lint`. Ao tentar filtrar o escopo (ex: `pnpm lint --filter=@kdx/kdx`), o `turbo` passava a flag `--filter` diretamente para o `eslint` de cada pacote, que não a reconhece mais, causando a falha do comando.

## 3. O Padrão Correto de Execução

### 3.1. Verificação do Projeto Inteiro

Para uma verificação completa, que deve ser feita antes de qualquer `merge` para a `main`, os comandos padrão devem ser executados na raiz do projeto.

```bash
# Verifica os tipos de todo o monorepo
pnpm typecheck

# Verifica o lint de todo o monorepo
pnpm lint
```

### 3.2. Verificação Focada em Pacotes Específicos

Para agilizar o desenvolvimento, é essencial poder focar a verificação em um único pacote (workspace).

#### ➡️ Para `typecheck`:

O `pnpm` e o `turbo` lidam bem com o filtro de `typecheck`. Use a flag `--filter`.

```bash
# ✅ CORRETO: Verifica os tipos apenas no pacote @kdx/kdx
pnpm typecheck --filter=@kdx/kdx
```

#### ➡️ Para `lint` (CRÍTICO):

A flag `--filter` **não funciona** com `pnpm lint`. A forma correta é especificar o diretório do pacote diretamente no comando `eslint`.

```bash
# ❌ INCORRETO: A flag --filter será rejeitada pelo ESLint
pnpm lint --filter=@kdx/kdx

# ✅ CORRETO: Executar o ESLint diretamente no diretório do pacote
pnpm eslint packages/api/
pnpm eslint apps/kdx/
```

Esta abordagem garante que o `eslint` seja executado no contexto certo, usando o `eslint.config.js` correto e verificando apenas os arquivos do pacote especificado.

### 3.3. Verificação Focada em Arquivos Específicos

Para depurações rápidas, é possível focar em arquivos individuais.

```bash
# ✅ CORRETO: Passar o caminho do arquivo diretamente para o eslint
pnpm eslint apps/kdx/src/app/[locale]/\\(authed\\)/apps/chat/_components/model-info-badge.tsx

# ⚠️ ATENÇÃO: É necessário escapar caracteres especiais como ( ) [ ]
# Use aspas ou barras invertidas conforme a necessidade do seu shell (zsh, bash).
```

## 4. Integração com o Playbook de Correção

Este protocolo altera a **Fase 4** do `lint-correction-playbook.md`:

- **Antes:** A verificação final usava `pnpm lint --filter`.
- **Agora:** A verificação final **DEVE** usar `pnpm eslint <caminho-do-pacote>` para uma validação focada e precisa.

Esta mudança será refletida no playbook para garantir consistência.

## 5. Referências Cruzadas

Este protocolo está diretamente ligado e deve ser consultado em conjunto com:

- `@docs/eslint/kodix-eslint-coding-rules.md`
- `@docs/eslint/lint-correction-playbook.md`
- `@docs/architecture/Architecture_Standards.md`
