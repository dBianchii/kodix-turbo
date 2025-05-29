# Documentação do Projeto Kodix

## Visão Geral

O Kodix é uma plataforma de aplicativos construída sobre uma arquitetura de monorepo utilizando Turborepo. O projeto foi projetado para ser altamente escalável e de fácil manutenção, seguindo as melhores práticas de desenvolvimento de software moderno.

## Estrutura do Projeto

O monorepo está organizado em diversas seções:

### Aplicações (apps/)

- **kdx**: Aplicação web principal construída com Next.js 15

  - Utiliza React 19
  - Interface de usuário moderna com Tailwind CSS e shadcn-ui
  - Sistema de roteamento com o Next.js App Router
  - Suporte a internacionalização com next-intl
  - Integração com tRPC para chamadas de API tipadas

- **care-expo**: Aplicação móvel desenvolvida com React Native
  - Utiliza Expo como framework
  - Sistema de navegação com Expo Router
  - Chamadas de API tipadas usando tRPC
  - Interface com Tamagui

### Pacotes (packages/)

- **api**: Definição do router tRPC v11

  - Endpoints organizados por domínio (usuário, equipe, autenticação, app)
  - Middlewares para proteção de rotas
  - Procedimentos personalizados

- **auth**: Sistema de autenticação

  - Baseado em sessões de banco de dados
  - Utiliza oslo (anteriormente lucia-auth)
  - Suporte a múltiplos provedores de autenticação

- **db**: Acesso tipado ao banco de dados

  - Utiliza Drizzle ORM
  - Banco de dados MySQL
  - Schemas organizados por domínio
  - Utilitários para operações comuns

- **ui**: Biblioteca de componentes UI para aplicações web

  - Baseada no shadcn-ui
  - Componentes reutilizáveis e estilizados

- **shared**: Código reutilizável entre aplicações

  - Utilitários comuns
  - Funções auxiliares

- **validators**: Esquemas de validação com Zod

  - Validações compartilhadas entre frontend e backend
  - Principalmente para as APIs tRPC

- **react-email**: Templates de email

  - Visualização fácil dos templates
  - Utiliza a biblioteca react-email

- **locales**: Arquivos de localização para i18n

  - Configurados para o contexto da aplicação @kdx/kdx

- **dayjs**: Configuração estendida do dayjs

  - Centralização de plugins
  - Configurações de formatação de data/hora

- **trpc-cli**: Ferramenta CLI para criação de endpoints
  - Geração automática de código boilerplate para novos endpoints no @kdx/api

### Ferramentas (tooling/)

- **eslint**: Configurações compartilhadas de eslint

  - Presets finos e granulares

- **prettier**: Configuração compartilhada do prettier

  - Formatação consistente em todo o projeto

- **tailwind**: Configuração compartilhada do tailwind

  - Temas e plugins centralizados

- **typescript**: Configurações tsconfig reutilizáveis
  - Extensíveis por todos os pacotes e aplicações

## Tecnologias Principais

### Frontend

- React 19
- Next.js 15
- React Native com Expo
- Tailwind CSS / shadcn-ui / Tamagui
- TanStack Query para gerenciamento de estado
- Zustand para gerenciamento de estado global
- Framer Motion para animações
- Internacionalização com next-intl

### Backend

- tRPC para API tipada
- Drizzle ORM para acesso ao banco de dados
- MySQL como banco de dados principal
- Autenticação com oslo
- Cron jobs para tarefas programadas

### DevOps e Ferramentas

- Turborepo para gerenciamento de monorepo
- PNPM como gerenciador de pacotes
- TypeScript para tipagem estática
- ESLint e Prettier para formatação de código
- Vitest para testes

## Banco de Dados

> **📚 Para um guia completo sobre banco de dados, consulte [banco-de-dados-kodix.md](./banco-de-dados-kodix.md)**

O projeto utiliza **Drizzle ORM** com **MySQL** para gerenciamento de dados. Principais características:

