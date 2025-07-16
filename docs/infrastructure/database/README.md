<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="medium" -->category: overview
complexity: basic
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: devops
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# Database Infrastructure

This section contains database architecture, schema design, and data management documentation for the Kodix platform.

## 🔍 🎯 Overview

<!-- AI-COMPRESS: strategy="summary" max-tokens="150" -->
**Quick Summary**: Key points for rapid AI context understanding.
<!-- /AI-COMPRESS -->
Database infrastructure documentation covering MySQL database design, Drizzle ORM patterns, schema management, and data optimization strategies.

### Technology Stack
- **MySQL**: Primary relational database
- **Drizzle ORM**: Type-safe database operations
- **Connection Pooling**: Optimized database connections
- **Migrations**: Schema version management

## 📋 Content Plan

This section will contain:
- **Database Schema**: Complete schema documentation
- **Migration Guides**: Schema migration procedures
- **Performance Optimization**: Query optimization and indexing
- **Backup & Recovery**: Data backup and disaster recovery
- **Multi-tenancy**: Team-based data isolation patterns

## 🏗️ 🏗️ Database Architecture

### Schema Design
- **Multi-tenant Architecture**: Team-based data isolation
- **Normalized Structure**: Proper relational design
- **Indexing Strategy**: Optimized query performance
- **Foreign Key Constraints**: Data integrity enforcement

### Drizzle ORM Patterns
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Example schema definition
export const userTable = mysqlTable('users', {
  id: varchar('id', { length: 191 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  teamId: varchar('team_id', { length: 191 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow()
});
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### Query Patterns
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
// Type-safe database queries
const users = await db
  .select()
  .from(userTable)
  .where(eq(userTable.teamId, teamId))
  .orderBy(userTable.createdAt);
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🔧 Development Guidelines

### Schema Management
- Use Drizzle migrations for all schema changes
- Follow naming conventions for tables and columns
- Implement proper indexing for performance
- Maintain referential integrity with foreign keys

### Query Optimization
- Use proper WHERE clauses for team isolation
- Implement efficient pagination patterns
- Optimize N+1 query problems
- Monitor query performance

### Data Security
- Implement team-based data isolation
- Use parameterized queries to prevent SQL injection
- Encrypt sensitive data at rest
- Audit data access patterns

## 🚀 Getting Started

### Local Development
1. **Start Database**: `docker-compose up mysql`
2. **Run Migrations**: `pnpm db:migrate`
3. **Seed Data**: `pnpm db:seed`
4. **Studio Access**: `pnpm db:studio`

### Database Connection
<!-- AI-CODE-BLOCK: typescript-example -->
<!-- AI-CODE-OPTIMIZATION: language="typescript" context="kodix-patterns" -->
```typescript
// AI-CONTEXT: TypeScript implementation following Kodix patterns
import { db } from "@kdx/db";

// All database operations use the shared connection
const result = await db.select().from(userTable);
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

---

**Status**: Content Development in Progress  
**Maintained By**: Database Team  
**Last Updated**: 2025-07-12
