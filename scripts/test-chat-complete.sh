
#!/bin/bash

# 🧪 Script Completo de Testes do Chat SubApp
# Executa TODOS os testes: Backend + Frontend
# Seguindo padrões da documentação de testes

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configurações
BACKEND_TEST_DIR="packages/api/src/trpc/routers/app/chat/__tests__"
FRONTEND_TEST_DIR="apps/kdx/src/app/[locale]/(authed)/apps/chat/__tests__"

echo -e "${BLUE}🚀 [CHAT TESTS COMPLETE] Executando TODOS os testes do Chat SubApp${NC}"
echo -e "${BLUE}📁 Backend: ${BACKEND_TEST_DIR}${NC}"
echo -e "${BLUE}📁 Frontend: ${FRONTEND_TEST_DIR}${NC}"
echo "=============================================================="

# Função para log colorido
log_info() {
    echo -e "${BLUE}ℹ️  [INFO] $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ [SUCCESS] $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  [WARNING] $1${NC}"
}

log_error() {
    echo -e "${RED}❌ [ERROR] $1${NC}"
}

log_backend() {
    echo -e "${PURPLE}🔧 [BACKEND] $1${NC}"
}

log_frontend() {
    echo -e "${YELLOW}🎨 [FRONTEND] $1${NC}"
}

# Contadores
TOTAL_SUITES=0
PASSED_SUITES=0
FAILED_SUITES=0
TOTAL_INDIVIDUAL_TESTS=0

# Função para executar testes
run_test_suite() {
    local suite_type=$1
    local test_pattern=$2
    local description=$3
    local category=$4
    
    echo ""
    if [ "$category" = "backend" ]; then
        log_backend "Executando: $description"
    else
        log_frontend "Executando: $description"
    fi
    echo "Pattern: $test_pattern"
    
    # Capturar saída do vitest
    if output=$(pnpm vitest run "$test_pattern" --reporter=verbose 2>&1); then
        log_success "$description - PASSOU"
        PASSED_SUITES=$((PASSED_SUITES + 1))
        
        # Extrair número de testes individuais
        individual_tests=$(echo "$output" | grep -o "[0-9]\+ passed" | head -1 | grep -o "[0-9]\+")
        if [ -n "$individual_tests" ]; then
            TOTAL_INDIVIDUAL_TESTS=$((TOTAL_INDIVIDUAL_TESTS + individual_tests))
            echo "   → $individual_tests testes individuais"
        fi
    else
        log_error "$description - FALHOU"
        FAILED_SUITES=$((FAILED_SUITES + 1))
        echo "Saída do erro:"
        echo "$output" | tail -10
    fi
    
    TOTAL_SUITES=$((TOTAL_SUITES + 1))
}

# Verificar se diretórios existem
if [ ! -d "$BACKEND_TEST_DIR" ]; then
    log_error "Diretório de testes backend não encontrado: $BACKEND_TEST_DIR"
    exit 1
fi

if [ ! -d "$FRONTEND_TEST_DIR" ]; then
    log_error "Diretório de testes frontend não encontrado: $FRONTEND_TEST_DIR"
    exit 1
fi

log_info "Estrutura de testes encontrada"

echo ""
echo "=============================================================="
echo -e "${PURPLE}🔧 EXECUTANDO TESTES DO BACKEND${NC}"
echo "=============================================================="

# BACKEND TESTS
# 1. Testes de Configuração (CI Config)
run_test_suite "config" \
    "$BACKEND_TEST_DIR/ci-config.test.ts" \
    "CI Configuration Tests" \
    "backend"

# 2. Testes de Service Layer (Backend)
run_test_suite "service-layer" \
    "$BACKEND_TEST_DIR/service-layer.test.ts" \
    "Service Layer Integration (Backend)" \
    "backend"

# 3. Testes de Streaming
run_test_suite "streaming" \
    "$BACKEND_TEST_DIR/streaming.test.ts" \
    "Streaming Tests (Vercel AI)" \
    "backend"

# 4. Testes de Integração Completa
run_test_suite "integration" \
    "$BACKEND_TEST_DIR/chat-integration.test.ts" \
    "Chat Integration Tests" \
    "backend"

# 5. Testes de Integração Simples
run_test_suite "simple" \
    "$BACKEND_TEST_DIR/simple-integration.test.ts" \
    "Simple Integration Tests" \
    "backend"

# 6. Testes de Regressão - Welcome Flow
run_test_suite "welcome-regression" \
    "$BACKEND_TEST_DIR/welcome-flow-regression.test.ts" \
    "Welcome Flow Regression Tests" \
    "backend"

