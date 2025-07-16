# 📝 AppActivityLogsService

- **Status:** 🟢 Ativo
- **Data de Criação:** 2025-07-01

---

## 🎯 Propósito

O `AppActivityLogsService` fornece uma maneira padronizada de registrar e consultar as ações realizadas pelos usuários dentro dos SubApps, criando uma trilha de auditoria.

## 🏛️ Enquadramento Arquitetural

O `AppActivityLogsService` segue o **Padrão 2: Serviço de Integração (Cross-App)**, conforme definido no [guia de padrões do Service Layer](../architecture/service-layer-patterns.md).

- **Justificativa:** É um serviço de plataforma projetado para ser consumido por qualquer SubApp que precise registrar ou consultar logs de atividade.

## 🔑 Responsabilidades Principais

- Registrar uma nova atividade (`logActivity`), incluindo o que foi alterado (`diff`).
- Consultar o histórico de atividades para uma entidade específica (`getAppActivityLogs`).

## कंज्यूमर्स Principais

- **Handlers de mutação tRPC:** Chamado após operações de criação, atualização ou exclusão para registrar o que aconteceu.
- **Componentes de UI de auditoria:** Usado para exibir o histórico de alterações de um item.

## 🔗 Links Úteis

- **[↗️ Ver Código Fonte](../../packages/api/src/services/appActivityLogs.service.ts)**
- **[📄 Ver Padrões de Implementação](../architecture/service-layer-patterns.md)**
