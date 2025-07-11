# ⚙️ Kodix Core Service

## 📖 Visão Geral

Esta seção documenta a arquitetura e o planejamento do **Core Service** da plataforma Kodix. O Core Service representa a evolução arquitetural para centralizar o acesso às entidades e lógicas de negócio fundamentais do sistema (usuários, times, permissões, configurações) através de um gateway único e seguro.

Diferente da [documentação de arquitetura geral](../architecture/README.md), que foca nos _padrões técnicos_, esta seção concentra-se nos planos de implementação e na documentação específica da iniciativa do `CoreService`.

---

## 🚀 Planejamento Arquitetural

A implementação do Core Service seguirá uma abordagem incremental. Os documentos a seguir detalham a visão de longo prazo e o plano de ação para o primeiro componente.

1.  **[Proposta de Arquitetura: `CoreService`](./planning/future-core-service.md)**

    - **Propósito:** Descreve a visão de longo prazo para um `CoreService` completo, que atuará como o único gateway para todas as entidades e lógicas de negócio centrais da plataforma.

2.  **[Plano de Implementação: `PlatformConfigRepository`](../../database/planning/platform-config-repository-plan.md)**
    - **Propósito:** Detalha o primeiro passo pragmático em nossa jornada: a criação de um repositório focado em prover configurações de plataforma a partir de arquivos estáticos. Embora seja um repositório (`@kdx/db`), sua criação valida o padrão de isolamento de fontes de dados que será consumido pelo futuro `CoreService` (`@kdx/api`).

---

**Nota:** Este diretório é a fonte de verdade para a **visão arquitetural** do Core Service. Os planos de implementação para componentes específicos serão localizados nos diretórios de documentação dos pacotes correspondentes (ex: `docs/database/` para repositórios, `docs/api/` para futuros serviços).