- **ORM Moderno**: Drizzle oferece type safety completo e performance otimizada
- **Estrutura Organizada**: Schemas separados por domínio (auth, user, team, apps)
- **Repositórios**: Camada de abstração para operações de banco de dados
- **Migrações**: Sistema de migrações automático para desenvolvimento e produção

### Comandos Essenciais de Banco de Dados

```bash
pnpm db:push      # Aplica schemas em desenvolvimento
pnpm db:studio    # Interface visual para gerenciar dados
pnpm db:seed      # Popula banco com dados de teste
pnpm db:generate  # Gera migrações para produção
pnpm db:migrate   # Aplica migrações em produção
```

## Configuração do Ambiente

### Pré-requisitos

- Node.js versão 20.18.1
- PNPM versão 9.14.2 ou superior
- MySQL instalado e configurado

### Variáveis de Ambiente

O projeto utiliza variáveis de ambiente para configurações sensíveis. Principais variáveis:

- `MYSQL_URL`: URL de conexão com o banco de dados MySQL
- `AUTH_GOOGLE_CLIENT_ID`: ID do cliente Google para autenticação
- `AUTH_GOOGLE_CLIENT_SECRET`: Segredo do cliente Google para autenticação
- `RESEND_API_KEY`: Chave da API Resend para envio de emails
- `NEXT_PUBLIC_POSTHOG_HOST`: Host do PostHog para analytics
- `NEXT_PUBLIC_POSTHOG_KEY`: Chave do PostHog para analytics
- `UPSTASH_REDIS_REST_URL`: URL do Redis Upstash para cache
- `UPSTASH_REDIS_REST_TOKEN`: Token de acesso ao Redis Upstash
- `OPENAI_API_KEY`: Chave da API OpenAI (para funcionalidades de IA)

### Instalação e Execução

1. **Instalação de dependências**

   ```bash
   pnpm i
   ```

2. **Configuração de variáveis de ambiente**

   ```bash
   cp .env.example .env
   # Edite o arquivo .env com seus valores
   ```

3. **Iniciar a aplicação principal**

   ```bash
   pnpm dev:kdx
   ```

4. **Aplicar schema do banco de dados**

   ```bash
   pnpm db:push
   ```

5. **Semear o banco de dados com dados iniciais**
   ```bash
   pnpm db:seed
   ```

## Comandos Úteis

### Gerais

- `pnpm build`: Constrói todos os pacotes e aplicações
- `pnpm clean`: Limpa arquivos temporários no diretório raiz
- `pnpm clean:workspaces`: Limpa arquivos temporários em todos os workspaces
- `pnpm format`: Verifica formatação em todos os arquivos
- `pnpm format:fix`: Corrige problemas de formatação
- `pnpm lint`: Executa linting em todos os pacotes
- `pnpm lint:fix`: Corrige problemas de linting
- `pnpm typecheck`: Verifica tipagem em todos os pacotes
- `pnpm test`: Executa testes em todos os pacotes

### Desenvolvimento

- `pnpm dev:kdx`: Inicia o aplicativo web principal
- `pnpm dev:email`: Inicia o servidor de visualização de emails
- `pnpm db:push`: Aplica as alterações de schema ao banco de dados
- `pnpm db:seed`: Semeia o banco de dados com dados iniciais
- `pnpm db:studio`: Inicia o Drizzle Studio para gerenciamento do banco de dados
- `pnpm trpc:new`: Gera um novo endpoint tRPC
- `pnpm turbo gen init`: Cria um novo pacote @kdx

## Modelo de Dados

O projeto utiliza Drizzle ORM com MySQL para gerenciamento de dados. Os principais modelos incluem:

### Usuários e Autenticação

- **user**: Informações básicas do usuário
- **session**: Sessões de autenticação ativas
- **authenticator**: Credenciais de diferentes provedores

### Equipes e Organizações

- **team**: Grupos de usuários colaborando
- **teamMember**: Associação usuário-equipe com roles
- **teamInvite**: Convites pendentes para equipes

### Aplicativos

