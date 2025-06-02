# Como Inicializar o Banco de Dados do Zero

Este guia te ajudará a configurar e inicializar o banco de dados MySQL do projeto Kodix completamente do zero.

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Node.js e pnpm instalados
- Projeto Kodix clonado

## 🚀 Passo a Passo

### 1. Configurar Variáveis de Ambiente

Crie o arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Banco de dados MySQL
MYSQL_URL="mysql://root:password@localhost:3306/kodix"

# Configurações específicas do MySQL
MYSQL_ROOT_PASSWORD=password
MYSQL_DATABASE=kodix
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_HOST=localhost
MYSQL_PORT=3306

# Para desenvolvimento
NODE_ENV=development

# Outras variáveis que podem ser necessárias
DATABASE_URL="mysql://root:password@localhost:3306/kodix"
```

### 2. Reset Completo do Banco (se necessário)

Se você já tem um banco rodando e quer começar do zero:

```bash
# Parar e remover containers e volumes existentes
cd packages/db-dev
docker-compose down -v
```

### 3. Iniciar o MySQL

```bash
# Iniciar MySQL com Docker
cd packages/db-dev
docker-compose up -d mysql
```

Isso criará um container MySQL limpo com:

- **Porta**: 3306
- **Database**: kodix
- **Usuário**: root
- **Senha**: password

### 4. Aplicar o Schema

```bash
# Voltar para o diretório do banco
cd ../../packages/db

# Aplicar todas as tabelas e relacionamentos
pnpm push
```

Este comando:

- Aguarda o MySQL estar pronto
- Lê todos os arquivos de schema
- Cria todas as tabelas e índices
- Aplica relacionamentos

### 5. Popular com Dados Iniciais

```bash
# Executar seeds
pnpm seed
```

O processo de seed criará:

- **16 AI Providers** (OpenAI, Anthropic, Google, Mistral, etc.)
- **21 AI Models** distribuídos pelos providers
- Estruturas base para teams, users e aplicações

### 6. Verificar Instalação

```bash
# Abrir Drizzle Studio para visualizar dados
pnpm studio
```

Acesse: https://local.drizzle.studio

## 📊 O que foi Criado

### Tabelas Principais

- **users** - Usuários do sistema
- **teams** - Equipes/organizações
- **team_members** - Relacionamento usuários-equipes

### Aplicações

- **AI Studio**: Providers e modelos de IA
- **Chat**: Sistema de conversas com IA
- **Calendar**: Agendamentos e eventos
- **KodixCare**: Sistema de saúde (pacientes, consultas)
- **Todos**: Sistema de tarefas

### AI Providers Configurados

| Provider   | Modelos | Descrição                                 |
| ---------- | ------- | ----------------------------------------- |
| OpenAI     | 4       | GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-3.5 |
| Anthropic  | 3       | Claude 3.5 Sonnet, Haiku, Opus            |
| Google     | 3       | Gemini 1.5 Pro, Flash, Pro                |
| Mistral AI | 3       | Mistral Large, 7B, Mixtral 8x7B           |
| Cohere     | 2       | Command R+, Command R                     |
| Groq       | 2       | Llama 3 70B, Mixtral 8x7B                 |
| Outros     | 8       | Perplexity, xAI, Ollama, etc.             |

## 🔧 Comandos Úteis

### Desenvolvimento

```bash
# Aplicar mudanças no schema
cd packages/db && pnpm push

# Visualizar dados
cd packages/db && pnpm studio

# Executar seeds novamente
cd packages/db && pnpm seed

# Executar seeds específicos de AI Studio
cd packages/db && pnpm db:seed:ai-studio
```

### Gerenciamento do MySQL

```bash
# Parar MySQL
cd packages/db-dev && docker-compose stop mysql

# Iniciar MySQL
cd packages/db-dev && docker-compose start mysql

# Reset completo (⚠️ apaga todos os dados)
cd packages/db-dev && docker-compose down -v
cd packages/db-dev && docker-compose up -d mysql
```

### Monitoramento

```bash
# Ver logs do MySQL
cd packages/db-dev && docker-compose logs -f mysql

# Status dos containers
cd packages/db-dev && docker-compose ps

# Conectar diretamente ao MySQL
docker exec -it kodix-db-mysql-1 mysql -u root -p kodix
```

## 🚨 Troubleshooting

### Erro: "Missing MYSQL_URL"

**Solução**: Certifique-se de que o arquivo `.env` existe na raiz do projeto com a variável `MYSQL_URL` configurada.

### Erro: "Connection refused"

**Solução**:

1. Verifique se o MySQL está rodando: `docker ps`
2. Aguarde alguns segundos para o MySQL inicializar completamente
3. Execute: `cd packages/db && pnpm wait-for-db`

### Conflitos de Schema

**Solução**: Reset completo do banco

```bash
cd packages/db-dev && docker-compose down -v
cd packages/db-dev && docker-compose up -d mysql
cd ../../packages/db && pnpm push
```

### Seeds Falham

**Solução**:

1. Verifique se o schema foi aplicado: `pnpm push`
2. Verifique conectividade: `pnpm wait-for-db`
3. Execute seeds novamente: `pnpm seed`

## 🌐 Recursos Disponíveis

Após a inicialização, você terá acesso a:

- **Drizzle Studio**: https://local.drizzle.studio
- **MySQL**: localhost:3306
- **Redis**: localhost:6379 (se iniciado)

## 📝 Próximos Passos

1. **Criar Teams e Usuários**: Use a aplicação web para criar teams
2. **Configurar AI Studio**: Execute `seedAiStudioWithTeam(teamId, userId)`
3. **Configurar APIs**: Substitua tokens de exemplo por chaves reais
4. **Ambiente de Produção**: Configure variáveis para produção

## 🎯 Estrutura de Desenvolvimento

O banco está organizado de forma modular:

```
packages/db/src/
├── schema/
│   ├── users.ts          # Autenticação
│   ├── teams.ts          # Organizações
│   └── apps/
│       ├── ai-studio.ts  # IA e modelos
│       ├── chat.ts       # Conversas
│       ├── calendar.ts   # Agendamentos
│       ├── kodixCare.ts  # Sistema saúde
│       └── todos.ts      # Tarefas
├── seed/                 # Scripts de população
└── repositories/         # Lógica de acesso a dados
```

## ✅ Verificação Final

Para confirmar que tudo está funcionando:

1. ✅ MySQL rodando: `docker ps | grep mysql`
2. ✅ Tabelas criadas: Abra o Drizzle Studio
3. ✅ Seeds executados: Verifique AI Providers no Studio
4. ✅ Conectividade: Execute `cd packages/db && pnpm wait-for-db`

**🎉 Banco inicializado com sucesso!** Agora você pode desenvolver com confiança.
