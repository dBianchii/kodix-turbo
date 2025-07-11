# 6. Infraestrutura de IA

Esta área do Core Engine centraliza todas as capacidades de Inteligência Artificial da plataforma, fornecendo-as como um serviço para outros SubApps.

## Funcionalidades Chave

- Gerenciamento centralizado de provedores de IA (OpenAI, Anthropic, etc.).
- Gerenciamento de modelos de linguagem (LLMs) e sua disponibilidade para cada time.
- Armazenamento seguro e criptografado de chaves de API.
- Fornece uma camada de serviço (`AiStudioService`) para que SubApps como o Chat possam consumir essas capacidades de forma segura e padronizada.

## 🚀 Arquitetura de Orquestração de Prompts

Para garantir um comportamento de IA consistente e personalizável, a plataforma utiliza um sistema de orquestração de prompts hierárquico, gerenciado pelo `AiStudioService`.

### Hierarquia do `SystemPrompt`

O `systemPrompt` final enviado para o modelo de IA é construído seguindo uma hierarquia de 3 níveis, onde cada nível subsequente tem prioridade sobre o anterior:

1.  **Nível 1: Instruções da Plataforma (Base)**

    - **Fonte:** Código-fonte (`packages/api/src/internal/services/ai-studio.service.ts`).
    - **Propósito:** Define o perfil base do assistente Kodix, regras de comportamento gerais e o formato do prompt.

2.  **Nível 2: Instruções do Time**

    - **Fonte:** Configurações do AI Studio (`appTeamConfig`).
    - **Propósito:** Permite que administradores de um time customizem o comportamento da IA para todos os membros.

3.  **Nível 3: Instruções do Usuário**
    - **Fonte:** Configurações Pessoais do AI Studio (`userAppTeamConfig`).
    - **Propósito:** Permite que cada usuário refine o comportamento da IA para suas necessidades, com prioridade máxima sobre as outras camadas.

### Fluxo de Geração do `SystemPrompt`

O processo é orquestrado pelo método `AiStudioService.getSystemPrompt`:

```mermaid
graph TD
    subgraph "AiStudioService.getSystemPrompt"
        direction LR
        A[Início] --> B{Busca Concorrente<br/>(Promise.allSettled)};
        B --> C[1. Instruções da Plataforma<br/>(Constante no código)];
        B --> D[2. Instruções do Time<br/>(Busca em userAppTeamConfigs)];
        B --> E[3. Instruções do Usuário<br/>(Busca em userAppTeamConfigs)];
        B --> F[4. Dados do Usuário e Time<br/>(Busca em users/teams)];
    end

    subgraph "AiStudioService.buildFinalPrompt"
        direction LR
        G[Combinação Final]
    end

    C --> G;
    D --> G;
    E --> G;
    F --> G;

    G --> H((SystemPrompt Final));

    style A fill:#e3f2fd,stroke:#333
    style B fill:#fff9c4,stroke:#333
    style H fill:#dcedc8,stroke:#333
```

### Engenharia de Prompt Robusta

Para evitar que as instruções "vazem" para a resposta da IA, o prompt final é estruturado com tags e títulos explícitos, criando um contrato claro para o modelo:

```html
<instructions>
  # PERFIL DO ASSISTENTE ... (Instruções da Plataforma) ... ## REGRAS DO TIME
  (Aplicar a todas as respostas) ... (Instruções do Time) ... ## REGRAS DO
  USUÁRIO (Prioridade máxima) ... (Instruções do Usuário) ...
</instructions>
```

**Nota:** Embora seja uma parte do Core Engine, a implementação principal desta área está contida no **[AI Studio SubApp](../../subapps/ai-studio/README.md)**.
