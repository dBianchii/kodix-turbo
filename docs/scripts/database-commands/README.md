# Database Commands Documentation

Este diretório documenta os comandos de gerenciamento de banco de dados disponíveis no projeto.

## Comandos Disponíveis

### `pnpm db:status`
**Descrição**: Verificação rápida do status do banco de dados  
**Uso**: Verifica se o MySQL está rodando e se a conexão está funcionando

### `pnpm db:fix` 
**Descrição**: Correção automática de problemas comuns do banco de dados  
**Uso**: Resolve issues como conflitos de porta do Drizzle Studio e problemas de conexão

### `pnpm db:stop`
**Descrição**: Para o Drizzle Studio  
**Uso**: Encerra a sessão do Drizzle Studio que roda na porta 4983

### `pnpm db:restart`
**Descrição**: Reinicia o Drizzle Studio  
**Uso**: Para e reinicia o Drizzle Studio, útil para resolver conflitos de porta

## Comandos Relacionados

Para referência completa dos comandos de banco de dados, veja também:

- `pnpm db:studio` - Inicia o Drizzle Studio
- `pnpm db:push` - Push schema changes para o banco
- `pnpm db:seed` - Popula o banco com dados iniciais

## Troubleshooting

Se algum comando não estiver funcionando, verifique:

1. Docker MySQL está rodando: `docker ps | grep mysql`
2. Porta 4983 está livre: `lsof -ti:4983`
3. Variáveis de ambiente estão configuradas no `.env`