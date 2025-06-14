# Drizzle Studio - Guia Completo

O Drizzle Studio é uma ferramenta visual para explorar e gerenciar o banco de dados MySQL do projeto Kodix. Este guia te ensina como usar todas as funcionalidades disponíveis.

## 🚀 Como Acessar

### Iniciar o Studio

```bash
# Navegar para o diretório do banco
cd packages/db

# Iniciar o Drizzle Studio
pnpm studio
```

### Acessar no Navegador

Após executar o comando, acesse:

- **URL**: https://local.drizzle.studio
- **Porta padrão**: 4983

## 📊 Interface Principal

### Dashboard Inicial

Ao abrir o Studio, você verá:

1. **Lista de Tabelas** (lado esquerdo)

   - Todas as tabelas do banco organizadas por categoria
   - Ícones indicando tipo de tabela (principal, relacionamento, etc.)

2. **Área de Trabalho** (centro)

   - Visualização de dados da tabela selecionada
   - Editor de queries SQL
   - Formulários de inserção/edição

3. **Painel de Informações** (lado direito)
   - Schema da tabela
   - Relacionamentos
   - Índices e constraints

## 🗃️ Explorando Tabelas

### Tabelas Principais do Kodix

#### Autenticação

- **`users`** - Usuários do sistema
- **`accounts`** - Contas OAuth dos usuários
- **`sessions`** - Sessões ativas

#### Organização

- **`teams`** - Equipes/organizações
- **`team_members`** - Membros das equipes

#### AI Studio

- **`ai_provider`** - Provedores de IA (OpenAI, Anthropic, etc.)
- **`ai_model`** - Modelos de IA disponíveis
- **`ai_team_provider_token`** - Tokens de API por equipe

#### Chat

- **`chat_folder`** - Pastas de organização
- **`chat_conversation`** - Conversas
- **`chat_message`** - Mensagens das conversas

#### Calendar

- **`calendar_event`** - Eventos e agendamentos
- **`calendar_event_attendee`** - Participantes dos eventos

#### KodixCare (Sistema de Saúde)

- **`patients`** - Pacientes
- **`appointments`** - Consultas médicas

#### Todos

- **`todo`** - Tarefas e lembretes

### Visualizar Dados de uma Tabela

1. **Selecionar a tabela** na lista esquerda
2. **Ver registros** na área central
3. **Navegar páginas** usando controles inferiores
4. **Filtrar dados** usando a barra de busca

## ✏️ Editando Dados

### Inserir Novo Registro

1. Selecione a tabela desejada
2. Clique no botão **"+ Add Row"**
3. Preencha os campos no formulário
4. Clique em **"Save"**

#### Exemplo: Criar um Novo Usuário

```
Tabela: users
Campos:
- name: "João Silva"
- email: "joao@exemplo.com"
- role: "USER"
- (id, createdAt, updatedAt são preenchidos automaticamente)
```

### Editar Registro Existente

1. Clique no registro que deseja editar
2. Modifique os campos necessários
3. Clique em **"Save Changes"**

### Deletar Registro

1. Selecione o registro
2. Clique no ícone de **lixeira** 🗑️
3. Confirme a exclusão

## 🔍 Pesquisa e Filtros

### Pesquisa Simples

Na barra de pesquisa da tabela:

```
# Buscar por nome
João

# Buscar por email
@exemplo.com

# Buscar por ID específico
abc123def456
```

### Filtros Avançados

1. Clique no ícone de **filtro** 🔽
2. Selecione o campo para filtrar
3. Escolha o operador (=, !=, contains, etc.)
4. Digite o valor
5. Clique em **"Apply Filter"**

#### Exemplos de Filtros

```bash
# Usuários com role ADMIN
Campo: role
Operador: equals
Valor: ADMIN

# Eventos de hoje
Campo: createdAt
Operador: greater than
Valor: 2024-01-01

# Conversas com mais de 10 mensagens
Campo: messageCount
Operador: greater than
Valor: 10
```

## 🔗 Explorando Relacionamentos

### Ver Relacionamentos

1. Selecione uma tabela
2. Clique em um registro
3. No painel direito, veja **"Related Records"**
4. Clique em um relacionamento para navegar

#### Exemplo: Navegar de User para Teams

```
users → team_members → teams
│       │               │
│       └─ role         └─ name, description
└─ name, email
```

### Relacionamentos Disponíveis

#### Users (Usuários)

- **→ teams** (via team_members): Equipes do usuário
- **→ chat_conversations**: Conversas iniciadas
- **→ patients**: Pacientes criados (se KodixCare)

#### Teams (Equipes)

- **→ users** (via team_members): Membros da equipe
- **→ ai_team_provider_token**: Tokens de IA configurados
- **→ chat_folders**: Pastas de chat organizadas

#### Chat Conversations

- **→ chat_messages**: Mensagens da conversa
- **→ chat_folder**: Pasta que organiza a conversa
- **→ users**: Participantes

## 🛠️ Queries SQL Customizadas

### Executar Query Personalizada

1. Clique na aba **"Query"** no topo
2. Digite sua query SQL
3. Clique em **"Run Query"**

#### Queries Úteis

##### Ver Usuários e suas Equipes

```sql
SELECT
  u.name as usuario,
  u.email,
  t.name as equipe,
  tm.role as papel
FROM users u
JOIN team_members tm ON u.id = tm.userId
JOIN teams t ON tm.teamId = t.id
ORDER BY u.name;
```

##### Estatísticas de AI Providers

