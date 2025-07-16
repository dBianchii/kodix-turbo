<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="high" -->category: development
complexity: intermediate
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: all
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# 🚀 CI Optimization Guide - Kodix

## 📖 Visão Geral

Este guia apresenta **estratégias avançadas** para otimizar o pipeline CI do Kodix, reduzindo tempo de execução, custos e melhorando a experiência do desenvolvedor.

## 🎯 Objetivos de Performance

### Métricas Alvo

| Métrica            | Atual  | Meta   | Economia |
| ------------------ | ------ | ------ | -------- |
| **Tempo Total CI** | ~15min | < 5min | 67%      |
| **Feedback Loop**  | ~10min | < 3min | 70%      |
| **Custo Mensal**   | $500   | < $200 | 60%      |
| **Taxa de Falha**  | 5%     | < 1%   | 80%      |

## 🏗️ Estratégias de Otimização

### 1. **Execução Paralela Inteligente**

<!-- AI-CODE-OPTIMIZATION: language="yaml" context="configuration" -->
```yaml
# .github/workflows/ci-optimized.yml
name: Optimized CI Pipeline

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  # Job 1: Análise de mudanças (30s)
  changes:
    runs-on: ubuntu-latest
    outputs:
      subapps: ${{ steps.filter.outputs.subapps }}
      packages: ${{ steps.filter.outputs.packages }}
      tests: ${{ steps.filter.outputs.tests }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: dorny/paths-filter@v2
        id: filter
        with:
          filters: |
            subapps:
              - 'apps/kdx/src/app/**/apps/**'
            packages:
              - 'packages/**'
            tests:
              - '**/*.test.ts'
              - '**/*.test.tsx'
              - '**/vitest.config.ts'

  # Jobs paralelos baseados em mudanças
  lint:
    needs: changes
    runs-on: ubuntu-latest
    if: |
      github.event_name == 'pull_request' &&
      (needs.changes.outputs.subapps == 'true' || 
       needs.changes.outputs.packages == 'true')
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-minimal
      - run: pnpm lint:affected

  typecheck:
    needs: changes
    runs-on: ubuntu-latest
    if: |
      needs.changes.outputs.subapps == 'true' || 
      needs.changes.outputs.packages == 'true'
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-minimal
      - run: pnpm typecheck:affected

  unit-tests:
    needs: changes
    runs-on: ubuntu-latest
    if: needs.changes.outputs.tests == 'true'
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-minimal
      - run: pnpm test:unit --shard=${{ matrix.shard }}/4
```
<!-- /AI-CODE-OPTIMIZATION -->

### 2. **Cache Inteligente**

<!-- AI-CODE-OPTIMIZATION: language="yaml" context="configuration" -->
```yaml
# .github/actions/setup-minimal/action.yml
name: "Setup Minimal Environment"
description: "Setup pnpm with intelligent caching"

runs:
  using: "composite"
  steps:
    # Cache de dependências
    - name: Setup pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 9.14.2

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version-file: ".nvmrc"
        cache: "pnpm"

    # Cache de build artifacts
    - name: Cache build outputs
      uses: actions/cache@v3
      with:
        path: |
          .next/cache
          packages/*/dist
          packages/*/.turbo
          node_modules/.cache
        key: build-${{ runner.os }}-${{ hashFiles('**/package.json') }}
        restore-keys: |
          build-${{ runner.os }}-

    # Cache de test results
    - name: Cache test results
      uses: actions/cache@v3
      with:
        path: |
          coverage/
          .vitest-cache/
        key: tests-${{ runner.os }}-${{ github.sha }}
        restore-keys: |
          tests-${{ runner.os }}-

    # Instalação otimizada
    - name: Install dependencies
      shell: bash
      run: |
        if [ -f "pnpm-lock.yaml" ]; then
          pnpm install --frozen-lockfile --prefer-offline
        else
          echo "::error::pnpm-lock.yaml not found"
          exit 1
        fi
```
<!-- /AI-CODE-OPTIMIZATION -->

### 3. **Testes Incrementais**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// vitest.config.ts
import { defineConfig } from "vitest/config";

