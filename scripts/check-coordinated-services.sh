#!/bin/bash

echo "🔄 VERIFICAÇÃO DE SERVIÇOS COORDENADOS"
echo "====================================="

# Verificar se está no diretório correto
if [ ! -f "package.json" ] || [ ! -d "packages/db-dev" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto Kodix"
    exit 1
fi

echo ""
echo "📊 STATUS DOS SERVIÇOS COORDENADOS:"
echo ""

# 1. Verificar se há processos do Turbo/pnpm rodando
echo "1️⃣ Processos de desenvolvimento:"
TURBO_PROCESSES=$(ps aux | grep -E "(turbo|pnpm.*dev)" | grep -v grep | wc -l)
if [ "$TURBO_PROCESSES" -gt 0 ]; then
    echo "✅ Encontrados $TURBO_PROCESSES processos de desenvolvimento rodando"
    ps aux | grep -E "(turbo|pnpm.*dev)" | grep -v grep | head -3
else
    echo "❌ Nenhum processo de desenvolvimento encontrado"
fi

echo ""

# 2. Verificar servidor Next.js
echo "2️⃣ Servidor Next.js:"
if lsof -i :3000 >/dev/null 2>&1; then
    echo "✅ Servidor rodando na porta 3000"
else
    echo "❌ Servidor não está rodando na porta 3000"
fi

echo ""

# 3. Verificar Docker containers
echo "3️⃣ Containers Docker:"
cd packages/db-dev
CONTAINERS=$(docker-compose ps -q | wc -l)
RUNNING_CONTAINERS=$(docker-compose ps --filter "status=running" -q | wc -l)

if [ "$RUNNING_CONTAINERS" -gt 0 ]; then
    echo "✅ $RUNNING_CONTAINERS containers rodando de $CONTAINERS total"
    docker-compose ps --format "table {{.Name}}\t{{.Status}}"
else
    echo "❌ Nenhum container rodando"
fi

cd ../..

echo ""

# 4. Teste de conectividade MySQL
echo "4️⃣ Conectividade MySQL:"
if nc -z localhost 3306 2>/dev/null; then
    echo "✅ MySQL acessível na porta 3306"
else
    echo "❌ MySQL não acessível na porta 3306"
fi

echo ""

# 5. Diagnóstico e recomendações
echo "🎯 DIAGNÓSTICO:"
echo "==============="

if [ "$TURBO_PROCESSES" -gt 0 ] && [ "$RUNNING_CONTAINERS" -gt 0 ]; then
    echo "✅ TUDO OK: Serviços coordenados funcionando corretamente!"
    echo ""
    echo "📱 Para acessar:"
    echo "   - Aplicação: http://localhost:3000"
    echo "   - Drizzle Studio: pnpm db:studio"
    
elif [ "$TURBO_PROCESSES" -eq 0 ] && [ "$RUNNING_CONTAINERS" -eq 0 ]; then
    echo "⏹️  PARADO: Nenhum serviço rodando"
    echo ""
    echo "🚀 Para iniciar tudo:"
    echo "   pnpm dev:kdx"
    
elif [ "$TURBO_PROCESSES" -gt 0 ] && [ "$RUNNING_CONTAINERS" -eq 0 ]; then
    echo "⚠️  INCONSISTENTE: Servidor rodando mas Docker parado"
    echo ""
    echo "🔧 Soluções:"
    echo "   1. Parar servidor: pkill -f 'next dev'"
    echo "   2. Reiniciar coordenado: pnpm dev:kdx"
    
elif [ "$TURBO_PROCESSES" -eq 0 ] && [ "$RUNNING_CONTAINERS" -gt 0 ]; then
    echo "⚠️  INCONSISTENTE: Docker rodando mas servidor parado"
    echo ""
    echo "🔧 Soluções:"
    echo "   1. Parar Docker: cd packages/db-dev && docker-compose stop"
    echo "   2. Reiniciar coordenado: pnpm dev:kdx"
    
else
    echo "🤔 Estado inesperado - verifique manualmente"
fi

echo ""
echo "📚 Comandos úteis:"
echo "   - Verificar status: ./scripts/check-coordinated-services.sh" 
echo "   - Iniciar tudo: pnpm dev:kdx"
echo "   - Parar tudo: Ctrl+C (no terminal do pnpm dev:kdx)"
echo "   - Reset completo: cd packages/db-dev && docker-compose down -v" 