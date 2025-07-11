#!/bin/bash
# Description: Starts the development server in the background and logs output to dev.log.

# This ensures the script is run from the project root.
cd "$(dirname "$0")/.."

# This command starts the development server in watch mode using Turborepo.
# > dev.log redirects standard output to dev.log.
# 2>&1 redirects standard error to the same place as standard output.
# & runs the command in the background, freeing up the terminal.
pnpm dev:kdx > dev.log 2>&1 & 