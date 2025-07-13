<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="high" -->category: development
complexity: advanced
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: all
ai-context-weight: important
last-ai-review: 2025-07-12
-->

<!-- AI-CONTEXT-BOUNDARY: start -->
# Scripts Reference Guide

Esta é a referência completa de todos os scripts disponíveis no monorepo Kodix. Use esta página como guia rápido para encontrar o comando certo para cada situação.

## 📋 Índice

- [🚀 Scripts de Desenvolvimento](#-scripts-de-desenvolvimento)
- [🏗️ Scripts de Build](#️-scripts-de-build)
- [🗄️ Scripts de Banco de Dados](#️-scripts-de-banco-de-dados)
- [🧹 Scripts de Manutenção](#-scripts-de-manutenção)
- [🧪 Scripts de Teste](#-scripts-de-teste)
- [⚡ Scripts de Ferramentas](#-scripts-de-ferramentas)
- [🚀 Scripts de Deploy](#-scripts-de-deploy)
- [📱 Scripts Específicos por App](#-scripts-específicos-por-app)

---

## 🚀 Scripts de Desenvolvimento

### 🐳 Docker Services (EXECUTE PRIMEIRO!)

> **⚠️ IMPORTANTE**: No projeto Kodix, Docker e servidor são **executados coordenadamente**. O comando `pnpm dev:kdx` inicia **AMBOS automaticamente**.

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# 🚀 MODO RECOMENDADO: Execução coordenada
pnpm dev:kdx
# ↳ Inicia: Next.js + MySQL + Redis + todos os serviços
# ↳ Para: Todos os serviços param juntos (Ctrl+C)

# 🔧 MODO MANUAL: Controle independente dos serviços
cd packages/db-dev
docker-compose up -d         # Start all services
docker-compose ps            # Check service status
docker-compose logs mysql    # View MySQL logs
docker-compose stop          # Stop services
docker-compose down          # Stop and remove containers

# Reset completo (CUIDADO: apaga dados!)
docker-compose down -v

# Verificar se tudo está funcionando coordenadamente
cd ../..
./scripts/check-coordinated-services.sh
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**💡 Por que isso acontece:** O `pnpm dev:kdx` usa Turbo para coordenar múltiplos processos simultaneamente, incluindo Docker e Next.js.

### Iniciar Aplicações

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Aplicação web principal (Next.js)
pnpm dev:kdx
# Acessa: http://localhost:3000

# Aplicação móvel (Expo)
pnpm dev:care
# Escaneia QR code com Expo Go

# API standalone (tRPC)
pnpm dev:api
# Acessa: http://localhost:4000

# Chat standalone
pnpm dev:chat
# Acessa: http://localhost:3001

# Visualizador de emails
pnpm dev:email
# Acessa: http://localhost:3002

# Database Studio (Drizzle)
pnpm db:studio
# Acessa: http://localhost:4983
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Desenvolvimento com Watch Mode

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Inicia todos os apps em modo watch (recomendado)
pnpm dev:kdx

# Watch específico para packages
pnpm --filter @kdx/ui dev
pnpm --filter @kdx/api dev
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

## 🏗️ Scripts de Build

### Build Completo

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Build de todo o monorepo (recomendado para produção)
pnpm build

# Build apenas da aplicação principal
cd apps/kdx && pnpm build

# Build de package específico
pnpm --filter @kdx/ui build
pnpm --filter @kdx/api build
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Build com Configurações Específicas

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Build para produção da app principal
cd apps/kdx
pnpm with-env next build

# Build com análise de bundle
cd apps/kdx
ANALYZE=true pnpm build
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Executar Build Localmente

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Iniciar aplicação em modo produção
cd apps/kdx
pnpm start
# Acessa: http://localhost:3000
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

## 🗄️ Scripts de Banco de Dados

### Desenvolvimento

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Aplicar schema ao banco (desenvolvimento)
pnpm db:push

# Abrir interface visual do banco
pnpm db:studio

# Popular banco com dados de teste
pnpm db:seed

# Esperar banco estar disponível
pnpm wait-for-db
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Migrações (Produção)

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Gerar arquivos de migração
cd packages/db
pnpm with-env drizzle-kit generate

# Aplicar migrações em produção
pnpm db:migrate

# Verificar status das migrações
cd packages/db
pnpm with-env drizzle-kit status
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Scripts Específicos do AI Studio

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Seed específico do AI Studio
cd packages/db
pnpm db:seed:ai-studio

# Migração da coluna isDefault (se necessário)
cd packages/db
pnpm db:add-default-column

# Testar provedor de IA
cd packages/db
pnpm db:test:ai-provider

# Aplicar schema de provedor IA
cd packages/db
pnpm db:apply:ai-provider-schema
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Utilitários de Banco

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Resetar banco completamente (⚠️ CUIDADO)
cd packages/db
pnpm db:reset

# Backup do banco
mysqldump -u user -p kodix > backup.sql

# Restaurar backup
mysql -u user -p kodix < backup.sql
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

## 🧹 Scripts de Manutenção

### Limpeza

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Limpar arquivos temporários do root
pnpm clean

# Limpar todos os workspaces
pnpm clean:workspaces

# Limpar node_modules e reinstalar
pnpm clean:workspaces && pnpm i

# Limpar cache do Turbo
pnpm turbo clean
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Formatação e Linting

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Verificar formatação
pnpm format

# Corrigir formatação automaticamente
pnpm format:fix

# Verificar linting
pnpm lint

# Corrigir problemas de linting
pnpm lint:fix

# Verificar tipagem TypeScript
pnpm typecheck

# Verificar arquitetura tRPC
pnpm check:trpc
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Manutenção Completa

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Workflow completo de manutenção
pnpm lint:fix && pnpm format:fix && pnpm typecheck && pnpm check:trpc && pnpm build
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

## 🧪 Scripts de Teste

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Executar todos os testes
pnpm test

# Testes em modo watch
pnpm test:watch

# Testes com coverage
pnpm test:coverage

# Testes específicos de um package
pnpm --filter @kdx/api test
pnpm --filter @kdx/ui test

# Testes end-to-end (se configurado)
pnpm test:e2e
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

## ⚡ Scripts de Ferramentas

### Geração de Código

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Criar novo endpoint tRPC
pnpm trpc:new

# Adicionar componente Shadcn/ui
pnpm ui:add button
pnpm ui:add dialog

# Criar novo package no monorepo
pnpm turbo gen init

# Gerar nanoid
cd packages/db
pnpm generate-nanoid
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Utilitários

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Instalar dependência em package específico
pnpm --filter @kdx/ui add lucide-react
pnpm --filter @kdx/api add @trpc/server

# Remover dependência
pnpm --filter @kdx/ui remove old-package

# Atualizar dependências
pnpm update

# Verificar dependências desatualizadas
pnpm outdated
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

## 🚀 Scripts de Deploy

### Preparação para Deploy

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Workflow completo de pré-deploy
pnpm lint:fix
pnpm format:fix
pnpm typecheck
pnpm build

# Verificar se tudo funciona
cd apps/kdx && pnpm start
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Deploy Específico

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Deploy para Vercel (se configurado)
vercel deploy

# Deploy de produção
vercel deploy --prod

# Deploy específico de preview
vercel deploy --target preview
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

## 📱 Scripts Específicos por App

### Apps/KDX (Web Principal)

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
cd apps/kdx

# Desenvolvimento
pnpm dev

# Build
pnpm build

# Produção local
pnpm start

# Verificações
pnpm lint
pnpm typecheck
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Apps/Care-Expo (Mobile)

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
cd apps/care-expo

# Desenvolvimento
pnpm dev

# Build para diferentes plataformas
pnpm build:android
pnpm build:ios
pnpm build:web

# Preview builds
pnpm preview
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Packages/DB

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
cd packages/db

# Desenvolvimento
pnpm dev

# Build
pnpm build

# Scripts específicos
pnpm studio
pnpm seed
pnpm push
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Packages/API

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
cd packages/api

# Desenvolvimento
pnpm dev

# Build
pnpm build

# Testes
pnpm test
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

## 🔧 🔍 Troubleshooting Scripts

### Problemas Comuns

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Erro: "Module not found"
pnpm clean:workspaces && pnpm i

# Erro: "Port already in use"
lsof -ti:3000 | xargs kill -9

# 🐳 Erro: "Database connection failed" (MAIS COMUM)
# 1. Verificar se Docker está rodando
cd packages/db-dev && docker-compose ps

# 2. Iniciar serviços se necessário
docker-compose up -d

# 3. Aguardar MySQL estar pronto
docker-compose logs mysql | grep "ready for connections"

# 4. Verificar conexão
mysql -h localhost -u root -ppassword -e "SHOW DATABASES;"

# Erro: "Turbo cache issues"
pnpm turbo clean

# Erro: "TypeScript errors"
pnpm typecheck --build

# Erro: "Drizzle schema sync"
pnpm db:push
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Reset Completo (Last Resort)

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# ⚠️ CUIDADO: Remove tudo e reinstala

# 1. Parar e remover containers Docker (apaga dados!)
cd packages/db-dev
docker-compose down -v

# 2. Limpar dependências Node
cd ../..
pnpm clean:workspaces
rm -rf node_modules
rm pnpm-lock.yaml

# 3. Reinstalar tudo
pnpm i

# 4. Reiniciar serviços Docker
cd packages/db-dev
docker-compose up -d
cd ../..

# 5. Aguardar MySQL inicializar
sleep 10

# 6. Configurar banco
pnpm db:push
pnpm db:seed

# 7. Testar
pnpm dev:kdx
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

## 📚 Scripts de Desenvolvimento por Funcionalidade

### Trabalhando com AI Studio

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Setup inicial
pnpm db:seed:ai-studio

# Desenvolvimento
pnpm dev:kdx

# Testar providers
cd packages/db
pnpm db:test:ai-provider

# Adicionar novos modelos
# (Editar schema e rodar)
pnpm db:push
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Trabalhando com Chat

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Desenvolvimento isolado
pnpm dev:chat

# Com a app principal
pnpm dev:kdx

# Testes específicos
pnpm --filter @kdx/chat test
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Trabalhando com Mobile

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Setup inicial
pnpm dev:care

# Em simulador iOS
pnpm ios

# Em simulador Android
pnpm android

# Web version
pnpm web
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

## 🎯 Scripts por Situação

### "Primeira vez configurando o projeto"

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
nvm use                          # Usar versão correta do Node
pnpm i                           # Instalar dependências
cp .env.example .env             # Configurar ambiente
# (Editar .env com suas configurações)
cd packages/db-dev               # IMPORTANTE: Iniciar Docker primeiro
docker-compose up -d             # Iniciar MySQL e serviços
cd ../..                         # Voltar para root
pnpm db:push                     # Aplicar schema
pnpm db:seed                     # Popular dados
pnpm dev:kdx                     # Iniciar desenvolvimento
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### "Trabalhando em uma nova feature"

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
git checkout -b feature/minha-feature
pnpm dev:kdx            # Desenvolvimento
pnpm lint:fix           # Antes de commit
pnpm typecheck          # Verificar tipos
git commit -m "feat: minha feature"
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### "Preparando para produção"

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
pnpm clean:workspaces   # Limpar tudo
pnpm i                  # Reinstalar
pnpm lint:fix           # Corrigir linting
pnpm format:fix         # Formatar código
pnpm typecheck          # Verificar tipos
pnpm build              # Build completo
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### "Debugando problemas"

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
pnpm clean:workspaces   # Limpar cache
pnpm i                  # Reinstalar
pnpm db:studio          # Verificar banco
pnpm dev:kdx            # Testar aplicação
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

## 📋 Quick Reference

### Comandos Mais Usados

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# 🔄 Serviços Coordenados (RECOMENDADO!)
pnpm dev:kdx                                # Iniciar TUDO: servidor + Docker
./scripts/check-coordinated-services.sh     # Verificar status completo

# 🚀 Desenvolvimento diário
pnpm dev:kdx           # Aplicação principal
pnpm db:studio         # Ver banco de dados
pnpm lint:fix          # Antes de commit
pnpm build             # Para produção
pnpm clean:workspaces  # Quando há problemas
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Atalhos Úteis

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Alias sugeridos para .zshrc/.bashrc
alias kdx="cd /path/to/kodix-turbo && pnpm dev:kdx"
alias kdb="cd /path/to/kodix-turbo && pnpm db:studio"
alias kbuild="cd /path/to/kodix-turbo && pnpm build"
alias kclean="cd /path/to/kodix-turbo && pnpm clean:workspaces && pnpm i"
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

## 🔗 Links Relacionados

- [Development Setup](./../../development/setup/../../development/setup/development-setup.md) - Configuração inicial do ambiente
- [Workflows](./../../development/setup/../../development/setup/workflows.md) - Processos de desenvolvimento
- <!-- AI-LINK: type="related" importance="medium" -->
<!-- AI-CONTEXT-REF: importance="medium" type="guide" -->
[Database Guide](../database/getting-started.md)
<!-- /AI-CONTEXT-REF -->
<!-- /AI-LINK --> - Trabalhando com banco de dados
- [Project Overview](../project/overview.md) - Visão geral do projeto

---

**💡 Dica**: Marque esta página como favorita! Use `Ctrl+F` para encontrar rapidamente o script que você precisa.

<!-- AI-CONTEXT-BOUNDARY: end -->
