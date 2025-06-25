# Frontend Performance Optimization Plan - Chat SubApp

**Date:** 2025-02-01  
**Status:** 📝 In Progress
**Author:** Cursor

## 1. Problem Statement & Lessons Learned

Following successful backend optimizations, the Chat SubApp still exhibits significant client-side performance issues. The initial attempt to fix this with `React.memo` was insufficient because the `props` passed to the memoized components (especially callback functions) were being recreated on every render, invalidating the memoization.

- **Key Architectural Guideline:** The project's documentation, specifically `@docs/subapps/chat/planning/architectural-correction-antipatterns.md`, dictates a critical principle: **"Corrections should be surgical, not architectural."** Large-scale refactoring to fix performance issues is an anti-pattern.

## 2. Chosen Strategy: Surgical Frontend Optimization

Based on a deeper analysis of the architecture documents (`@chat-architecture.md`), a new, safer, and more aligned strategy is proposed. Instead of a large architectural refactoring, we will apply targeted, low-risk optimizations that are already established as best practices within the project.

- **Phase 1: Stabilize Props with `useCallback`**: This is the highest priority. We will wrap all callback functions passed as props in `useCallback` to ensure they have a stable identity. This will make the existing `React.memo` effective and is the most direct solution to the re-rendering problem.
- **Phase 2: Implement Optimistic Updates**: We will replace costly `queryClient.invalidateQueries` calls with `queryClient.setQueryData` for session updates. This aligns with the "Atualizações Otimistas para Listas" pattern documented in the chat's architecture, providing instant UI feedback for the sidebar.

- **Pros:**
  - **Architecturally Correct & Safe:** Strictly follows the established patterns for _corrections_ and avoids risky, large-scale refactoring.
  - **Highly Performant:** Addresses the root causes of re-renders (unstable props and slow data invalidation) directly.
  - **Incremental and Verifiable:** Each step provides a clear benefit and can be validated independently.

## 3. Step-by-Step Action Plan

### Step 1: Stabilize Callbacks

- **File:** `apps/kdx/src/app/[locale]/(authed)/apps/chat/_components/unified-chat-page.tsx`
- **Action:** Wrap the `handleSessionSelect` and `handleModelSelect` functions in the `useCallback` hook with the correct dependency arrays. This is the primary fix for the performance issue.

### Step 2: Implement Optimistic Updates for the Sidebar

- **File:** `apps/kdx/src/app/[locale]/(authed)/apps/chat/_components/unified-chat-page.tsx`
- **Action:** Locate the `updateSessionMutation`. In its `onSuccess` callback, replace the `queryClient.invalidateQueries` for `listarSessions` with a `queryClient.setQueryData` call. This will manually and instantly update the specific session in the React Query cache, preventing a full re-fetch of the session list.

- **Proposed Implementation:**

  ```typescript
  const updateSessionMutation = useMutation(
    trpc.app.chat.atualizarSession.mutationOptions({
      onSuccess: (updatedSession) => {
        toast.success("Modelo atualizado com sucesso!");

        // ✅ Optimistic Update: Manually update the session list cache
        queryClient.setQueryData(
          trpc.app.chat.listarSessions.queryKey,
          (oldData: any) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              sessions: oldData.sessions.map((session: any) =>
                session.id === updatedSession.id
                  ? { ...session, ...updatedSession }
                  : session,
              ),
            };
          },
        );
        // Invalidate other specific queries as needed, but avoid invalidating the whole list.
        queryClient.invalidateQueries(trpc.app.chat.buscarSession.pathFilter());
      },
      onError: trpcErrorToastDefault,
    }),
  );
  ```

### Step 3: Final Validation

- **Action:** Run the application locally (`pnpm dev:kdx`).
- **Procedure:**
  1. Open the browser's developer tools.
  2. Navigate to the Chat SubApp and switch between sessions, then change the model of a session.
- **Expected Outcome:**
  - UI interactions (session switching, model selection) should be instantaneous.
  - All `[Violation]` warnings in the console should be completely eliminated.
  - The sidebar should update immediately after a model change without a noticeable loading state.

---

**Next Action:** Proceed with **Step 1: Stabilize Callbacks**.
