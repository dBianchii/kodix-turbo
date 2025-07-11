# 🛡️ PermissionsService

- **Status:** 🟢 Ativo
- **Data de Criação:** 2025-07-01

---

## 🎯 Propósito

O `PermissionsService` é um serviço de plataforma crucial que centraliza toda a lógica de verificação de permissões e controle de acesso baseado em papéis (RBAC) para os SubApps.

## 🏛️ Enquadramento Arquitetural

O `PermissionsService` segue o **Padrão 2: Serviço de Integração (Cross-App)**, conforme definido no [guia de padrões do Service Layer](../architecture/service-layer-patterns.md).

- **Justificativa:** É um serviço de plataforma consumido por múltiplos routers e procedures em toda a aplicação para garantir o controle de acesso de forma consistente.

## 🔑 Responsabilidades Principais

- Obter as permissões de um usuário para um determinado SubApp (`getUserPermissionsForApp`).
- Construir e retornar um objeto de habilidade (`ability`) do CASL.
- Verificar se um usuário tem uma permissão específica (`can`, `cannot`).

## कंज्यूमर्स Principais

- **Qualquer `protectedProcedure` (tRPC):** Utilizado em toda a aplicação para proteger endpoints e ações que exigem permissões específicas (criar, editar, deletar recursos).

## 🔗 Links Úteis

- **[↗️ Ver Código Fonte](../../packages/api/src/services/permissions.service.ts)**
- **[📄 Ver Padrões de Implementação](../architecture/service-layer-patterns.md)**
