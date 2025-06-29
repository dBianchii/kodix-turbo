#!/bin/bash
# Description: Stops the development server by killing processes on ports 3000 and 4983, plus all turbo processes.

# Step 1: Kill processes listening on specific ports (original functionality)
# The -9 flag sends a SIGKILL signal, which is a non-ignorable, forceful termination.
# 2>/dev/null suppresses errors if no process is found on a port.
# || true ensures the script exits with a success code (0) even if no process was killed.
kill -9 $(lsof -t -i:3000) $(lsof -t -i:4983) 2>/dev/null || true

# Step 2: Kill all turbo watch processes (prevents accumulation of orphaned processes)
# This prevents the accumulation of multiple turbo watch processes over time
pkill -f "turbo.*watch" 2>/dev/null || true

# Step 3: Kill turbo daemon if it exists (ensures clean daemon state)
pkill -f "turbo.*daemon" 2>/dev/null || true

# Step 4: Kill any remaining pnpm dev processes
pkill -f "pnpm.*dev" 2>/dev/null || true 