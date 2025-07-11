#!/bin/bash

# Script para verificar imports incorretos de tRPC no projeto Kodix
# Uso: ./scripts/check-trpc-imports.sh

echo "🔍 Verificando imports incorretos de tRPC..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de erros
ERRORS=0

# Verificar imports incorretos de { api }
echo "📋 Verificando imports de { api } from '~/trpc/react'..."
API_IMPORTS=$(grep -r "import.*{ api }.*from.*['\"]~/trpc/react['\"]" apps/ packages/ --include="*.ts" --include="*.tsx" --exclude-dir=care-expo 2>/dev/null)

if [ ! -z "$API_IMPORTS" ]; then
    echo -e "${RED}❌ ERRO: Encontrados imports incorretos de { api }:${NC}"
    echo "$API_IMPORTS"
    echo ""
    echo -e "${YELLOW}💡 CORREÇÃO: Use 'import { useTRPC } from \"~/trpc/react\"' em vez disso${NC}"
    echo ""
    ERRORS=$((ERRORS + 1))
fi

# Verificar uso de .useMutation() direto
echo "📋 Verificando uso de .useMutation() direto..."
DIRECT_MUTATIONS=$(grep -r "\.useMutation(" apps/ packages/ --include="*.ts" --include="*.tsx" --exclude-dir=care-expo 2>/dev/null | grep -v "useMutation(trpc\." | grep -v "@tanstack/react-query")

if [ ! -z "$DIRECT_MUTATIONS" ]; then
    echo -e "${RED}❌ ERRO: Encontrado uso direto de .useMutation():${NC}"
    echo "$DIRECT_MUTATIONS"
    echo ""
    echo -e "${YELLOW}💡 CORREÇÃO: Use 'useMutation(trpc.app.method.mutationOptions())' em vez disso${NC}"
    echo ""
    ERRORS=$((ERRORS + 1))
fi

# Verificar uso de .useQuery() direto
echo "📋 Verificando uso de .useQuery() direto..."
DIRECT_QUERIES=$(grep -r "\.useQuery(" apps/ packages/ --include="*.ts" --include="*.tsx" --exclude-dir=care-expo 2>/dev/null | grep -v "useQuery(trpc\." | grep -v "@tanstack/react-query")

if [ ! -z "$DIRECT_QUERIES" ]; then
    echo -e "${RED}❌ ERRO: Encontrado uso direto de .useQuery():${NC}"
    echo "$DIRECT_QUERIES"
    echo ""
    echo -e "${YELLOW}💡 CORREÇÃO: Use 'useQuery(trpc.app.method.queryOptions())' em vez disso${NC}"
    echo ""
    ERRORS=$((ERRORS + 1))
fi

# Verificar uso de api.useUtils()
echo "📋 Verificando uso de api.useUtils()..."
API_UTILS=$(grep -r "api\.useUtils(" apps/ packages/ --include="*.ts" --include="*.tsx" --exclude-dir=care-expo 2>/dev/null)

if [ ! -z "$API_UTILS" ]; then
    echo -e "${RED}❌ ERRO: Encontrado uso de api.useUtils():${NC}"
    echo "$API_UTILS"
    echo ""
    echo -e "${YELLOW}💡 CORREÇÃO: Use 'useQueryClient()' from '@tanstack/react-query' em vez disso${NC}"
    echo ""
    ERRORS=$((ERRORS + 1))
fi

# Verificar se há imports de createTRPCReact
echo "📋 Verificando imports de createTRPCReact..."
CREATE_TRPC_REACT=$(grep -r "createTRPCReact" apps/ packages/ --include="*.ts" --include="*.tsx" --exclude-dir=care-expo 2>/dev/null)

if [ ! -z "$CREATE_TRPC_REACT" ]; then
    echo -e "${RED}❌ ERRO: Encontrado uso de createTRPCReact (padrão v11):${NC}"
    echo "$CREATE_TRPC_REACT"
    echo ""
    echo -e "${YELLOW}💡 CORREÇÃO: O projeto usa tRPC v10 com createTRPCContext${NC}"
    echo ""
    ERRORS=$((ERRORS + 1))
fi

# Resultado final
echo "=================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Todos os imports de tRPC estão corretos!${NC}"
    exit 0
else
    echo -e "${RED}❌ Encontrados $ERRORS problemas de arquitetura tRPC${NC}"
    echo ""
    echo -e "${YELLOW}📚 Para mais informações, consulte:${NC}"
    echo "   - .cursor-rules/kodix-rules.md (seção tRPC Architecture Rules)"
    echo "   - docs/architecture/Architecture_Standards.md (seção Padrões tRPC)"
    echo ""
    exit 1
fi 