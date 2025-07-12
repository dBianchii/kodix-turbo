#!/bin/bash

echo "🐳 VERIFICAÇÃO DOS SERVIÇOS DOCKER"
echo "=================================="

# Verificar se está no diretório correto
if [ ! -d "packages/db-dev" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto Kodix"
    exit 1
fi

# Navegar para diretório Docker
cd packages/db-dev

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado!"
    echo "   Instale Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado!"
    exit 1
fi

echo ""
echo "✅ Docker e Docker Compose instalados"

# Verificar se serviços estão rodando
echo ""
echo "📊 Status dos serviços:"
docker-compose ps

# Verificar MySQL especificamente
echo ""
echo "🗄️ Testando conexão MySQL..."

if docker-compose exec -T mysql mysql -u root -ppassword -e "SHOW DATABASES;" &> /dev/null; then
    echo "✅ MySQL está funcionando corretamente"
    
    # Verificar se database kodix existe
    if docker-compose exec -T mysql mysql -u root -ppassword -e "USE kodix; SELECT 'Database kodix existe' as status;" &> /dev/null; then
        echo "✅ Database 'kodix' existe"
    else
        echo "⚠️  Database 'kodix' não existe - execute 'pnpm db:push'"
    fi
else
    echo "❌ Não foi possível conectar ao MySQL"
    echo ""
    echo "🔧 Soluções:"
    echo "1. Iniciar serviços: docker-compose up -d"
    echo "2. Aguardar inicialização: docker-compose logs mysql"
    echo "3. Verificar se porta 3306 não está em uso"
    exit 1
fi

echo ""
echo "🎉 Todos os serviços Docker estão funcionando!"
echo ""
echo "📚 Comandos úteis:"
echo "   Iniciar:  cd packages/db-dev && docker-compose up -d"
echo "   Parar:    cd packages/db-dev && docker-compose stop"
echo "   Logs:     cd packages/db-dev && docker-compose logs mysql"
echo "   Reset:    cd packages/db-dev && docker-compose down -v" 