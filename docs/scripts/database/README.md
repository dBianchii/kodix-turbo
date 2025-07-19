# Scripts Studio-Safe para Banco de Dados

Esta documentação explica como criar e usar scripts de banco de dados que mantêm o Drizzle Studio ativo durante operações no banco.

## 🎯 Problema Resolvido

Operações diretas no MySQL causavam conflitos com o Drizzle Studio, resultando em erros como:

```
Error: Can't add new command when connection is in closed state
Unexpected error happened 😕
```

## ✅ Solução

Use o **cliente Drizzle oficial do projeto** em vez de conexões MySQL diretas para manter o Studio funcionando.

📄 **Ver metodologia completa**: [studio-safe-database-scripts.md](./studio-safe-database-scripts.md)