# AI Studio Sub-App

> **Status**: ✅ Active
> **Contact**: AI Team

## 1. Overview

AI Studio is the core sub-app that centralizes all Artificial Intelligence infrastructure for the Kodix platform. It provides a unified interface and backend service for managing AI providers, models, security tokens, and specialized agents.

This documentation is split into two main sections:

- **[Backend Documentation](./backend/README.md)**: For developers working on the API, services, and database integration.
- **[Frontend Documentation](./frontend/README.md)**: For developers working on the user interface and components.

## 2. Key Features

- **Provider Management**: Register and manage AI providers (OpenAI, Anthropic, Google).
- **Model Synchronization**: Keep AI models and pricing updated automatically via the **Model Sync Architecture**.
- **Team-Based Model Configuration**: Enable specific models for your team and set priorities.
- **Secure Token Storage**: Store API keys using AES-256-GCM encryption.
- **Custom Agent Creation**: Develop specialized AI assistants with custom instructions.
- **Instruction Hierarchy**: Control AI behavior with multiple layers of prompts (Platform, Team, User, Agent).
