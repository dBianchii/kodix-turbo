#!/bin/bash
# Kills all processes related to the development server.

# Kill all turbo processes
pkill -f "turbo"

# Kill all drizzle-kit processes
pkill -f "drizzle-kit"

echo "All development processes have been stopped." 