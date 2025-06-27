#!/bin/bash
# Verificação rápida do servidor para usar nas respostas

PORT=${1:-3000}

if lsof -i :$PORT 2>/dev/null | grep -q LISTEN; then
    HTTP_CODE=$(curl --connect-timeout 1 --max-time 2 -s -o /dev/null -w "%{http_code}" http://localhost:$PORT 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "RUNNING"
        exit 0
    else
        echo "PORT_OCCUPIED"
        exit 1
    fi
else
    echo "STOPPED"
    exit 1
fi 