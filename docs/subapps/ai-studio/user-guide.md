# Guia de Usuário - AI Studio

## 📋 Visão Geral

Este guia é sua referência completa para configurar, usar e solucionar problemas no **AI Studio**, o centro de controle para todas as integrações de Inteligência Artificial do Kodix.

---

## 🚀 Configuração Essencial (5 Minutos)

Para uma nova equipe começar a usar as IAs no Kodix, siga estes 4 passos essenciais no AI Studio.

### 1. Adicionar Provedores

- **O que é?** Provedores são as empresas de IA (OpenAI, Anthropic, etc.).
- **Ação:** Vá para `Configuração Geral` > `Provedores` e adicione os provedores que sua equipe usará.

### 2. Cadastrar Tokens de API

- **O que é?** Tokens são as "senhas" para usar as APIs dos provedores.
- **Ação:** Vá para `Principal` > `Tokens`, selecione um provedor e adicione sua chave de API. Ela será criptografada e armazenada com segurança.

### 3. Habilitar Modelos para a Equipe

- **O que é?** Modelos são as "versões" da IA (ex: `gpt-4o`, `claude-3-haiku`).
- **Ação:** Vá para `Principal` > `Modelos Habilitados` e ative os modelos que sua equipe poderá usar. Você também pode definir um modelo padrão para toda a equipe.

### 4. Definir Instruções da Equipe (Opcional)

- **O que é?** Instruções que definem o comportamento padrão da IA para todos na equipe (ex: "Sempre responda em português").
- **Ação:** Vá para `Principal` > `Instruções da Equipe`, escreva as diretrizes e ative-as.

---

## ⚙️ Funcionalidades Principais (Seções)

Aqui está um detalhamento de cada seção disponível na barra lateral do AI Studio.

### Seção de Personalização

#### Minhas Instruções

- **Propósito:** Definir instruções **pessoais** para a IA, que sobrescrevem as instruções da equipe.
- **Uso:** Ideal para preferências individuais, como "Responda de forma concisa" ou "Prefiro exemplos em Python".

### Seção Principal (Uso Diário)

#### Instruções da Equipe

- **Propósito:** Definir o comportamento base da IA para toda a equipe.
- **Hierarquia:** Nível 2 (abaixo das instruções pessoais).

#### Tokens

- **Propósito:** Gerenciar as chaves de API.
- **Segurança:** As chaves são sempre criptografadas no banco e mascaradas na UI.

#### Modelos Habilitados

- **Propósito:** Controlar o acesso da equipe aos modelos de IA.
- **Funcionalidades:** Ativar/desativar modelos, definir um padrão para a equipe e reordenar a prioridade de fallback com drag-and-drop.

#### Agentes

- **Propósito:** Criar "personalidades" de IA especializadas para tarefas específicas.
- **Uso:** Um agente pode ser configurado com instruções próprias e associado a uma biblioteca de conhecimento.

#### Bibliotecas

- **Propósito:** Agrupar arquivos e dados para fornecer contexto aos Agentes.
- **Status:** Atualmente, suporta a configuração de metadados. O upload de arquivos está em desenvolvimento.

### Seção de Configuração Geral (Administrativo)

#### Provedores

- **Propósito:** Cadastrar as empresas de IA que o Kodix irá consumir.
- **Uso:** Adicionar novos provedores (ex: Google, Mistral) ou configurar URLs de proxy.

#### Modelos (Sistema)

- **Propósito:** Gerenciar a lista de **todos** os modelos de IA que existem no sistema, independentemente de estarem habilitados para uma equipe ou não.
- **Uso:** Adicionar novos modelos que se tornaram disponíveis em um provedor ou ajustar configurações técnicas globais.

---

## 🔄 Integrações com Outros SubApps

### Comunicação com o SubApp de Chat

O AI Studio é a "fonte da verdade" para o SubApp de Chat. A comunicação entre eles é feita da seguinte forma:

1.  **O Chat USA o `AiStudioService`:** Para manter a arquitetura padronizada, o Chat consome o `AiStudioService` no seu backend para buscar as configurações necessárias de forma segura e tipada.
2.  **Hierarquia de Instruções:** Quando um usuário envia uma mensagem no Chat, o `PromptBuilderService` monta o prompt final para a IA, seguindo uma hierarquia estrita de prioridade:
    1.  **Nível 3 (Mais alto):** Instruções Pessoais (definidas no AI Studio).
    2.  **Nível 2:** Instruções da Equipe (definidas no AI Studio).
    3.  **Nível 1 (Base):** Instruções do Agente (se um agente for selecionado).
3.  **Seleção de Modelo:** A lista de modelos disponível no seletor do Chat é alimentada diretamente pela lista de "Modelos Habilitados" da equipe no AI Studio.

---

## 🚨 Troubleshooting (Problemas Comuns)

### "O modelo que eu quero não aparece no Chat"

1.  **Verifique em `Modelos Habilitados`:** Confirme que o modelo está ativado para a sua equipe.
2.  **Verifique os Tokens:** Certifique-se de que o provedor associado ao modelo (ex: OpenAI) tem um token de API válido cadastrado na seção `Tokens`.
3.  **Teste o Modelo:** Na seção `Modelos Habilitados`, use o botão de teste para validar a conectividade.

### "Fiz uma alteração no AI Studio mas não refletiu no Chat"

- **Causa:** O sistema usa um cache de 5 minutos para otimizar a performance.
- **Solução Rápida:** Crie uma nova sessão de chat. Isso força a busca das configurações mais recentes.

### "Não consigo salvar, o JSON está inválido"

- **Sintoma:** Ao editar configurações avançadas de um modelo, ocorre um erro de JSON inválido.
- **Solução:** Use um validador de JSON online (como o [JSONLint](https://jsonlint.com/)) para corrigir a sintaxe antes de salvar. Uma melhoria para o editor de JSON está planejada.

### "Não consigo fazer upload de arquivos para as Bibliotecas"

- **Status:** Esta funcionalidade ainda está em desenvolvimento. Atualmente, a seção de Bibliotecas permite apenas a configuração de metadados.