import { getChangedFiles } from "./scripts/get-changed-files";

export default defineConfig({
  test: {
    // Executa apenas testes afetados
    include: process.env.CI
      ? getChangedFiles().map((f) => `${f}.test.{ts,tsx}`)
      : ["**/*.test.{ts,tsx}"],

    // Cache de transformações
    cache: {
      dir: ".vitest-cache",
    },

    // Relatórios otimizados
    reporters: process.env.CI ? ["json", "junit"] : ["verbose"],

    // Paralelização
    pool: "threads",
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: process.env.CI ? 4 : undefined,
      },
    },
  },
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 4. **Docker Layer Caching**

```dockerfile
# Dockerfile.ci
# Base layer com dependências do sistema
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Dependencies layer (cacheable)
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/*/package.json packages/*/
COPY apps/*/package.json apps/*/
RUN corepack enable && pnpm install --frozen-lockfile

# Build layer
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/*/node_modules
COPY --from=deps /app/apps/*/node_modules ./apps/*/node_modules
COPY . .
RUN pnpm build

# Test layer
FROM builder AS tester
ENV CI=true
CMD ["pnpm", "test:ci"]
```

### 5. **Matrix Strategy Otimizada**

<!-- AI-CODE-OPTIMIZATION: language="yaml" context="configuration" -->
```yaml
# Estratégia de matriz para diferentes tipos de teste
test-matrix:
  strategy:
    fail-fast: false
    matrix:
      include:
        # Testes unitários por package
        - package: api
          command: test:unit
          needs-db: false
        - package: db
          command: test:unit
          needs-db: true
        - package: ui
          command: test:unit
          needs-db: false

        # Testes de integração específicos
        - package: api
          command: test:integration
          needs-db: true

        # Testes E2E por SubApp
        - subapp: chat
          command: test:e2e
          needs-db: true
        - subapp: ai-studio
          command: test:e2e
          needs-db: true

  services:
    mysql:
      image: mysql:8.0
      if: matrix.needs-db
      env:
        MYSQL_ROOT_PASSWORD: test
        MYSQL_DATABASE: kodix_test
      options: >-
        --health-cmd="mysqladmin ping"
        --health-interval=10s
        --health-timeout=5s
        --health-retries=5
```
<!-- /AI-CODE-OPTIMIZATION -->

### 6. **Conditional Workflows**

<!-- AI-CODE-OPTIMIZATION: language="yaml" context="configuration" -->
```yaml
# Workflows condicionais baseados em labels
name: Conditional CI

on:
  pull_request:
    types: [labeled, unlabeled, synchronize]

jobs:
  quick-check:
    if: contains(github.event.pull_request.labels.*.name, 'quick-check')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-minimal
      - run: pnpm quick:check # Apenas lint e typecheck

  full-ci:
    if: |
      !contains(github.event.pull_request.labels.*.name, 'skip-ci') &&
      !contains(github.event.pull_request.labels.*.name, 'quick-check')
    uses: ./.github/workflows/ci-complete.yml

  performance-tests:
    if: contains(github.event.pull_request.labels.*.name, 'perf-test')
    uses: ./.github/workflows/performance-tests.yml
```
<!-- /AI-CODE-OPTIMIZATION -->

## 📊 Monitoramento e Métricas

### 1. **CI Analytics Dashboard**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// scripts/ci-analytics.ts
import { writeFileSync } from "fs";
import { Octokit } from "@octokit/rest";

async function collectCIMetrics() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const runs = await octokit.actions.listWorkflowRunsForRepo({
    owner: "kodix",
    repo: "kodix-turbo",
    per_page: 100,
  });

  const metrics = {
    averageDuration: calculateAverage(runs.data.workflow_runs),
    successRate: calculateSuccessRate(runs.data.workflow_runs),
    costEstimate: estimateCost(runs.data.workflow_runs),
    bottlenecks: identifyBottlenecks(runs.data.workflow_runs),
  };

  writeFileSync("ci-metrics.json", JSON.stringify(metrics, null, 2));
}

