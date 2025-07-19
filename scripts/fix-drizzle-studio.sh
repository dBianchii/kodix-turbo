#!/bin/bash

# 🔧 Drizzle Studio Troubleshooting Script
# Usage: ./scripts/fix-drizzle-studio.sh

echo "🔍 Drizzle Studio Troubleshooting..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check if Drizzle Studio is running
echo -e "\n${BLUE}1. Checking Drizzle Studio status...${NC}"
DRIZZLE_PID=$(lsof -ti:4983 2>/dev/null)
if [ -n "$DRIZZLE_PID" ]; then
    echo -e "${GREEN}✅ Drizzle Studio is running (PID: $DRIZZLE_PID)${NC}"
    
    # Test if it's responding
    if curl -s "https://local.drizzle.studio/" | grep -q "Drizzle Studio"; then
        echo -e "${GREEN}✅ Drizzle Studio is responding correctly${NC}"
        echo -e "${GREEN}🌐 Access: https://local.drizzle.studio/${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  Drizzle Studio is running but not responding${NC}"
        echo -e "${YELLOW}🔄 Restarting...${NC}"
        kill $DRIZZLE_PID
        sleep 2
    fi
else
    echo -e "${RED}❌ Drizzle Studio is not running${NC}"
fi

# Step 2: Check database containers
echo -e "\n${BLUE}2. Checking database containers...${NC}"
cd packages/db-dev

MYSQL_RUNNING=$(docker ps --filter "name=kodix-db-mysql-1" --filter "status=running" -q)
if [ -z "$MYSQL_RUNNING" ]; then
    echo -e "${RED}❌ MySQL container not running${NC}"
    echo -e "${YELLOW}🔄 Starting database containers...${NC}"
    docker-compose up -d
    
    echo -e "${BLUE}⏳ Waiting for MySQL to be ready...${NC}"
    timeout=30
    while [ $timeout -gt 0 ]; do
        if nc -z localhost 3306; then
            echo -e "${GREEN}✅ MySQL is ready${NC}"
            break
        fi
        sleep 1
        ((timeout--))
    done
    
    if [ $timeout -eq 0 ]; then
        echo -e "${RED}❌ MySQL failed to start within 30 seconds${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Database containers are running${NC}"
fi

# Step 3: Check database connectivity
echo -e "\n${BLUE}3. Testing database connectivity...${NC}"
cd ../..

if nc -z localhost 3306; then
    echo -e "${GREEN}✅ MySQL is accessible on port 3306${NC}"
else
    echo -e "${RED}❌ Cannot connect to MySQL on port 3306${NC}"
    echo -e "${YELLOW}🔄 Restarting database containers...${NC}"
    cd packages/db-dev
    docker-compose restart
    cd ../..
    
    echo -e "${BLUE}⏳ Waiting for MySQL...${NC}"
    sleep 10
fi

# Step 4: Check environment variables
echo -e "\n${BLUE}4. Checking environment variables...${NC}"
if [ -z "$MYSQL_URL" ]; then
    if [ -f ".env" ]; then
        source .env
        if [ -n "$MYSQL_URL" ]; then
            echo -e "${GREEN}✅ MYSQL_URL found in .env file${NC}"
        else
            echo -e "${RED}❌ MYSQL_URL not found in .env file${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ .env file not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ MYSQL_URL environment variable is set${NC}"
fi

# Step 5: Check schema integrity
echo -e "\n${BLUE}5. Checking database schema...${NC}"
cd packages/db
if pnpm build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database schema builds successfully${NC}"
else
    echo -e "${RED}❌ Database schema has TypeScript errors${NC}"
    echo -e "${YELLOW}🔧 Run 'cd packages/db && pnpm build' to see errors${NC}"
fi
cd ../..

# Step 6: Start Drizzle Studio
echo -e "\n${BLUE}6. Starting Drizzle Studio...${NC}"
echo -e "${YELLOW}🚀 Running: pnpm db:studio${NC}"

# Kill any existing process first
EXISTING_PID=$(lsof -ti:4983 2>/dev/null)
if [ -n "$EXISTING_PID" ]; then
    kill $EXISTING_PID
    sleep 2
fi

# Start in background and capture output
pnpm db:studio > /tmp/drizzle-studio.log 2>&1 &
STUDIO_PID=$!

# Wait for it to start
echo -e "${BLUE}⏳ Waiting for Drizzle Studio to start...${NC}"
timeout=30
while [ $timeout -gt 0 ]; do
    if curl -s "https://local.drizzle.studio/" | grep -q "Drizzle Studio"; then
        echo -e "${GREEN}✅ Drizzle Studio started successfully!${NC}"
        echo -e "${GREEN}🌐 Access: https://local.drizzle.studio/${NC}"
        echo -e "${BLUE}📋 Process ID: $STUDIO_PID${NC}"
        exit 0
    fi
    
    # Check if process is still running
    if ! kill -0 $STUDIO_PID 2>/dev/null; then
        echo -e "${RED}❌ Drizzle Studio process died${NC}"
        echo -e "${YELLOW}📄 Last 10 lines of log:${NC}"
        tail -10 /tmp/drizzle-studio.log
        exit 1
    fi
    
    sleep 1
    ((timeout--))
done

echo -e "${RED}❌ Drizzle Studio failed to start within 30 seconds${NC}"
echo -e "${YELLOW}📄 Last 10 lines of log:${NC}"
tail -10 /tmp/drizzle-studio.log
exit 1 