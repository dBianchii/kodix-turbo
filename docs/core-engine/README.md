# ⚙️ Kodix Core Engine

## 📖 Visão Geral

Esta seção documenta as **áreas funcionais do engenho básico (Core Engine)** da plataforma Kodix. Essas são as capacidades fundamentais e transversais que dão suporte a todos os [SubApps](../../subapps/README.md) e garantem a operação coesa da plataforma.

Diferente da [documentação de arquitetura](../architecture/README.md), que foca nos _padrões técnicos_, esta seção foca no **_o quê_** e no **_porquê_** de cada sistema central.

## 🚀 Áreas de Gestão do Core Engine

A plataforma é sustentada pelas seguintes áreas de gestão:

1.  **[Gestão de Times e Usuários](./01-user-and-team-management/)**

    - _Controla perfis de usuário, criação de times, membros e o sistema de convites._

2.  **[Gestão de Permissões](./02-permissions-management/)**

    - _Define o que cada usuário pode fazer através de um sistema de papéis (roles) e permissões granulares._

3.  **[Gestão de Aplicativos](./03-app-management/)**

    - _Governa o catálogo de SubApps disponíveis ("App Store") e quais estão instalados para cada time._

4.  **[Central de Notificações](./04-notification-center/)**

    - _Gerencia o envio de informações aos usuários, como e-mails de convite e alertas da plataforma._

5.  **[Sistema de Configuração](./05-configuration-system/)**

    - _Permite a personalização de cada SubApp a nível de time e de usuário._

6.  **[Infraestrutura de IA](./06-ai-infrastructure/)**
    - _Fornece as capacidades de IA como um serviço central para outros SubApps, gerenciado principalmente através do AI Studio._

---

**Nota:** A documentação para cada área está contida em seu respectivo diretório.
