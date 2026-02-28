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
  └─ cash/
      └─ app/
          └─ Next.js app (@cash/app) with its own tRPC endpoint served from @cash/api
packages
  ├─ cash/ (cash-scoped packages)
  |   ├─ api/
  |   |   └─ tRPC v11 router definition for cash
  |   ├─ auth/
  |   |   └─ Authentication for cash
  |   ├─ db/
  |   |   └─ Typesafe db calls using Drizzle
  |   └─ db-dev/
  |       └─ Dev utilities for cash database
  ├─ kdx/ (kdx-scoped packages)
  |   ├─ api/
  |   |   └─ tRPC v11 router definition
  |   ├─ auth/
  |   |   └─ Authentication using database sessions and oslo (lucia-auth)
  |   ├─ db/
  |   |   └─ Typesafe db calls using Drizzle and MySQL
  |   ├─ db-dev/
  |   |   └─ Dev utilities for kdx database
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
  └─ kodix/ (Global shared packages)
      ├─ auth/
      |   └─ Shared authentication utilities
      ├─ dayjs/
      |   └─ Extended dayjs configuration with centralized plugins
      ├─ drizzle-utils/
      |   └─ Shared Drizzle ORM utilities
      ├─ posthog/
      |   └─ PostHog analytics integration
      ├─ shared/
      |   └─ Reusable code snippets and general lightweight utilities
      ├─ testing/
      |   └─ Testing utilities and configurations
      ├─ trpc/
      |   └─ Shared tRPC configuration
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

Available apps: `kdx`, `cash`. Replace `<app>` below with one of them.

```bash
# Install dependencies
bun i

# Configure environment variables (only Vercel users)
bun vercel-link

# Start an app
bun dev:<app>

# Push the Drizzle schema to the database
bun push:<app>

# Seed the running database
bun seed:<app>
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

# Start an app
bun dev:<app>

# Push the Drizzle schema to the database
bun push:<app>

# Generate a new tRPC endpoint using the trpc-cli tool
bun start:trpc-cli

# Start the trpc-cli tool in development mode
bun dev:trpc-cli

# Create a new package (global or kdx-scoped)
bun turbo gen init
```

## References

This is a monorepo built using [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo) (thanks @juliusmarminge !)
