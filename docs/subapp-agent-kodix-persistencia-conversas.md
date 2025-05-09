# Planejamento de Persistência de Conversas do SubApp Agent

## 1. Visão Geral

Este documento descreve o modelo de dados e o fluxo de persistência das conversas geradas pelo SubApp Agent, garantindo histórico de interações para cada usuário dentro de um Workspace ativo.

## 2. Requisitos Funcionais

1. Cada usuário (User) pertence a um Workspace ativo.
2. Um usuário pode iniciar múltiplas **Conversas**.
3. Cada **Conversa** contém múltiplas **Interações** (mensagens trocadas entre usuário e agente).
4. Precisamos armazenar metadados básicos (timestamps e papel de envio) e opcionalmente campos adicionais (p. ex. embedding, logs JSON).
5. Consultas devem suportar listar conversas de um usuário, carregar histórico de uma conversa e paginar mensagens.

## 3. Entidades e Atributos

### 3.1 Workspace

- **id** (PK, varchar(30)) – Identificador único do Workspace
- **name** (varchar)
- **created_at**, **updated_at** (timestamps)

### 3.2 User

- **id** (PK, varchar(30)) – Identificador único do Usuário
- **workspace_id** (FK ⇒ Workspace.id)
- **email**, **name**
- **created_at**, **updated_at**

### 3.3 AgentConversation

- **id** (PK, varchar(30)) – Identificador único da conversa
- **user_id** (FK ⇒ User.id)
- **workspace_id** (FK ⇒ Workspace.id)
- **title** (varchar, opcional) – Título ou assunto da conversa
- **created_at**, **updated_at**

### 3.4 AgentMessage

- **id** (PK, varchar(30)) – Identificador da mensagem
- **agent_conversation_id** (FK ⇒ AgentConversation.id)
- **sender_role** (enum: 'user' | 'assistant')
- **content** (text) – Conteúdo da mensagem
- **metadata** (JSON, opcional) – Dados extras (por exemplo, embeddings ou contexto)
- **created_at** (timestamp)

## 4. Relacionamentos

```text
Workspace 1───n User
 User      1───n AgentConversation
 AgentConversation 1───n AgentMessage
Workspace 1───n AgentConversation
```

## 5. Índices e Performance

- **IDX_agentMessage_agentConversation**: índice em (`agent_conversation_id`, `created_at`) para paginação de mensagens de forma eficiente.
- **IDX_agentConversation_user**: índice em (`user_id`, `created_at`) para listar conversas recentes de um usuário.
- **FK constrains**: garantir integridade referencial entre User, Workspace, AgentConversation e AgentMessage.

## 6. Fluxo de Persistência

1. **Criar AgentConversation**: ao iniciar uma nova conversa, insere registro em `AgentConversation` com referência a `user_id` e `workspace_id`.
2. **Enviar/Receber AgentMessage**: cada interação insere registro em `AgentMessage` associado à `agent_conversation_id`.
3. **Listar AgentConversations**: consulta `AgentConversation` filtrando por `user_id` e `workspace_id` do contexto.
4. **Carregar AgentMessages**: consulta `AgentMessage` filtrando por `agent_conversation_id` com paginação por `created_at`.

## 7. Considerações de Escalabilidade e Manutenibilidade

- **Particionamento/Shard**: se o volume de mensagens crescer muito, considerar particionamento por `workspace_id` ou `agent_conversation_id`.
- **Armazenamento de metadata**: usar coluna JSON para metadados flexíveis, evitando migrações frequentes.
- **Archivamento**: estratégia de arquivar conversas antigas para tabelas ou buckets externos se ultrapassar retenção.

## 8. Próximos Passos

1. Definir esquemas Drizzle ORM para cada entidade.
2. Criar migrations e rodar `pnpm db:push`.
3. Implementar repositórios para operações CRUD.
4. Integrar chamadas no endpoint `/api/agent` para persistir mensagens em tempo real.
5. Adicionar testes automatizados para validar fluxo de persistência.
