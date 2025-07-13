<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="true" summary-threshold="low" -->category: architecture
complexity: intermediate
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: fullstack
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# Modelo de Configuração Hierárquica do Kodix

**Data:** 2025-06-28  
**Autor:** KodixAgent  
**Status:** ✅ Ativo
**Escopo:** Arquitetura de toda a plataforma

---

## 1. Resumo Executivo

Este documento descreve o modelo de configuração hierárquica de 3 níveis adotado pelo Kodix. O objetivo é fornecer um sistema de configuração que equilibra a estabilidade e o versionamento de configurações base (definidas em código) com a flexibilidade de personalização dinâmica por times e usuários (definidas via UI e armazenadas no banco de dados).

Este modelo é a fonte única da verdade para como as configurações devem ser estruturadas, acessadas e aplicadas em toda a plataforma.

## 2. A Hierarquia de 3 Níveis

As configurações no Kodix operam em três níveis distintos, com as mais específicas tendo precedência sobre as mais gerais.

```mermaid
graph TD
    subgraph "Níveis de Configuração"
        direction LR
        A[<b>Nível 1: Plataforma</b><br/><i>(Estático, no Código)</i>] --> B[<b>Nível 2: Time</b><br/><i>(Dinâmico, no DB)</i>]
        B --> C[<b>Nível 3: Usuário</b><br/><i>(Dinâmico, no DB)</i>]
    end

    C --> D((✔️ Configuração Final Aplicada))

    style A fill:#f3e5f5,stroke:#333
    style B fill:#e3f2fd,stroke:#333
    style C fill:#e8f5e9,stroke:#333
    style D fill:#ffebee,stroke:#c62828,stroke-width:2px
```

### Nível 1: Configuração da Plataforma/SubApp (Padrão Base)

Este é o nível mais baixo e fundamental. Ele define as configurações padrão e imutáveis para cada SubApp ou para a plataforma Kodix como um todo.

- **Onde Vive:** Diretamente no código-fonte, em um arquivo `config.ts` dentro do pacote do respectivo SubApp ou App. (ex: `apps/kdx/src/config.ts` ou `packages/subapp-chat/src/config.ts`).
- **Como é Gerenciado:** Versionado com Git. As alterações são feitas através de Pull Requests e entram em vigor com um novo deploy.
- **Natureza:** Estática e fortemente tipada.

**Exemplo de Implementação (`packages/subapp-ai-studio/src/config.ts`):**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// O uso de 'as const' garante imutabilidade e tipos literais precisos.
export const aiStudioConfig = {
  platformInstructions: {
    template:
      "Você é um assistente de IA da Kodix. Responda sempre em português do Brasil.",
    enabled: true,
  },
  featureFlags: {
    enableAdvancedAnalysis: false, // Flag para um recurso em beta
  },
} as const;
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Nível 2: Configuração do Time (Override do Admin)

Este nível permite que administradores de um time personalizem as configurações para todos os membros daquele time, sobrepondo os padrões do Nível 1.

- **Onde Vive:** No banco de dados, na tabela `appTeamConfigs`.
- **Como é Gerenciado:** Dinamicamente, através da interface de administração do time na aplicação.
- **Natureza:** Dinâmica. As alterações são aplicadas em tempo real.

### Nível 3: Configuração do Usuário (Preferências Pessoais)

Este é o nível mais específico, permitindo que cada usuário personalize sua própria experiência, sobrepondo as configurações do Time (Nível 2) e da Plataforma (Nível 1).

- **Onde Vive:** No banco de dados, na tabela `userAppTeamConfigs`.
- **Como é Gerenciado:** Dinamicamente, através da tela de configurações de perfil do próprio usuário.
- **Natureza:** Dinâmica e pessoal.

## 3. Estratégia de Merging e Precedência

Para obter a configuração final a ser aplicada, a aplicação deve buscar as configurações dos três níveis e mesclá-las. A regra de precedência é clara: **Usuário > Time > Plataforma**.

Um serviço centralizado, como o `AppConfigService`, é responsável por abstrair essa complexidade.

**Exemplo de Lógica de Merging (Pseudocódigo):**

<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
async function getFinalAppConfig(
  appId: string,
  userId: string,
  teamId: string,
) {
  // 1. Obter a configuração base estática do código
  const platformConfig = await import(`@/packages/${appId}/config`).then(
    (m) => m.default,
  );

  // 2. Obter as configurações dinâmicas do banco de dados
  const teamConfig = await db.getAppTeamConfig(appId, teamId);
  const userConfig = await db.getUserAppTeamConfig(appId, userId, teamId);

  // 3. Mesclar com a ordem de precedência correta
  const finalConfig = {
    ...platformConfig, // Nível 1: Padrões
    ...teamConfig, // Nível 2: Sobrepõe o Nível 1
    ...userConfig, // Nível 3: Sobrepõe o Nível 1 e 2
  };

  return finalConfig;
}
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 4. Vantagens Deste Modelo

1.  **Fonte da Verdade Clara:** As configurações padrão vivem no código, facilitando o rastreamento e a auditoria de mudanças base.
2.  **Segurança e Estabilidade:** Previne que configurações críticas sejam alteradas acidentalmente via UI. Apenas overrides são permitidos.
3.  **Flexibilidade Controlada:** Oferece personalização para times e usuários sem comprometer a integridade da configuração padrão.
4.  **Desacoplamento:** Cada SubApp pode definir sua própria estrutura de configuração (`config.ts`), mantendo a autonomia.
