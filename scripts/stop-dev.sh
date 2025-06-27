#!/bin/bash
# Description: Stops the development server by killing processes on ports 3000 and 4983.

# This command finds the Process IDs (PIDs) listening on TCP ports 3000 and 4983
# and sends a KILL signal to them.
# The -9 flag sends a SIGKILL signal, which is a non-ignorable, forceful termination.
# 2>/dev/null suppresses errors if no process is found on a port.
# || true ensures the script exits with a success code (0) even if no process was killed.
kill -9 $(lsof -t -i:3000) $(lsof -t -i:4983) 2>/dev/null || true 