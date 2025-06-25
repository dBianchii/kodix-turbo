# Frontend Performance Optimization Plan - Chat SubApp

**Date:** 2025-02-01  
**Status:** 📝 In Progress
**Author:** Cursor

## 1. Problem Statement & Lessons Learned

Following successful backend optimizations (which reduced latency from ~2.8s to ~500ms), the Chat SubApp still exhibits significant client-side performance issues. The initial attempt to fix this with `React.memo` was insufficient.

- **Lessons Learned:**
  1.  **Ineffective Memoization:** The `[Violation]` warnings persist because the props (especially `onSessionSelect` and other callbacks) passed to the memoized components are being recreated on every render of `UnifiedChatPage`, thus breaking the memoization.
  2.  **Fragmented Data Fetching:** `UnifiedChatPage` directly calls multiple `useQuery` hooks. This goes against the established architectural pattern in `chat-architecture.md` which recommends centralizing data logic in dedicated hooks to avoid inconsistent or inefficient fetching.
  3.  **Costly Re-renders:** A full `queryClient.invalidateQueries` on the session list (`listarSessions`) after an update can be slow if the list is long, forcing a full re-fetch and re-render of the sidebar. The architecture documents recommend using optimistic updates via `setQueryData` for better performance.

## 2. Chosen Strategy: Architectural Frontend Refactoring

Based on the lessons learned and the project's architecture documents (`@chat-architecture.md`), the new strategy is a deeper, more architectural refactoring of the frontend.

- **Phase 1: Stabilize Props with `useCallback`**: Wrap all callback functions passed as props (`handleSessionSelect`, `handleModelSelect`, etc.) in `useCallback` to ensure they have a stable identity between renders. This will make `React.memo` effective.
- **Phase 2: Centralize Data Logic**: Create a new centralized hook, `useUnifiedChatState`, to encapsulate all the data-fetching logic (`useQuery` for sessions, messages, etc.) that is currently inside `UnifiedChatPage`. This component will then consume the hook, simplifying its code and adhering to the "Centralização de Lógica de Dados" pattern.
- **Phase 3: Implement Optimistic Updates**: Refactor the sidebar update logic to use `queryClient.setQueryData` for instant UI feedback when a session title or model changes, avoiding costly re-fetches as prescribed by the "Atualizações Otimistas para Listas" pattern.

- **Pros:**
  - **Architecturally Correct:** Aligns the component with the established best practices in the project's documentation.
  - **Highly Performant:** Addresses the root causes of re-renders, not just the symptoms.
  - **Improved Maintainability:** Simplifies the `UnifiedChatPage` component, making it easier to understand and maintain.

## 3. Step-by-Step Action Plan

### Step 1: Stabilize Callbacks

- **File:** `apps/kdx/src/app/[locale]/(authed)/apps/chat/_components/unified-chat-page.tsx`
- **Action:** Wrap the `handleSessionSelect` and `handleModelSelect` functions in the `useCallback` hook with the correct dependency arrays.

### Step 2: Centralize State and Data-Fetching Logic

- **Action:** Create a new hook file `apps/kdx/src/app/[locale]/(authed)/apps/chat/_hooks/useUnifiedChatState.ts`.
- **Logic:** Move all `useState`, `useEffect`, `useQuery`, `useMutation`, and memoized calculations from `UnifiedChatPage` into this new hook. The hook will return the necessary state and handlers to the component.
- **Refactor:** Modify `UnifiedChatPage` to be a much simpler "presentational" component that gets all its data and logic from the `useUnifiedChatState` hook.

### Step 3: Implement Optimistic Updates in Sidebar

- **Action:** Locate the mutations that affect session data (e.g., `updateSessionMutation`).
- **Refactor:** In the `onSuccess` or `onMutate` callbacks of these mutations, use `queryClient.setQueryData` to directly update the specific session in the `listarSessions` query cache. This will provide an instant UI update without a network round-trip.

### Step 4: Final Validation

- **Action:** Run the application locally (`pnpm dev:kdx`).
- **Procedure:**
  1. Open the browser's developer tools.
  2. Navigate to the Chat SubApp and switch between sessions, change models, and edit session titles.
- **Expected Outcome:**
  - UI interactions should be instantaneous.
  - All `[Violation]` warnings should be completely eliminated.
  - The code in `UnifiedChatPage` will be cleaner and more aligned with the project's architecture.

---

**Next Action:** Proceed with **Step 1: Stabilize Callbacks**.
