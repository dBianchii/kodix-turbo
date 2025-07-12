# Frontend Component Reference

> **Status**: ✅ Active & Consolidated
> **Related Documents**:
>
> - [Frontend Guide](./README.md)

## 1. Overview

This document provides a reference for the key frontend components specific to the AI Studio sub-app.

## 2. Model Sync Dialog (`ModelSyncDialog.tsx`)

- **File**: `apps/kdx/src/app/[locale]/(authed)/apps/aiStudio/_components/dialogs/model-sync-dialog.tsx`
- **Purpose**: This stateful dialog manages the entire model synchronization workflow.
- **Trigger**: Opened by a "Sync" `Button` located in each provider's row in the `providers-section.tsx`.

### Workflow and Functionality

1.  **State Management**: The dialog manages its own state machine (`idle`, `syncing`, `reviewing`, `applying`).
2.  **tRPC Integration**: Uses the `useTRPC()` hook to call `aiStudio.provider.syncModels` and `aiStudio.provider.applySync`.
3.  **Diff Rendering**: Renders the "diff" returned from the `syncModels` procedure. It uses `Accordion` and `Table` components to clearly display `newModels`, `updatedModels`, and `archivedModels`.
4.  **User Feedback**: Provides clear UI feedback for all states using `Toast` notifications and loading states on buttons.
5.  **Data Invalidation**: On a successful `applySync` operation, it invalidates the `findModels` query to ensure the main model list is refreshed.

## 3. Models Section (`models-section.tsx`)

- **File**: `apps/kdx/src/app/[locale]/(authed)/apps/aiStudio/_components/sections/models-section.tsx`
- **Purpose**: Displays the list of all AI models known to the system.

### Key Features

- **Status Visualization**:
  - Uses a `Badge` component to display the model's status (`Active` or `Archived`).
  - Applies a muted style (`opacity-50`) to archived rows to visually distinguish them.
- **Filtering**:
  - Includes a `Switch` component to toggle the `showArchived` state.
  - When toggled, the `useQuery(trpc.app.aiStudio.findModels.queryOptions(...))` hook is re-triggered with the appropriate `status` filter to show or hide archived models.
