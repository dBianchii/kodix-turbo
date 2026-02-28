# kodix-turbo

## About

Kodix's main monorepo. It uses [Turborepo](https://turborepo.org) and contains:

```text
.github
  └─ workflows
        └─ CI with bun cache setup
.vscode
  └─ Recommended extensions and settings for VSCode users
apps
  ├─ kdx/
  |   ├─ app/
  |   |   └─ Main Next.js 15 app (@kdx/app) where tRPC endpoint is served from @kdx/api
  |   └─ care-expo/
  |       ├─ React Native using React 19
  |       ├─ Navigation using Expo Router
  |       └─ Typesafe API calls using tRPC
packages
  ├─ kdx/ (kdx-scoped packages)
  |   ├─ api/
  |   |   └─ tRPC v11 router definition
  |   ├─ auth/
  |   |   └─ Authentication using database sessions and oslo (lucia-auth)
  |   ├─ db/
  |   |   └─ Typesafe db calls using Drizzle and MySQL
  |   ├─ env/
  |   |   └─ Environment variable validation
  |   ├─ locales/
  |   |   └─ Locale files for i18n configuration (scoped to @kdx/app)
  |   ├─ permissions/
  |   |   └─ Permission management and CASL integration
  |   ├─ react-email/
  |   |   └─ Email templates using react-email
  |   ├─ trpc-cli/
  |   |   └─ CLI tool to automatically create new tRPC endpoints with boilerplate
  |   └─ validators/
  |       └─ Shared zod validation schemas for tRPC
  └─ kodix/ (Global packages)
      ├─ dayjs/
      |   └─ Extended dayjs configuration with centralized plugins
      ├─ shared/
      |   └─ Reusable code snippets and general lightweight utilities
      ├─ testing/
      |   └─ Testing utilities and configurations
      └─ ui/
          └─ Global UI components using shadcn-ui
tooling
  ├─ biome/
  |   └─ Shared Biome configuration
  ├─ github/
  |   └─ GitHub Actions workflows
  ├─ tailwind/
  |   └─ Shared Tailwind configuration
  └─ typescript/
      └─ Shared tsconfig you can extend from

turbo/generators
      └─ Automatically create new packages with the correct boilerplate
```

## Quick Start

To get it running, follow the steps below:

### Pre-requisites

Make sure you have bun installed globally. If not, you can install it by running:

```bash
npm i -g bun
```

Make sure you are using the specified node version in .nvmrc. You can use nvm (recommended) to manage your node versions. To use the correct node version, run:

```bash
nvm use
```

### 1. Setup dependencies

```bash
# Install dependencies
bun i

# Configure environment variables (only Vercel users)
bun vercel-link

# Start the main kdx app
bun dev:kdx

# Push the Drizzle schema to the database
bun push:kdx

# Seed the running database
bun seed:kdx

```

### 2. Most helpful commands

```bash
# Clean all temporary files in all packages
turbo clean

# Run Biome checks on all packages
bun check

# Run Biome checks and write all packages
bun check:write

# Run Biome checks and write all packages (unsafe)
bun check:unsafe

#tsc all packages
bun tsc

# Start the main kdx app
bun dev:kdx

# Pushing the Drizzle schema to the database
bun push:kdx

# Generate a new tRPC endpoint using the trpc-cli tool
bun start:trpc-cli

# Start the trpc-cli tool in development mode
bun dev:trpc-cli

# Create a new package (global or kdx-scoped)
bun turbo gen init
```

## References

This is a monorepo built using [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo) (thanks @juliusmarminge !)
