#!/bin/bash

# Script para verificar e gerenciar o servidor Kodix
# Uso: ./check-server.sh [PORT] [ACTION]
# PORT: porta a verificar (padrão: 3000)
# ACTION: check|stop|restart (padrão: check)

PORT=${1:-3000}
ACTION=${2:-check}

check_server() {
    echo "🔍 Verificando se o servidor está rodando na porta $PORT..."
    
    # Verificar se a porta está em uso
    if lsof -i :$PORT 2>/dev/null | grep -q LISTEN; then
        echo "✅ Servidor está rodando na porta $PORT"
        
        # Mostrar detalhes do processo
        PROCESS_INFO=$(lsof -i :$PORT 2>/dev/null | grep LISTEN)
        PID=$(echo $PROCESS_INFO | awk '{print $2}')
        echo "📋 PID: $PID"
        echo "📋 Processo: $PROCESS_INFO"
        
        # Testar se responde HTTP
        echo "🌐 Testando resposta HTTP..."
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT 2>/dev/null || echo "000")
        if [ "$HTTP_CODE" = "200" ]; then
            echo "✅ Servidor respondendo corretamente (HTTP $HTTP_CODE)"
            echo "🔗 Acesse: http://localhost:$PORT"
            return 0
        elif [ "$HTTP_CODE" != "000" ]; then
            echo "⚠️  Servidor responde mas com código HTTP: $HTTP_CODE"
            return 0
        else
            echo "❌ Porta ocupada mas servidor não responde HTTP"
            return 1
        fi
    else
        echo "❌ Servidor não está rodando na porta $PORT"
        echo "💡 Execute 'pnpm dev:kdx' para iniciar o servidor"
        return 1
    fi
}

stop_server() {
    echo "🛑 Parando servidor na porta $PORT..."
    
    PID=$(lsof -i :$PORT 2>/dev/null | grep LISTEN | awk '{print $2}')
    if [ -n "$PID" ]; then
        echo "🔄 Enviando SIGTERM para PID $PID..."
        kill $PID
        sleep 2
        
        # Verificar se ainda está rodando
        if lsof -i :$PORT 2>/dev/null | grep -q LISTEN; then
            echo "⚠️  Processo ainda ativo, forçando com SIGKILL..."
            kill -9 $PID
            sleep 1
        fi
        
        if lsof -i :$PORT 2>/dev/null | grep -q LISTEN; then
            echo "❌ Falha ao parar o servidor"
            return 1
        else
            echo "✅ Servidor parado com sucesso"
            return 0
        fi
    else
        echo "ℹ️  Nenhum servidor rodando na porta $PORT"
        return 0
    fi
}

case $ACTION in
    "check"|"status")
        check_server
        exit $?
        ;;
    "stop")
        stop_server
        exit $?
        ;;
    "restart")
        echo "🔄 Reiniciando servidor..."
        stop_server
        if [ $? -eq 0 ]; then
            echo "⏳ Aguardando 3 segundos..."
            sleep 3
            echo "🚀 Iniciando servidor..."
            pnpm dev:kdx &
            echo "✅ Comando de start enviado"
        else
            echo "❌ Falha ao parar servidor, cancelando restart"
            exit 1
        fi
        ;;
    *)
        echo "❌ Ação inválida: $ACTION"
        echo "📖 Uso: $0 [PORT] [check|stop|restart]"
        exit 1
        ;;
esac 