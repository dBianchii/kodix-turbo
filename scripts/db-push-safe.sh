#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

# Navigate to the database-dev directory from the project root
cd "$(dirname "$0")/../packages/db-dev"

echo "🟢 Starting database in background..."
docker compose up -d --build

# Navigate to the db package to run its scripts
cd ../db

echo "⌛ Waiting for database to be ready..."
pnpm wait-for-db

echo "🚀 Applying schema changes..."
pnpm with-env drizzle-kit push

echo "✅ Changes applied successfully."

# Navigate back to the db-dev directory to stop the container
cd ../db-dev

echo "🔴 Stopping database..."
docker compose down

echo "🎉 Database push complete." 