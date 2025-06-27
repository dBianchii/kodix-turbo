#!/bin/bash
# Description: Actively checks if the development server is running.

# This ensures the script is run from the project root.
cd "$(dirname "$0")/.."

# This command uses a while loop to repeatedly check the server status.
# It calls the check-server-simple.sh script, suppressing its output.
# If the server is not RUNNING, it prints a waiting message and sleeps for 2 seconds.
# Once the server is RUNNING, the loop exits and the final status is printed.
while ! ./scripts/check-server-simple.sh &>/dev/null; do
  echo "Aguardando o servidor ficar RUNNING..."
  sleep 2
done

echo "Servidor está RUNNING."
./scripts/check-server-simple.sh 