```sql
SELECT
  ap.name as provider,
  COUNT(am.id) as total_modelos,
  COUNT(atpt.id) as equipes_configuradas
FROM ai_provider ap
LEFT JOIN ai_model am ON ap.id = am.providerId
LEFT JOIN ai_team_provider_token atpt ON ap.id = atpt.providerId
GROUP BY ap.id, ap.name
ORDER BY total_modelos DESC;
```

##### Conversas Mais Ativas

```sql
SELECT
  cc.title as conversa,
  COUNT(cm.id) as total_mensagens,
  MAX(cm.createdAt) as ultima_mensagem
FROM chat_conversation cc
LEFT JOIN chat_message cm ON cc.id = cm.conversationId
GROUP BY cc.id, cc.title
HAVING total_mensagens > 0
ORDER BY total_mensagens DESC
LIMIT 10;
```

##### Eventos do Calendário Próximos

```sql
SELECT
  ce.title as evento,
  ce.startDate as inicio,
  ce.endDate as fim,
  COUNT(cea.id) as participantes
FROM calendar_event ce
LEFT JOIN calendar_event_attendee cea ON ce.id = cea.eventId
WHERE ce.startDate >= NOW()
GROUP BY ce.id
ORDER BY ce.startDate ASC
LIMIT 5;
```

## 📈 Monitoramento e Análise

### Ver Estatísticas das Tabelas

1. Selecione uma tabela
2. No painel direito, veja **"Table Info"**
3. Informações incluem:
   - Total de registros
   - Tamanho da tabela
   - Índices utilizados
   - Relacionamentos

### Identificar Tabelas Grandes

Query para ver tamanho das tabelas:

```sql
SELECT
  table_name as tabela,
  table_rows as registros,
  round(((data_length + index_length) / 1024 / 1024), 2) as tamanho_mb
FROM information_schema.tables
WHERE table_schema = 'kodix'
ORDER BY (data_length + index_length) DESC;
```

## 🚨 Troubleshooting

### Studio Não Abre

**Problemas comuns:**

1. **Porta já em uso**

   ```bash
   # Verificar processo na porta 4983
   lsof -i :4983

   # Matar processo se necessário
   kill -9 [PID]
   ```

2. **MySQL não conecta**

   ```bash
   # Verificar se MySQL está rodando
   cd packages/db-dev && docker-compose ps

   # Testar conexão
   cd packages/db && pnpm wait-for-db
   ```

3. **Variáveis de ambiente**

   ```bash
   # Verificar se .env existe
   ls -la ../../.env

   # Testar com env específico
   cd packages/db && pnpm with-env echo $MYSQL_URL
   ```

### Erro ao Salvar Dados

1. **Verificar constraints**: Campos obrigatórios preenchidos?
2. **Verificar relacionamentos**: IDs referenciados existem?
3. **Verificar tipos**: Dados no formato correto?

### Studio Lento

1. **Limitar resultados**: Use filtros para reduzir dados
2. **Verificar índices**: Queries complexas precisam de índices
3. **Reiniciar Studio**: `Ctrl+C` e executar novamente

## 🎯 Melhores Práticas

### Desenvolvimento Seguro

1. **Sempre fazer backup** antes de mudanças grandes
2. **Usar queries SELECT** antes de UPDATE/DELETE
3. **Testar em desenvolvimento** antes de produção
4. **Documentar mudanças** importantes

### Performance

1. **Usar filtros** em tabelas grandes
2. **Limitar resultados** com LIMIT nas queries
3. **Criar índices** para campos pesquisados frequentemente
4. **Monitorar uso** de recursos

### Organização

1. **Nomear queries** salvas de forma clara
2. **Organizar por módulos** (auth, chat, calendar, etc.)
3. **Documentar relacionamentos** complexos
4. **Manter schema atualizado** conforme mudanças

## 🔧 Comandos Úteis do Studio

```bash
# Iniciar Studio
cd packages/db && pnpm studio

# Studio com porta específica
cd packages/db && pnpm with-env drizzle-kit studio --port 5000

# Verificar conexão antes do Studio
cd packages/db && pnpm wait-for-db && pnpm studio

# Studio em background (não bloqueia terminal)
cd packages/db && nohup pnpm studio > studio.log 2>&1 &

# Parar Studio em background
ps aux | grep drizzle-kit
kill [PID]
```

## 🌐 Atalhos do Teclado

| Atalho         | Ação                  |
| -------------- | --------------------- |
| `Ctrl + S`     | Salvar mudanças       |
| `Ctrl + Enter` | Executar query        |
| `Ctrl + F`     | Buscar na tabela      |
| `Escape`       | Cancelar edição       |
| `Tab`          | Navegar entre campos  |
| `Ctrl + Z`     | Desfazer (em queries) |

## 📚 Recursos Adicionais

### Links Úteis

- **Documentação Drizzle Studio**: https://orm.drizzle.team/drizzle-studio/overview
- **Drizzle ORM**: https://orm.drizzle.team
- **MySQL Documentation**: https://dev.mysql.com/doc

### Integração com IDE

Para usar com VS Code:

1. Instale a extensão "MySQL"
2. Configure conexão: `mysql://root:password@localhost:3306/kodix`
3. Use tanto VS Code quanto Studio conforme necessidade

## ✅ Checklist de Uso Diário

- [ ] Verificar MySQL rodando: `docker ps | grep mysql`
- [ ] Conectar Studio: `cd packages/db && pnpm studio`
- [ ] Verificar dados críticos: users, teams, ai_providers
- [ ] Monitorar tabelas grandes: chat_messages, calendar_events
- [ ] Backup antes de mudanças importantes
- [ ] Testar queries em desenvolvimento primeiro

**🎉 Agora você está pronto para usar o Drizzle Studio como um profissional!**
