# 🤖 AiStudioService

- **Status:** 🟢 Ativo
- **Data de Criação:** 2025-07-01

---

## 🎯 Propósito

O `AiStudioService` é o **gateway central** para todas as funcionalidades de Inteligência Artificial no Kodix. Ele encapsula a lógica de negócio para gerenciar provedores, modelos, tokens e configurações de IA, servindo como a única fonte de verdade para outros SubApps.

## 🏛️ Enquadramento Arquitetural

O `AiStudioService` segue o **Padrão 2: Serviço de Integração (Cross-App)**, conforme definido no [guia de padrões do Service Layer](../architecture/service-layer-patterns.md).

- **Justificativa:** Sua API é estável e projetada para ser consumida de forma segura por outros SubApps (como o Chat) para acessar a infraestrutura de IA.

## 🔑 Responsabilidades Principais

- Buscar e validar modelos de IA disponíveis para um time.
- Recuperar e decriptografar tokens de provedor de forma segura.
- Fornecer as "Instruções de Time" para contextualizar os prompts.
- Testar a conectividade e a validade dos modelos.

## कंज्यूमर्स Principais

- **`Chat SubApp`**: Para obter a lista de modelos, validar o modelo selecionado e obter o token para iniciar o streaming.

## 🔗 Links Úteis

- **[↗️ Ver Código Fonte](../../packages/api/src/internal/services/ai-studio.service.ts)**
- **[📄 Ver Padrões de Implementação](../architecture/service-layer-patterns.md)**