- **Módulo KodixCare**: Gestão completa de cuidados de saúde
- **Calendar**: Sistema de eventos e lembretes
- **Todo**: Lista de tarefas com categorização
- **Agent**: Chat com IA integrado

> Para criar novos modelos e trabalhar com banco de dados, consulte o [Guia de Banco de Dados](./banco-de-dados-kodix.md).

## Estrutura de APIs

As APIs são organizadas utilizando tRPC com roteadores divididos por domínios:

- `auth`: Endpoints relacionados à autenticação
- `user`: Gerenciamento de usuários e perfis
- `team`: Operações relacionadas a equipes
- `app`: Funcionalidades específicas de aplicativos (care, todos, calendar)

## Permissões e Segurança

O sistema implementa um modelo de permissões baseado em:

- Autenticação com tokens de sessão
- Middlewares tRPC para proteção de rotas
- Validação de entradas com Zod
- Operações de banco de dados tipadas e seguras

## Autenticação no Kodix

O sistema de autenticação do Kodix é projetado para ser seguro e flexível, suportando múltiplos provedores de autenticação e integrando-se perfeitamente com os subapps da plataforma. A autenticação é baseada em sessões de banco de dados e utiliza o Oslo (anteriormente conhecido como Lucia-auth) para gerenciar sessões e autenticações.

### Como Funciona

1. **Sessões de Banco de Dados**: As sessões são armazenadas no banco de dados, permitindo autenticação persistente e segura. Isso garante que os usuários possam retomar suas sessões de onde pararam, mesmo após fechar o navegador ou reiniciar o dispositivo.

2. **Múltiplos Provedores de Autenticação**: O Kodix suporta autenticação através de diversos provedores, como Google, Facebook, e outros, facilitando o login dos usuários com suas contas existentes.

3. **Integração com SubApps**: Cada subapp dentro do Kodix pode reutilizar o sistema de autenticação centralizado. Isso é feito através de middlewares tRPC que protegem as rotas e garantem que apenas usuários autenticados possam acessar funcionalidades específicas.

4. **Tokens de Sessão**: A autenticação é gerida através de tokens de sessão, que são validados em cada requisição para garantir que o usuário ainda está autenticado.

5. **Validação e Segurança**: Todas as entradas de autenticação são validadas usando Zod, garantindo que apenas dados válidos sejam processados. Além disso, as operações de banco de dados são tipadas e seguras, prevenindo injeções de SQL e outros ataques comuns.

### Implementação nos SubApps

Os subapps no Kodix utilizam o sistema de autenticação centralizado, o que significa que não precisam implementar suas próprias soluções de autenticação. Eles simplesmente configuram as rotas protegidas e utilizam os middlewares fornecidos para garantir que apenas usuários autenticados possam acessar suas funcionalidades.

## Fluxo de Desenvolvimento

1. **Criação de novos recursos**:

   - Defina modelos de dados em `packages/db/src/schema`
   - Crie endpoints tRPC em `packages/api/src/trpc/routers`
   - Implemente componentes UI em `packages/ui` ou diretamente nas aplicações
   - Adicione validações em `packages/validators`

2. **Manutenção**:
   - Execute `pnpm lint:fix` e `pnpm format:fix` antes de commits
   - Verifique tipagem com `pnpm typecheck`
   - Execute testes com `pnpm test`

## Recursos Adicionais

### Documentação Interna

- [Guia de Banco de Dados](./banco-de-dados-kodix.md) - Padrões e convenções para banco de dados
- [Guia de Desenvolvimento](./guia-desenvolvimento-kodix.md) - Práticas de desenvolvimento
- [Criando SubApps](./creating-subapps.md) - Como criar novos módulos

### Documentação Externa

- [Turborepo](https://turborepo.org) - Documentação do Turborepo
- [Next.js](https://nextjs.org/docs) - Documentação do Next.js
- [tRPC](https://trpc.io/docs) - Documentação do tRPC
- [Drizzle](https://orm.drizzle.team/docs/overview) - Documentação do Drizzle ORM
- [Expo](https://docs.expo.dev) - Documentação do Expo
