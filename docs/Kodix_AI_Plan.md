# Kodix AI – Arquitetura de Agentes Inteligentes

## 🧭 Visão Geral

Este módulo do Kodix é composto por dois aplicativos complementares:

---

## 🟦 1. Chat App – Interação com agentes configuráveis

### 📍 Visão

O **Chat App** é o espaço de conversa entre usuários e agentes inteligentes configurados por cada time. Ele permite a criação e navegação por sessões de chat, associadas a pastas, perfis (`ai_agent`) e modelos (`ai_model`), com todo o histórico armazenado e acessível.

### 🎯 Propósito

Fornecer ao usuário uma experiência clara, persistente e organizada de conversa com agentes, podendo alternar entre modelos, perfis e temas conforme necessidade.

### 🔧 Funcionalidades

- Listagem de sessões por pasta.
- Criação de novas sessões com escolha de agente e modelo.
- Visualização de mensagens com histórico completo.
- Respostas geradas por IA ou operador humano.
- Herança opcional de `ai_agent` e `ai_model` da pasta.

---

## 🟨 2. AI Studio – Criação e gerenciamento de agentes inteligentes

### 📍 Visão

O **AI Studio** é o ambiente onde times definem, organizam e mantêm seus agentes inteligentes. Cada agente (`ai_agent`) é um perfil que pode ter instruções específicas e acesso a uma biblioteca de arquivos (`ai_library`). O Studio também centraliza o controle de quais modelos estão disponíveis (`ai_model`) e os tokens de acesso por time (`ai_model_token`).

### 🎯 Propósito

Oferecer uma interface clara e centralizada para a criação de perfis de agente, gestão de bibliotecas de conhecimento, definição de modelos e controle de tokens de acesso, com escopo multi-time.

### 🔧 Funcionalidades

- Criação e edição de **AI Agents** com nome e instruções.
- Associação opcional de um agente a uma **ai_library** com arquivos em JSON.
- Visualização e cadastro de **modelos de IA** disponíveis no sistema.
- Gestão de **tokens de modelo** por time (`ai_model_token`).
- Organização de arquivos por time via `ai_library`.

---

## 🗃️ Tabelas e Campos

### `ai_agent`

| Campo         | Tipo          | Descrição                               |
|---------------|---------------|------------------------------------------|
| `id`          | varchar(30)   | PK                                       |
| `teamId`      | varchar(30)   | FK para `team.id`                        |
| `createdById` | varchar(30)   | FK para `user.id`                        |
| `name`        | varchar(100)  | Nome do agente                           |
| `instructions`| text          | Prompt/configuração textual              |
| `libraryId`   | varchar(30)   | FK opcional para `ai_library.id`         |
| `createdAt`   | datetime      | Data de criação                          |
| `updatedAt`   | datetime      | Data de atualização                      |

---

### `ai_library`

| Campo     | Tipo          | Descrição                                     |
|-----------|---------------|-----------------------------------------------|
| `id`      | varchar(30)   | PK                                            |
| `teamId`  | varchar(30)   | FK para `team.id`                             |
| `name`    | varchar(255)  | Nome da biblioteca                            |
| `files`   | json          | Lista de arquivos `{ url, name, type, ... }` |
| `createdAt` | datetime    | Data de criação                               |

---

### `chat_folder`

| Campo        | Tipo          | Descrição                                  |
|--------------|---------------|---------------------------------------------|
| `id`         | varchar(30)   | PK                                          |
| `teamId`     | varchar(30)   | FK para `team.id`                           |
| `createdById`| varchar(30)   | FK para `user.id`                           |
| `name`       | varchar(100)  | Nome da pasta                               |
| `aiAgentId`  | varchar(30)   | FK opcional para `ai_agent.id`              |
| `aiModelId`  | varchar(30)   | FK opcional para `ai_model.id`              |
| `createdAt`  | datetime      | Data de criação                             |
| `updatedAt`  | datetime      | Atualização automática                      |

---

### `chat_session`

| Campo         | Tipo          | Descrição                                  |
|---------------|---------------|---------------------------------------------|
| `id`          | varchar(30)   | PK                                          |
| `teamId`      | varchar(30)   | FK para `team.id`                           |
| `userId`      | varchar(30)   | FK para `user.id`                           |
| `chatFolderId`| varchar(30)   | FK opcional para `chat_folder.id`          |
| `aiAgentId`   | varchar(30)   | FK opcional para `ai_agent.id`             |
| `aiModelId`   | varchar(30)   | **FK obrigatório para `ai_model.id`**      |
| `title`       | varchar(255)  | Título da sessão                            |
| `createdAt`   | datetime      | Criado em                                   |
| `updatedAt`   | datetime      | Atualizado em                               |

---

### `chat_message`

| Campo           | Tipo          | Descrição                                  |
|-----------------|---------------|---------------------------------------------|
| `id`            | varchar(30)   | PK                                          |
| `chatSessionId` | varchar(30)   | FK para `chat_session.id`                  |
| `senderRole`    | text          | `'user'`, `'ai'`, `'human_operator'`        |
| `content`       | text          | Texto da mensagem                           |
| `metadata`      | json          | Informações adicionais                      |
| `status`        | text          | `'ok'`, `'error'`, etc.                     |
| `createdAt`     | datetime      | Criado em                                   |

---

### `ai_model`

| Campo     | Tipo          | Descrição                            |
|-----------|---------------|----------------------------------------|
| `id`      | varchar(30)   | PK                                     |
| `name`    | varchar(100)  | Nome do modelo (ex.: gpt-4o)           |
| `provider`| varchar(50)   | Nome do provedor (ex.: openai)         |
| `config`  | json          | Configuração técnica (temp, max, etc.) |
| `enabled` | boolean       | Se o modelo está ativo                 |

---

### `ai_model_token`

| Campo     | Tipo          | Descrição                            |
|-----------|---------------|----------------------------------------|
| `id`      | varchar(30)   | PK                                     |
| `teamId`  | varchar(30)   | FK para `team.id`                      |
| `modelId` | varchar(30)   | FK para `ai_model.id`                  |
| `token`   | text          | Token de acesso                       |
| `createdAt` | datetime    | Criado em                              |

---

## 🧩 Escopo Multi-Time

Todas as entidades são associadas a `teamId`, garantindo isolamento de dados entre workspaces e suporte a multi-tenancy completo.
