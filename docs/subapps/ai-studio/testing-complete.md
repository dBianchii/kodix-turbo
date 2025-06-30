# 🧪 Testes CI - AI Studio SubApp

## 📖 Visão Geral

Este documento detalha a suíte de testes e a estratégia de validação para o **AI Studio SubApp**. Como o AI Studio funciona como um "SubApp Core" que serve principalmente de backend para outras funcionalidades, seus testes são focados em garantir a robustez, segurança e correção da sua camada de serviço e APIs.

A principal estratégia de teste é a **validação de integração de API via `createCaller`**, que nos permite testar a lógica do backend de ponta a ponta de forma rápida e isolada.

## 🚀 Comandos Rápidos de Teste

### **Execução com Um Comando** ⭐ **PADRÃO RECOMENDADO**

```bash
# Executa todos os testes relacionados ao pacote da API, que contém a lógica do AI Studio
pnpm test --filter=@kdx/api
```

## 🧪 Estrutura de Testes

A estrutura de testes do AI Studio se concentra no pacote `@kdx/api`.

```
packages/api/src/
├── __tests__/
│   └── trpc/
│       ├── ai-studio.integration.test.ts # 🧪 Testes de integração (padrão principal)
│       └── ... (outros testes)
└── internal/
    └── services/
        └── ai-studio.service.ts
```

### 1. **Testes de Integração de API** (`ai-studio.integration.test.ts`)

- **Objetivo:** Validar os endpoints tRPC do AI Studio, garantindo que toda a cadeia de lógica (router -> handler -> service -> repository) funcione como esperado.
- **Ferramenta Principal:** `appRouter.createCaller`
- **Padrão de Referência:** **[🧪 Padrão de Teste de Integração de API](../../tests/api-integration-testing-pattern.md)**

## 🚨 Verificações Críticas

Os testes do AI Studio devem garantir:

1.  **Isolamento por Time:** Nenhum teste deve permitir que um `teamId` acesse recursos de outro.
2.  **Validação de Acesso via Service Layer:** Outros SubApps (como o Chat) devem acessar o AI Studio apenas através do `AiStudioService`. Os testes de integração garantem que os endpoints expostos funcionem corretamente para esse consumo.
3.  **Contrato da API:** Os testes validam que a estrutura de dados retornada pelos endpoints permanece consistente.

## 🔄 Integração com CI/CD

- Os testes do AI Studio são executados automaticamente no pipeline de CI do GitHub Actions sempre que há alterações no pacote `@kdx/api`.
- A falha em qualquer teste de integração do AI Studio bloqueará o merge de um pull request.

## 🔗 Recursos Relacionados

### **Documentação de Testes Geral**

- **[📚 Arquitetura de Testes](../../tests/README.md)** - Visão geral da arquitetura de testes do Kodix.
- **[🧪 Padrão de Teste de Integração de API](../../tests/api-integration-testing-pattern.md)** - O padrão principal usado para testar o AI Studio.

### **Documentação do AI Studio**

- **[README Principal](./README.md)** - Visão geral do SubApp.
- **[Arquitetura do AI Studio](./ai-studio-architecture.md)** - Detalhes da arquitetura do backend e frontend.
- **[Referência da API](./api-reference.md)** - Documentação dos endpoints.

## 🎉 Conclusão

A estratégia de testes do AI Studio é focada em garantir a confiabilidade da sua camada de API, que é a fundação para todas as funcionalidades de IA no Kodix. O uso de testes de integração com `createCaller` nos permite ter alta confiança na lógica do backend com testes rápidos e eficientes.