function identifyBottlenecks(runs: WorkflowRun[]) {
  const jobDurations = new Map<string, number[]>();

  runs.forEach((run) => {
    run.jobs?.forEach((job) => {
      if (!jobDurations.has(job.name)) {
        jobDurations.set(job.name, []);
      }
      jobDurations.get(job.name)!.push(job.duration);
    });
  });

  return Array.from(jobDurations.entries())
    .map(([name, durations]) => ({
      job: name,
      avgDuration: average(durations),
      maxDuration: Math.max(...durations),
    }))
    .sort((a, b) => b.avgDuration - a.avgDuration)
    .slice(0, 5);
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 2. **Performance Tracking**

<!-- AI-CODE-OPTIMIZATION: language="yaml" context="configuration" -->
```yaml
# .github/workflows/ci-metrics.yml
name: CI Performance Metrics

on:
  workflow_run:
    workflows: ["CI Pipeline"]
    types: [completed]

jobs:
  collect-metrics:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Collect workflow metrics
        uses: actions/github-script@v7
        with:
          script: |
            const workflow_run = context.payload.workflow_run
            const duration = new Date(workflow_run.updated_at) - new Date(workflow_run.created_at)

            // Send to monitoring service
            await fetch('https://metrics.kodix.app/ci', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                workflow: workflow_run.name,
                duration: duration / 1000,
                status: workflow_run.conclusion,
                commit: workflow_run.head_sha,
                branch: workflow_run.head_branch,
              })
            })
```
<!-- /AI-CODE-OPTIMIZATION -->

## 🛠️ Ferramentas de Otimização

### 1. **Turbo Repository Cache**

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"],
      "cache": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "cache": true,
      "inputs": ["src/**", "tests/**", "*.config.*"]
    },
    "lint": {
      "outputs": [],
      "cache": true,
      "inputs": ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
    }
  }
}
```

### 2. **Nx Cloud Integration**

<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Configurar Nx Cloud para cache distribuído
npx nx g @nrwl/workspace:connect-to-nx-cloud

# Usar em CI
- name: Run affected tests
  run: npx nx affected:test --base=origin/main --head=HEAD
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### 3. **GitHub Actions Cache**

<!-- AI-CODE-OPTIMIZATION: language="yaml" context="configuration" -->
```yaml
# Cache avançado com restore keys
- name: Advanced caching
  uses: actions/cache@v3
  with:
    path: |
      ~/.pnpm-store
      node_modules
      .next/cache
      packages/*/dist
      packages/*/.turbo
    key: |
      deps-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}-${{ hashFiles('**/*.ts', '**/*.tsx') }}
    restore-keys: |
      deps-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}-
      deps-${{ runner.os }}-
```
<!-- /AI-CODE-OPTIMIZATION -->

## 📈 Resultados Esperados

### Antes da Otimização

```
Total CI Time: 15 minutes
- Install deps: 3 min
- Build: 4 min
- Lint: 2 min
- Tests: 5 min
- Deploy: 1 min
```

### Depois da Otimização

```
Total CI Time: 5 minutes
- Install deps: 30s (cached)
- Build: 1 min (incremental)
- Lint: 30s (affected only)
- Tests: 2 min (parallel + affected)
- Deploy: 1 min
```

## ✅ Checklist de Implementação

- [ ] **Análise Inicial**

  - [ ] Medir tempos atuais
  - [ ] Identificar gargalos
  - [ ] Definir metas

- [ ] **Cache Strategy**

  - [ ] Implementar cache de dependências
  - [ ] Cache de build artifacts
  - [ ] Cache de test results

- [ ] **Paralelização**

  - [ ] Dividir testes em shards
  - [ ] Jobs paralelos
  - [ ] Matrix strategy

- [ ] **Execução Condicional**

  - [ ] Path filtering
  - [ ] Label-based workflows
  - [ ] Affected tests only

- [ ] **Monitoramento**

  - [ ] CI analytics dashboard
  - [ ] Performance tracking
  - [ ] Cost monitoring

- [ ] **Ferramentas**
  - [ ] Turbo repo setup
  - [ ] Nx Cloud (opcional)
  - [ ] Docker layer caching

---

**🚀 Com estas otimizações, o pipeline CI será 3x mais rápido e 60% mais barato!**
