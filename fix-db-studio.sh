#!/bin/bash

echo "🔧 Fixing db:studio..."

# Check if port 4983 is in use
PORT_PID=$(lsof -ti:4983)

if [ ! -z "$PORT_PID" ]; then
    echo "📍 Port 4983 is in use by PID: $PORT_PID"
    echo "🛑 Killing process..."
    kill -9 $PORT_PID
    sleep 1
    echo "✅ Process killed"
else
    echo "✅ Port 4983 is available"
fi

echo "🚀 Starting db:studio..."
pnpm db:studio