# Performance Optimization Plan: `app.getInstalled` & `user.getInvitations`

**Date:** 2025-01-25  
**Status:** 🏃‍♂️ In Progress
**Assignee:** Cursor

## 1. Problem Statement

During session switching in the Chat SubApp, significant performance degradation was observed. The browser console logs revealed that two tRPC procedures are taking an unusually long time to execute:

- `[TRPC] app.getInstalled took 2860ms to execute`
- `[TRPC] user.getInvitations took 2844ms to execute`

This latency is causing the main thread to block, resulting in multiple `[Violation] 'setTimeout' handler took...` warnings and a poor user experience.

Analysis of both procedures points to a classic **N+1 query problem**. Instead of fetching all required data in a single query using `JOIN`s, the repository functions use relational queries (`with` in Drizzle or `EXISTS` subqueries) that result in a separate database call for each parent record.

## 2. Chosen Strategy: Refactor with `JOIN` (Strategy 1)

The selected strategy is to refactor the inefficient database queries to use explicit `JOIN`s.

- **Pros:**
  - **Maximum Performance:** Reduces multiple database round-trips to a single, efficient query.
  - **Scalability:** The solution scales well with the number of applications and invitations.
  - **Best Practice:** Aligns with standard SQL optimization techniques for N+1 problems.
- **Cons:**
  - Requires modifying existing Drizzle ORM query logic.

## 3. Step-by-Step Action Plan

### Step 1: Investigate `user.getInvitations` - ✅ DONE

- **Action:** Use `grep` to locate the implementation of the `user.getInvitations` tRPC procedure.
- **Analysis:** The handler `getInvitationsHandler` calls `teamRepository.findManyInvitationsByEmail`. This function uses Drizzle's `with` to fetch related `Team` and `InvitedBy` user data, which causes an N+1 query problem.
- **Goal:** Confirmed that it suffers from the same N+1 issue as `app.getInstalled`.

### Step 2: Refactor `app.getInstalled` Repository Function

- **File:** `packages/db/src/repositories/app/appRepository.ts`
- **Function:** `findInstalledAppsByTeamId`
- **Action:** Rewrite the function to use a `LEFT JOIN` on the `appsToTeams` table.
- **Proposed Implementation:**

  ```typescript
  import { and, eq, sql } from "drizzle-orm";
  import { apps, appsToTeams, todoAppId } from "../../schema";
  import { db as _db } from "../../client";

  export async function findInstalledAppsByTeamId(
    teamId: string | undefined,
    db = _db,
  ) {
    if (!teamId) {
      const allApps = await db
        .select({ id: apps.id, installed: sql<boolean>\`false\` })
        .from(apps);
      return allApps.filter((app) => app.id !== todoAppId);
    }

    const query = await db
      .select({
        id: apps.id,
        installed: sql<boolean>\`case when ${appsToTeams.teamId} is not null then 1 else 0 end\`.as("installed"),
      })
      .from(apps)
      .leftJoin(appsToTeams, and(eq(apps.id, appsToTeams.appId), eq(appsToTeams.teamId, teamId)))
      .groupBy(apps.id);

    return query.filter((app) => app.id !== todoAppId); //TODO: stinky
  }
  ```

### Step 3: Refactor `user.getInvitations` Repository Function

- **File:** `packages/db/src/repositories/teamRepository.ts`
- **Function:** `findManyInvitationsByEmail`
- **Action:** Rewrite the function to use explicit `innerJoin`s instead of `with`.
- **Proposed Implementation:**

  ```typescript
  import { invitations, teams, users as usersTable } from "../schema";

  export async function findManyInvitationsByEmail(email: string, db = _db) {
    const invitedBy = alias(usersTable, "invitedBy");
    return db
      .select({
        id: invitations.id,
        Team: {
          id: teams.id,
          name: teams.name,
        },
        InvitedBy: {
          id: invitedBy.id,
          name: invitedBy.name,
          image: invitedBy.image,
        },
      })
      .from(invitations)
      .innerJoin(teams, eq(invitations.teamId, teams.id))
      .innerJoin(invitedBy, eq(invitations.invitedById, invitedBy.id))
      .where(eq(invitations.email, email));
  }
  ```

### Step 4: Validate the Solution

- **Action:** Run the application locally (`pnpm dev:kdx`).
- **Procedure:**
  1. Open the browser's developer tools.
  2. Navigate to the Chat SubApp and switch between different chat sessions.
  3. Monitor the console for the `[TRPC]` logs.
- **Expected Outcome:**
  - The execution time for `app.getInstalled` and `user.getInvitations` should be significantly reduced (ideally to < 200ms).
  - The `[Violation]` warnings in the console should disappear.
  - The application should feel much more responsive during navigation.

---

**Next Action:** Proceed with **Step 2 & 3: Implement the proposed refactorings**.
