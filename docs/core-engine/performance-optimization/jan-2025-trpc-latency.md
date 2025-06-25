# Core Engine Optimization: tRPC Latency

**Date:** 2025-01-25
**Status:** ✅ Completed
**Author:** Cursor

## 1. Problem Statement

A significant performance degradation (~2.8s latency) was observed in the Chat SubApp during session switching. The root cause was traced back to two tRPC procedures belonging to the Core Engine:

- `app.getInstalled` (App Management)
- `user.getInvitations` (User & Team Management)

This document outlines the investigation and resolution of this platform-wide performance issue.

## 2. Root Cause Analysis

The investigation revealed a multi-faceted problem combining inefficient database queries and connection management:

1.  **N+1 Queries:** Both procedures were initially implemented using Drizzle's relational queries (`with`), which resulted in a high number of separate database calls instead of a single efficient `JOIN`.
2.  **Missing Database Indexes:** Even after refactoring the queries to use `JOIN`s, performance was still suboptimal (~1.4s). This was caused by a lack of indexes on the foreign key columns (`appId`, `teamId`, `email`) in the `appsToTeams` and `invitations` tables, forcing slow table scans.
3.  **Inefficient Connection Pooling:** The final bottleneck (~500ms) was the database client itself. It was not effectively reusing connections from the pool, creating an expensive new connection for each tRPC request.

## 3. Resolution Strategy: Complete Optimization (Application + Database)

A holistic strategy was implemented to address all identified issues:

1.  **Query Refactoring:** Both repository functions (`findInstalledAppsByTeamId` and `findManyInvitationsByEmail`) were rewritten to use explicit, flat `JOIN`s, with data mapping occurring in the application layer.
2.  **Database Indexing:** A new Drizzle migration was created and applied to add the necessary indexes to the `appsToTeams` and `invitations` tables.
3.  **Connection Pool Caching:** The database client (`packages/db/src/client.ts`) was refactored to ensure a single, persistent connection pool is created and reused across the application's lifecycle.

## 4. Final Outcome

- **Status:** ✅ **Resolved**.
- **Performance:** Backend latency for the affected procedures was successfully reduced from **~2.8s to ~500ms**.
- **Conclusion:** The optimization of the Core Engine's backend was successful. The remaining performance issues were confirmed to be a separate, client-side rendering bottleneck, which is being addressed in a [dedicated frontend optimization plan](../frontend-performance-optimization-feb-2025.md).
