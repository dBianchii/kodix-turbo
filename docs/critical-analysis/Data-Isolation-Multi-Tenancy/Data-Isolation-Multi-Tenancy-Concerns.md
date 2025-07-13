<!-- AI-METADATA:
category: reference
complexity: basic
updated: 2025-07-12
claude-ready: true
-->

# Data-Isolation & Multi-Tenancy Concerns in a Single-Repo Architecture

_(Team ID + App ID Scoping)_

## 1 Context

The current codebase is a **monorepo** that hosts multiple products (“apps”) serving multiple customer workspaces (“teams”).  
All services, migrations, and CI/CD pipelines run side by side, sharing the same runtime and primary database cluster.

> **Goal**: Provide strict, garantied isolation of every record so that **no team** can ever access or even infer the data of **any other team**, even when a user switches teams or apps in the same browser session.

---

## 2 Core Challenges

| Layer                      | Why It Is Hard                                                                                                                                                                                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Database schema**        | Every table—including generic ones such as `notification`, `audit_log`, or `file_upload`—must include _both_ `team_id` **and** `app_id`. Composite indexes and FKs explode in number, affecting write performance and complicating migrations. |
| **Query enforcement**      | ORMs / query builders must inject `(team_id, app_id)` filters automatically. Any raw SQL, background job, or analytics query that forgets one of the two keys becomes a silent data leak.                                                      |
| **In-process caching**     | Key names in Redis, in-memory LRU caches, etc., can never store plain entity IDs (e.g. `user:123`) but must be salted with both scope IDs (`user:{team}:{app}:123`) to avoid cross-tenant reads.                                               |
| **Session context**        | The frontend allows live switching between teams/apps without re-authentication. The backend must propagate the active pair as immutable context across HTTP handlers, WebSocket channels, cron jobs, and queue workers.                       |
| **Integration services**   | Shared modules (payments, notifications, search, analytics) often expose “global” endpoints. They must be hardened to reject any request lacking full scoping and to re-validate scope on every downstream call.                               |
| **Testing & CI**           | Unit, integration, and e2e suites need multi-tenant fixtures. Each new feature doubles the test matrix (at minimum: same team / cross team, same app / cross app), increasing runtime and maintenance burden.                                  |
| **Operational visibility** | Logs and metrics must include both IDs to make troubleshooting feasible. Otherwise, incidents turn into guessing games across hundreds of similar events.                                                                                      |
| **Performance tuning**     | Composite keys increase index size; joins on `(team_id, app_id, id)` become heavier. At scale (dozens of internal startups), poorly filtered queries risk cluster-wide slowdowns or force premature sharding.                                  |

---

## 3 Failure Modes & Risk Scenarios

1. **Missing Filter in Edge Case**  
   An admin report or background export forgets to apply `app_id`, returning another product’s data.

2. **Cache Pollution**  
   An LRU cache keyed only by `team_id` surfaces stale data from a different app.

3. **Third-Party Callback**  
   A webhook handler processes events without validating the embedded `team_id`, attaching external payment info to the wrong tenant.

4. **Migration Slip-Up**  
   A new table is added with just `team_id`. Six months later a JOIN mixes rows across apps.

5. **Debug Endpoint Exposure**  
   An internal “support” API bypasses the tenancy middleware “for convenience” and leaks PII.

---

## 4 Trade-Off Spectrum

| Strategy                                      | Pros                                  | Cons                                                        |
| --------------------------------------------- | ------------------------------------- | ----------------------------------------------------------- |
| **Single DB, strict scopes (current vision)** | Simple ops, maximal code reuse        | High cognitive load; any slip is catastrophic               |
| **Schema-per-app (namespaced tables)**        | Isolation inside the same cluster     | Migrating cross-app data is painful; ORM support limited    |
| **DB-per-app**                                | Strong isolation by default           | More infra; duplicate migrations; cross-app reports complex |
| **Micro-services per domain**                 | Clear ownership, isolated data stores | Dev-ops overhead; distributed transaction complexity        |

---

## 5 Recommended Guardrails

1.  **Enforced Scope Middleware**

    -     Central HTTP / gRPC interceptor injects `(team_id, app_id)` into request context.
    -     Reject any handler that tries to read the database without that context present.

2.  **ORM Policies / Row-Level Security**

    -     At the DB layer, PostgreSQL RLS or MySQL views to guarantee every query filters on both keys.
    -     Zero possibility of bypass through ad-hoc SQL.

3.  **Scoped Cache Keys & Namespacing Helpers**  
    Provide utilities like `cacheKey('user', id)` that automatically prepend the current scope.

4.  **Tenant-Aware Job Queues**  
    Serialize scope into job payloads; worker bootstrap validates and reattaches context before executing business logic.

5.  **Static Analysis & Linters**  
    Custom ESLint / TS-Transformer rules that flag any query missing the scope filter or any table missing composite PK (`team_id`, `app_id`, `id`).

6.  **Automated Multi-Tenant Test Harness**  
    A test helper that runs each suite against two fixtures (`teamA/appX`, `teamB/appY`) and diff-checks the outputs.

7.  **Observability Defaults**  
    Logging library automatically adds the scope IDs to every log line, trace, and metric tag.

8.  **Security Chaos Drills**  
    Quarterly red-team exercises that attempt to break tenant boundaries and track mean-time-to-detection.

---

## 6 Decision Points

- **Is the benefit of maximized code reuse worth the perpetual overhead of double-scoping?**
- **Would a hybrid model (shared core + app-specific micro-services) achieve better risk balance?**
- **Which guardrails can be automated to reduce human error, and which will always rely on discipline?**

---

## 7 Next Steps for Evaluation

1. **Audit Existing Repositories**
   - Verify every table contains both keys, correct FK constraints, and indices.
2. **Review Query Builders**
   - Confirm default scopes are applied; search for `knex.raw` / `sql` calls without filters.
3. **Scan for Non-Scoped Caches**
   - Redis keys or in-memory stores missing the composite prefix.
4. **Benchmark Composite-Key Performance**
   - Identify hotspots requiring compound-index tuning or denormalization.
5. **Prototype RLS / View-Based Isolation**
   - Measure developer ergonomics and overhead compared to the current approach.

> **Outcome**: A clear, quantified risk–benefit profile to decide whether to double-down on single-repo multi-tenancy or pivot to a more segmented architecture.

---
