#!/bin/bash

echo "🔍 DEBUG CHAT - Diagnóstico Simplificado"
echo "========================================"

# 1. Verificar se o servidor está rodando
echo ""
echo "1️⃣ Status do servidor:"
if pgrep -f "next dev" > /dev/null; then
    echo "✅ Servidor Next.js está rodando"
else
    echo "❌ Servidor Next.js NÃO está rodando"
    echo "   Execute: pnpm dev:kdx"
fi

# 2. Verificar se o banco está acessível
echo ""
echo "2️⃣ Status do banco de dados:"
if [ -z "$MYSQL_URL" ]; then
    echo "❌ MYSQL_URL não configurada no .env"
else
    echo "✅ MYSQL_URL configurada"
fi

# 3. Verificar estrutura de apps
echo ""
echo "3️⃣ Estrutura de SubApps:"
if [ -d "apps/kdx/src/app/[locale]/(authed)/apps/chat" ]; then
    echo "✅ Chat app encontrado"
else
    echo "❌ Chat app não encontrado"
fi

if [ -d "apps/kdx/src/app/[locale]/(authed)/apps/ai-studio" ]; then
    echo "✅ AI Studio app encontrado"
else
    echo "❌ AI Studio app não encontrado"
fi

# 4. Verificar API endpoints
echo ""
echo "4️⃣ Endpoints críticos:"
if [ -f "apps/kdx/src/app/api/chat/stream/route.ts" ]; then
    echo "✅ API de streaming (/api/chat/stream) encontrada"
else
    echo "❌ API de streaming não encontrada"
fi

# 5. Verificar middleware
echo ""
echo "5️⃣ Middleware de dependências:"
if grep -q "chatWithDependenciesMiddleware" packages/api/src/trpc/middlewares.ts; then
    echo "✅ Middleware de dependências encontrado"
else
    echo "❌ Middleware de dependências não encontrado"
fi

# 6. Verificar Service Layer
echo ""
echo "6️⃣ Service Layer (AI Studio):"
if [ -f "packages/api/src/internal/services/ai-studio.service.ts" ]; then
    echo "✅ AiStudioService encontrado"
else
    echo "❌ AiStudioService não encontrado"
fi

echo ""
echo "🎯 SUGESTÕES DE DEBUG:"
echo "1. Verificar logs do servidor durante tentativa de chat"
echo "2. Acessar /apps para verificar se Chat e AI Studio estão instalados"
echo "3. Verificar DevTools do navegador para erros HTTP"
echo "4. Verificar se tokens de IA estão configurados no AI Studio"
echo ""
echo "Para mais detalhes, acesse: http://localhost:3000/apps" 