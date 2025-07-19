# 🔧 Drizzle Studio - Guia de Troubleshooting

**Criado**: 2025-01-18  
**Atualizado**: 2025-01-18  
**Propósito**: Resolver problemas comuns do Drizzle Studio

---

## 🚀 **Comandos Rápidos**

### **Verificação Rápida**

```bash
pnpm db:status      # Verifica se está rodando
pnpm db:fix         # Script automático de correção
```

### **Controle Manual**

```bash
pnpm db:studio      # Iniciar
pnpm db:stop        # Parar
pnpm db:restart     # Reiniciar
```

### **Troubleshooting Completo**

```bash
./scripts/fix-drizzle-studio.sh
```

---

## 🔍 **Diagnóstico Manual**

### **1. Verificar Status**

```bash
# Verificar se processo está rodando
lsof -ti:4983

# Verificar containers do banco
docker ps | grep kodix

# Testar resposta HTTP
curl -s "https://local.drizzle.studio/" | head -10
```

### **2. Verificar Database**

```bash
# Testar conectividade MySQL
nc -z localhost 3306

# Verificar containers
cd packages/db-dev && docker-compose ps

# Iniciar containers se necessário
docker-compose up -d
```

### **3. Verificar Schema**

```bash
# Build do schema
cd packages/db && pnpm build

# Verificar erros TypeScript
pnpm typecheck
```

---

## 🛠️ **Problemas Comuns**

### **❌ Problema: "Port 4983 already in use"**

```bash
# Solução
kill $(lsof -ti:4983)
pnpm db:studio
```

### **❌ Problema: "Cannot connect to database"**

```bash
# Solução
cd packages/db-dev
docker-compose restart
cd ../..
pnpm db:studio
```

### **❌ Problema: "Schema relation error"**

```bash
# Solução
cd packages/db
pnpm build  # Verificar erros
pnpm db:push  # Aplicar schema
pnpm db:studio
```

### **❌ Problema: "Environment variable missing"**

```bash
# Verificar .env
grep MYSQL_URL .env

# Se não existir, criar:
echo 'MYSQL_URL="mysql://root:password@localhost:3306/kodix"' >> .env
```

---

## 🔄 **Sequência de Reset Completo**

Quando nada funciona, use esta sequência:

```bash
# 1. Parar tudo
kill $(lsof -ti:4983) 2>/dev/null
cd packages/db-dev && docker-compose down

# 2. Limpar e reconstruir
cd ../..
pnpm clean:workspaces
pnpm install

# 3. Verificar schema
cd packages/db && pnpm build

# 4. Iniciar database
cd ../db-dev && docker-compose up -d

# 5. Aguardar MySQL
sleep 10

# 6. Aplicar schema
cd ../..
pnpm db:push

# 7. Iniciar Drizzle Studio
pnpm db:studio

# 8. Verificar
sleep 5
curl -s "https://local.drizzle.studio/" | grep -q "Drizzle Studio" && echo "✅ Funcionando" || echo "❌ Erro"
```

---

## 📊 **Checklist de Verificação**

### **Antes de Iniciar**

- [ ] Containers Docker rodando
- [ ] MySQL acessível na porta 3306
- [ ] Variável `MYSQL_URL` configurada
- [ ] Schema sem erros TypeScript

### **Após Iniciar**

- [ ] Processo na porta 4983
- [ ] URL `https://local.drizzle.studio/` respondendo
- [ ] Interface carregando sem erros
- [ ] Tabelas visíveis no Studio

---

## 🚨 **Casos Específicos**

### **Erro: "TypeError: Cannot read properties of undefined"**

```bash
# Problema no schema - aplicar manualmente
cd packages/db-dev && docker-compose up -d
# Aplicar correções SQL se necessário
pnpm db:push
```

### **Erro: "Foreign key constraint fails"**

```bash
# Limpar dados conflitantes
docker exec -it kodix-db-mysql-1 mysql -u root -ppassword -e "
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE problema_table;
SET FOREIGN_KEY_CHECKS = 1;
" kodix
```

### **Erro: "Connection refused"**

```bash
# Verificar se MySQL está realmente rodando
docker exec -it kodix-db-mysql-1 mysql -u root -ppassword -e "SELECT 1;" kodix
```

---

## 📝 **Logs e Debug**

### **Localização dos Logs**

```bash
# Log do Drizzle Studio
tail -f /tmp/drizzle-studio.log

# Logs do Docker
docker logs kodix-db-mysql-1
docker logs kodix-db-redis-1
```

### **Debug Avançado**

```bash
# Executar Drizzle Studio com debug
cd packages/db
MYSQL_URL="mysql://root:password@localhost:3306/kodix" \
pnpm drizzle-kit studio --verbose
```

---

## 🎯 **Acesso Final**

Quando tudo estiver funcionando:

**URL**: `https://local.drizzle.studio/`  
**Porta**: 4983  
**Database**: kodix (MySQL)

---

## 📚 **Referências**

- **Script Automático**: `./scripts/fix-drizzle-studio.sh`
- **Comandos pnpm**: `pnpm db:fix`, `pnpm db:status`
- **Configuração**: `packages/db/drizzle.config.ts`
- **Schema**: `packages/db/src/schema/`

---

**💡 Dica**: Use sempre `pnpm db:fix` primeiro - resolve 90% dos problemas automaticamente!