echo ""
echo "=============================================================="
echo -e "${YELLOW}🎨 EXECUTANDO TESTES DO FRONTEND${NC}"
echo "=============================================================="

# FRONTEND TESTS
# 7. Testes de Service Layer (Frontend)
run_test_suite "service-layer-fe" \
    "$FRONTEND_TEST_DIR/integration/service-layer.test.ts" \
    "Service Layer Integration (Frontend)" \
    "frontend"

# 8. Testes de API Structure
run_test_suite "api" \
    "$FRONTEND_TEST_DIR/integration/api.test.ts" \
    "API Structure Tests" \
    "frontend"

# 9. Testes de Componentes
run_test_suite "components" \
    "$FRONTEND_TEST_DIR/components/model-selector.test.tsx" \
    "Component Logic Tests" \
    "frontend"

# 10. Testes de Hooks
run_test_suite "hooks" \
    "$FRONTEND_TEST_DIR/hooks/useChatPreferredModel.test.ts" \
    "Hook Logic Tests" \
    "frontend"

# 11. Testes de Timing (Post-Navigation)
run_test_suite "timing" \
    "$FRONTEND_TEST_DIR/integration/post-navigation-timing.test.ts" \
    "Post-Navigation Timing Tests" \
    "frontend"

# 12. Testes de Padrões de Navegação
run_test_suite "navigation" \
    "$FRONTEND_TEST_DIR/integration/navigation-patterns.test.ts" \
    "Navigation Patterns Tests" \
    "frontend"

# 12. Testes de Sincronização de Títulos - REMOVIDO
# run_test_suite "title-sync" \
#     "$FRONTEND_TEST_DIR/integration/title-sync.test.ts" \
#     "Title Synchronization Tests" \
#     "frontend"

echo ""
echo "=============================================================="
echo -e "${BLUE}📊 RELATÓRIO FINAL COMPLETO - CHAT SUBAPP${NC}"
echo "=============================================================="

# Calcular percentual de sucesso
if [ $TOTAL_SUITES -gt 0 ]; then
    success_percentage=$((PASSED_SUITES * 100 / TOTAL_SUITES))
else
    success_percentage=0
fi

echo ""
log_info "RESUMO GERAL:"
echo "🔧 Backend Suites: 5"
echo "🎨 Frontend Suites: 7"
echo "📊 Total de Suites: $TOTAL_SUITES"
echo "📈 Total de Testes Individuais: $TOTAL_INDIVIDUAL_TESTS"
echo ""

if [ $FAILED_SUITES -eq 0 ]; then
    log_success "TODAS AS SUITES PASSARAM! ($PASSED_SUITES/$TOTAL_SUITES)"
    log_success "SUCESSO: $success_percentage%"
else
    log_warning "SUITES COM SUCESSO: $PASSED_SUITES/$TOTAL_SUITES ($success_percentage%)"
    log_error "SUITES COM FALHAS: $FAILED_SUITES"
fi

echo ""
log_info "COBERTURA POR CATEGORIA:"
echo "🔧 Backend: Configuração, Service Layer, Streaming, Integração"
echo "🎨 Frontend: Service Layer, API, Componentes, Hooks"

# Verificar se há cobertura
if [ "$1" = "--coverage" ]; then
    echo ""
    log_info "Executando análise de cobertura..."
    pnpm vitest run "$BACKEND_TEST_DIR/**/*.test.ts" "$FRONTEND_TEST_DIR/**/*.test.{ts,tsx}" --coverage.enabled --coverage.reporter=text
fi

echo ""
echo "=============================================================="
echo -e "${GREEN}🎉 Execução completa de testes concluída!${NC}"
echo "=============================================================="

# Informações adicionais
echo ""
log_info "COMANDOS ÚTEIS:"
echo "• pnpm test:chat:watch    (modo watch)"
echo "• pnpm test:chat:ui       (interface visual)"
echo "• pnpm test:chat:coverage (com cobertura)"

echo ""
log_info "TESTES EXECUTADOS:"
echo "✅ CI Configuration Tests"
echo "✅ Service Layer Integration (Backend + Frontend)"
echo "✅ Streaming Tests (Vercel AI)"
echo "✅ Chat Integration Tests"
echo "✅ Simple Integration Tests"
echo "✅ API Structure Tests"
echo "✅ Component Logic Tests"
echo "✅ Hook Logic Tests"

# Status de saída baseado nos resultados
if [ $FAILED_SUITES -eq 0 ]; then
    exit 0
else
    exit 1
fi 