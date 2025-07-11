# AI Studio API Reference

> **Last Revised**: July 2025
> **Status**: ✅ Active & Consolidated
> **Source of Truth**: `packages/api/src/trpc/routers/app/ai-studio/_router.ts`

## 🎯 Overview

This document provides a complete reference for all tRPC endpoints of the **AI Studio**. All procedures are `protectedProcedure`, ensuring that only authenticated users can access them, with automatic validation for `teamId` isolation.

---

## 🏢 Providers Module (`providers`)

Manages AI providers (e.g., OpenAI, Anthropic).

| Endpoint           | Type       | Description                                 |
| ------------------ | ---------- | ------------------------------------------- |
| `findAiProviders`  | `query`    | Lists all providers for the team.           |
| `createAiProvider` | `mutation` | Creates a new provider.                     |
| `updateAiProvider` | `mutation` | Updates the name or base URL of a provider. |
| `deleteAiProvider` | `mutation` | Removes a provider.                         |

---

## 🧠 Models Module (`models`)

Manages the system's global AI models. **The source of truth is the set of JSON configuration files** in the `ai-sync-adapters` directory. These routes are primarily consumed by the synchronization process.

| Endpoint        | Type       | Description                             |
| --------------- | ---------- | --------------------------------------- |
| `findModels`    | `query`    | Lists all global models.                |
| `createAiModel` | `mutation` | Creates a new global model.             |
| `updateAiModel` | `mutation` | Updates a global model.                 |
| `deleteAiModel` | `mutation` | Removes a global model from the system. |

---

## 🔄 Sync Module (`sync`)

Manages the synchronization of models and strategies from configuration files.

| Endpoint                  | Type       | Description                                                                                                                                                                                              |
| ------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `syncModelsAndStrategies` | `mutation` | Reads `*-pricing.json` and `*-prompt-strategies.json` files and updates the database. Adds new models, updates existing ones, and removes obsolete ones. **This is the canonical way to manage models.** |

---

## 🔑 Tokens Module (`tokens`)

Manages API tokens (keys) for each provider, per team.

| Endpoint                    | Type       | Description                                   |
| --------------------------- | ---------- | --------------------------------------------- |
| `findAiTeamProviderTokens`  | `query`    | Lists the team's tokens (always masked).      |
| `createAiTeamProviderToken` | `mutation` | Adds and encrypts a new token for a provider. |
| `updateAiTeamProviderToken` | `mutation` | Updates an existing token.                    |
| `removeTokenByProvider`     | `mutation` | Removes the token associated with a provider. |

---

## ⚙️ Team Model Config Module (`team model config`)

Manages which models are available for each team and their configurations.

| Endpoint                | Type       | Description                                              |
| ----------------------- | ---------- | -------------------------------------------------------- |
| `findAvailableModels`   | `query`    | Lists all models the team can enable.                    |
| `toggleModel`           | `mutation` | Activates or deactivates a model for the team.           |
| `setDefaultModel`       | `mutation` | Sets a model as the default for the team.                |
| `getDefaultModel`       | `query`    | Fetches the default model set for the team.              |
| `reorderModelsPriority` | `mutation` | Reorders model priority (used for fallback).             |
| `testModel`             | `mutation` | Sends a test prompt to a model to validate connectivity. |

---

## 👤 Agents Module (`agents`)

Manages custom AI agents.

| Endpoint        | Type       | Description                                       |
| --------------- | ---------- | ------------------------------------------------- |
| `findAiAgents`  | `query`    | Lists all agents for the team.                    |
| `createAiAgent` | `mutation` | Creates a new agent with a name and instructions. |
| `updateAiAgent` | `mutation` | Updates the details of an existing agent.         |
| `deleteAiAgent` | `mutation` | Removes an agent.                                 |

---

## 📚 Libraries Module (`libraries`)

Manages knowledge libraries that can be associated with agents.

| Endpoint          | Type       | Description                             |
| ----------------- | ---------- | --------------------------------------- |
| `findAiLibraries` | `query`    | Lists all libraries for the team.       |
| `createAiLibrary` | `mutation` | Creates a new library.                  |
| `updateAiLibrary` | `mutation` | Updates the name or files of a library. |
| `deleteAiLibrary` | `mutation` | Removes a library.                      |

---

## 📋 Instructions and Prompts Module

Manages the instructions that shape the AI's behavior.

| Endpoint          | Type    | Description                                                                                                                        |
| ----------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `getSystemPrompt` | `query` | Fetches the final system prompt, with the instruction hierarchy and **model-specific agent switching strategies** already applied. |
