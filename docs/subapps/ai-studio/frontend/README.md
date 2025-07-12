# AI Studio Frontend Guide

> **Status**: ✅ Active & Consolidated
> **Related Documents**:
>
> - [Component Reference](./components.md)

## 1. Overview

This guide defines the standards for all frontend development within the AI Studio sub-app. Adhering to these rules is mandatory to ensure the stability and maintainability of the user interface.

## 2. Core Implementation Order (Cross-Package)

Any feature that spans multiple packages **MUST** be implemented in this strict order to avoid type and dependency errors:

1.  **`@kdx/shared`**: Define base types and schemas.
2.  **`@kdx/validators`**: Create or update tRPC Zod validation schemas.
3.  **`@kdx/db`**: Update the database schema and repositories.
4.  **`@kdx/api`**: Implement the API endpoints.
5.  **`apps/kdx`**: Build the UI that consumes the API.

## 3. UI Patterns: Mandatory Visual Feedback

Asynchronous operations (like saving) **MUST** provide clear visual feedback.

- **Pattern**: For action buttons:
  1.  Use an `isDirty` state to enable the button only when there are changes.
  2.  Use the `isPending` state from a `useMutation` hook to disable the button and display a loading icon.
  3.  On `onSuccess`, reset the `isDirty` state to `false`.
- **Justification**: This improves UX, prevents duplicate clicks, and clearly communicates the application's state.

## 4. Debugging: Resolving Cross-Package Type Errors

- **Common Problem**: Type errors that persist even after being fixed, often caused by a stale TypeScript build cache (`.tsbuildinfo`).
- **Mandatory Solution**:
  1.  Type-check **only the modified package** first (e.g., `pnpm typecheck --filter=@kdx/shared`).
  2.  Move up the dependency chain, checking consumer packages in order.
  3.  If errors persist, run a **forced clean** before recompiling: `pnpm turbo clean`.

## 5. User-Facing Sections

The AI Studio UI is divided into two main sections for clarity:

### Main Section (Frequent Use)

- **My Instructions**: Create **personal** AI rules that have the highest priority.
- **Team Instructions**: Define the base AI behavior for the **entire team**.
- **Tokens**: Manage API keys for your providers.
- **Enabled Models**: Control which AI models your team can use and set priorities.
- **Agents**: Create AI "personalities" for specific tasks (e.g., "Marketing Expert").
- **Libraries**: Group information and files to give context to your Agents.

### General Configuration (Administrative Use)

- **Providers**: Manage the list of AI companies available on the platform.
- **System Models**: Manage the list of **all** AI models known to the system, before they are enabled for teams.

## 6. Quick Setup (5 Minutes)

To enable AI functionalities for a team, the following 4 steps are required in the AI Studio:

1.  **Add Providers**: Navigate to `General Configuration` > `Providers` to register the AI companies the team uses (e.g., OpenAI, Anthropic).
2.  **Register API Tokens**: Go to `Main` > `Tokens`, select a provider, and add the corresponding API key. It will be stored securely.
3.  **Enable Models**: In `Main` > `Enabled Models`, activate the AI models the team will use and set a default model.
4.  **Define Team Instructions** (Optional): In `Main` > `Team Instructions`, define the default AI behavior for all members.

## 7. Chat Integration

The AI Studio directly feeds the Chat Sub-App.

- **Models and Agents**: The lists of models and agents configured here appear in the selectors within the Chat interface.
- **Instruction Hierarchy**: During a conversation, the system prompt is assembled following a strict priority order to define the AI's behavior: **1st Agent Instructions (if selected)** > **2nd Your Personal Instructions** > **3rd Team Instructions** > **4th Platform Instructions**.

## 8. Troubleshooting

- **"A model does not appear in the Chat."**
  - **Solution**: Verify that the model is **active** in `Enabled Models` and that its provider has a **valid token** in the `Tokens` section.
- **"I made a change, but it's not reflected in the Chat."**
  - **Solution**: The system uses a 5-minute cache. To see the change immediately, start a **new chat session**.

## 9. Model Synchronization Workflow

A key administrative feature of the AI Studio is the ability to synchronize the platform's model list with the offerings from external providers. This workflow is managed through a dedicated UI.

- **Triggering Sync**: A **"Sync"** button is available for each provider in the `Providers` section. Clicking this opens the `ModelSyncDialog`.
- **Reviewing Changes**: The dialog calls the `aiStudio.provider.syncModels` tRPC procedure and displays the difference between the provider's models and the local database. The changes are categorized into:
  - **New Models**: Models available from the provider but not in Kodix.
  - **Updated Models**: Existing models with changed metadata.
  - **Archived Models**: Models no longer available from the provider.
- **Applying Changes**: After reviewing, the administrator can click **"Apply Sync"** to execute the `aiStudio.provider.applySync` procedure, which persists these changes to the database.
- **Viewing Status**: In the `System Models` section, models are visually distinguished with `Active` or `Archived` badges, and a switch allows administrators to toggle the visibility of archived models.
