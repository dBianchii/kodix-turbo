# kodix-turbo

## About

Kodix's main monorepo. It uses [Turborepo](https://turborepo.org) and contains:

```text
.github
  └─ workflows
        └─ CI with pnpm cache setup
.vscode
  └─ Recommended extensions and settings for VSCode users
apps
  ├─ care-expo
  |   ├─ Expo SDK 51 app for Care
  |   ├─ React Native using React 18
  |   ├─ Navigation using Expo Router
  |   └─ Typesafe API calls using tRPC
  └─ kdx
      └─ Main Next.js 14 app where tRPC endpoint is served from the @kdx/api package
packages
  ├─ api
  |   └─ tRPC v11 router definition
  ├─ auth
  |   └─ Authentication using lucia-auth.
  ├─ db
  |   └─ Typesafe db calls using Drizzle and MySQL
  ├─ ui
  |   └─ Start of a UI package for the webapp using shadcn-ui
  ├- shared
  |   └─ Reusable code snippets and general lightweight code sharing
  ├- validators
  |   └─ Shared zod validation schemas (mainly for tRPC's api to be used in both frontend and backend)
  ├- react-email
  |   └─ react-email (npm package) project to store email templates and easily visualize them
  ├- locales
  |   └─ Shared locale files for i18n configuration (right now, only for the context of @kdx/kdx)
  ├- dayjs
  |   └─ Extended dayjs configuration (mainly for centralizing plugins)
  └─ trpc-cli
      └─ CLI tool to automatically create new endpoints in @kdx/api with the correct boilerplate
tooling
  ├─ eslint
  |   └─ shared, fine-grained, eslint presets
  ├─ prettier
  |   └─ shared prettier configuration
  ├─ tailwind
  |   └─ shared tailwind configuration
  └─ typescript
     └─ shared tsconfig you can extend from
turbo/generators
      └─ Automatically create new @kdx packages with the correct boilerplate
```

## Quick Start

To get it running, follow the steps below:

### Pre-requisites

Make sure you have pnpm installed globally. If not, you can install it by running:

```bash
npm i -g pnpm
```

Node 20.11.0 is recommended. You can use nvm (recommended) to manage your node versions. To use the correct node version, run:

```bash
nvm use
```

### 1. Setup dependencies

```bash
# Install dependencies
pnpm i

# Configure environment variables
# There is an `.env.example` in the root directory you can use for reference, although you need to fill in the correct values yourself
cp .env.example .env

# Push the Drizzle schema to the database
pnpm db:push

```

In order to get the upstash-dev dockerfile to run with no complaints, run `sudo usermod -aG docker $USER` and then log out and back in.

### 2. Most helpful commands

```bash
# Clean all temporary files in all packages
pnpm clean:workspaces

# Lint and auto-fix linting errors in all packages
pnpm lint:fix

# Format and auto-fix formatting errors in all packages
pnpm format:fix

#Typecheck all packages
pnpm typecheck

# Start the main kdx app
pnpm dev:kdx

# Start Drizzle Studio
pnpm db:studio

# Pushing the Drizzle schema to the database
pnpm db:push

# Generate a new tRPC endpoint using the trpc-cli tool
pnpm trpc:new

# Add new shadcn-ui components to the ui package
pnpm ui:add

# Create a new @kdx package
pnpm turbo gen init
```

## References

This is a monorepo built using [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo) (thanks @juliusmarminge !)
