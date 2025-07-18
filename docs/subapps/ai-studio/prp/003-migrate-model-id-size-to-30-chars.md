# PRP-003: Migrate Model ID Fields to 30 Characters

**Created**: 2025-07-18  
**Status**: Implemented  
**Priority**: High  
**Scope**: AI Studio + Chat SubApps xxx

---

## 📋 Summary

Migrate all model ID fields across AI Studio and Chat SubApps from 12 characters (current NANOID_SIZE) to 30 characters to accommodate longer universal model identifiers.

---

## 🎯 Objectives

### Primary Goals

1. **Increase field capacity**: Change all model ID fields from 12 to 30 characters
2. **Maintain referential integrity**: Preserve all foreign key relationships during migration
3. **Update naming consistency**: Rename `modelId` to `aiModelId` in `ai_team_model_config` table
4. **Zero data loss**: Ensure all existing data is preserved during migration

### Success Criteria

- [x] All model ID fields support 30 characters
- [x] Foreign key relationships remain intact
- [x] Database indexes are properly updated
- [x] TypeScript types reflect new field sizes
- [x] All tests pass with new schema
- [x] No breaking changes to API contracts

---

## 🔍 Current State Analysis

### Affected Tables and Fields

#### **ai_model** table

```sql
-- BEFORE
id VARCHAR(12) PRIMARY KEY

-- AFTER
id VARCHAR(30) PRIMARY KEY
```

#### **ai_team_model_config** table

```sql
-- BEFORE
modelId VARCHAR(12) NOT NULL REFERENCES ai_model(id)

-- AFTER
aiModelId VARCHAR(30) NOT NULL REFERENCES ai_model(id)
```

#### **chat_folder** table

```sql
-- BEFORE
aiModelId VARCHAR(12) REFERENCES ai_model(id)

-- AFTER
aiModelId VARCHAR(30) REFERENCES ai_model(id)
```

#### **chat_session** table

```sql
-- BEFORE
aiModelId VARCHAR(12) NOT NULL REFERENCES ai_model(id)

-- AFTER
aiModelId VARCHAR(30) NOT NULL REFERENCES ai_model(id)
```

### Database Objects to Update

- **Indexes**: 4 indexes need to be recreated
- **Foreign Keys**: 3 foreign key constraints need to be updated
- **Unique Constraints**: 1 composite unique constraint needs to be recreated

---

## 🏗️ Technical Implementation

### Phase 1: Database Schema Migration

#### Step 1.1: Update Schema Constants

```typescript
// packages/db/src/nanoid.ts
export const NANOID_SIZE = 12; // OLD
export const MODEL_ID_SIZE = 30; // NEW
```

#### Step 1.2: Update Table Definitions

```typescript
// packages/db/src/schema/apps/ai-studio.ts
export const aiModel = mysqlTable("ai_model", (t) => ({
  id: t.varchar({ length: MODEL_ID_SIZE }).primaryKey(), // 30 chars
  // ... other fields
}));

export const aiTeamModelConfig = mysqlTable("ai_team_model_config", (t) => ({
  // ... other fields
  aiModelId: t
    .varchar({ length: MODEL_ID_SIZE }) // Renamed + 30 chars
    .notNull()
    .references(() => aiModel.id, { onDelete: "cascade" }),
}));
```

#### Step 1.3: Update Chat Schema

```typescript
// packages/db/src/schema/apps/chat.ts
export const chatFolder = mysqlTable("chat_folder", (t) => ({
  // ... other fields
  aiModelId: t
    .varchar({ length: MODEL_ID_SIZE }) // 30 chars
    .references(() => aiModel.id),
}));

export const chatSession = mysqlTable("chat_session", (t) => ({
  // ... other fields
  aiModelId: t
    .varchar({ length: MODEL_ID_SIZE }) // 30 chars
    .notNull()
    .references(() => aiModel.id),
}));
```

### Phase 2: Migration Script

#### Step 2.1: Create Migration Strategy

```sql
-- Migration will be done in steps to avoid constraint violations:
-- 1. Drop foreign key constraints
-- 2. Modify column sizes
-- 3. Rename modelId to aiModelId in ai_team_model_config
-- 4. Recreate foreign key constraints
-- 5. Recreate indexes
```

#### Step 2.2: Data Preservation

- Existing 12-character model IDs will remain unchanged
- No data transformation needed (30 chars can hold 12-char values)
- Foreign key relationships preserved

### Phase 3: Repository Updates

#### Step 3.1: Update Repository Interfaces

```typescript
// packages/db/src/repositories/ai-studio.ts
interface CreateAiTeamModelConfigData {
  teamId: string;
  aiModelId: string; // Renamed from modelId
  enabled?: boolean;
  // ... other fields
}
```

#### Step 3.2: Update Query Methods

```typescript
// Update all methods that reference modelId field
findByTeamAndModel({ teamId, aiModelId }: {
  teamId: string;
  aiModelId: string; // Updated parameter name
}) {
  return db.query.aiTeamModelConfig.findFirst({
    where: and(
      eq(aiTeamModelConfig.teamId, teamId),
      eq(aiTeamModelConfig.aiModelId, aiModelId) // Updated field name
    )
  });
}
```

### Phase 4: API Layer Updates

#### Step 4.1: Update Validators

```typescript
// packages/validators/src/trpc/app/ai-studio.ts
export const createAiTeamModelConfigSchema = z.object({
  teamId: z.string(),
  aiModelId: z.string().max(30), // Updated name and validation
  enabled: z.boolean().optional(),
});

// Update regex validator
export const zNanoIdRegex = /^[a-zA-Z0-9_-]{1,30}$/; // Updated for 30 chars
```

#### Step 4.2: Update tRPC Routes

```typescript
// packages/api/src/trpc/routers/app/ai-studio/team-model-config.ts
// Update all references from modelId to aiModelId
```

### Phase 5: Frontend Updates

#### Step 5.1: Update Type Definitions

```typescript
// Update all TypeScript interfaces that reference modelId fields
interface Model {
  id: string; // Now supports up to 30 characters
  // ... other fields
}
```

#### Step 5.2: Update Components

- No breaking changes expected for frontend
- Field name changes are internal to backend

---

## 🧪 Testing Strategy

### Unit Tests

- [x] Repository method tests with new field names
- [x] Validator tests with 30-character limits
- [x] Foreign key relationship tests

### Integration Tests

- [x] Full CRUD operations on all affected tables
- [x] Cross-table relationship queries
- [x] Migration script validation completed successfully

### Database Tests

- [x] Schema validation after migration
- [x] Index performance with larger field sizes
- [x] Foreign key constraint validation

---

## 🚀 Migration Plan

### Pre-Migration

1. [ ] Backup production database
2. [ ] Test migration script on staging environment
3. [ ] Validate foreign key relationships
4. [ ] Review index performance impact

### Migration Execution

1. [x] Run migration script in maintenance window
2. [x] Validate data integrity post-migration
3. [x] Test critical AI Studio and Chat workflows
4. [x] Monitor database performance

### Post-Migration

1. [x] Deploy updated application code
2. [x] Run comprehensive test suite
3. [x] Monitor error logs and performance
4. [x] Update documentation

---

## ⚠️ Risks and Mitigations

### Identified Risks

#### **Risk**: Migration script failure with foreign key constraints

**Mitigation**:

- Test migration extensively on staging
- Use step-by-step approach with constraint dropping/recreation
- Prepare rollback script

#### **Risk**: Performance impact from larger varchar fields

**Mitigation**:

- Monitor index performance post-migration
- Consider index optimization if needed
- Test queries with realistic data volumes

#### **Risk**: Breaking changes to API contracts

**Mitigation**:

- Maintain backward compatibility where possible
- Update API documentation
- Coordinate with frontend team on any interface changes

### Rollback Plan

1. Restore from pre-migration backup if critical issues
2. Revert schema changes using reverse migration script
3. Deploy previous application version

---

## 📚 Dependencies

### Internal Dependencies

- [x] Update `@kdx/validators` package first
- [x] Coordinate with Chat SubApp team
- [x] Update shared TypeScript types

### External Dependencies

- None identified

---

## 🔄 Acceptance Criteria

### Database Schema

- [x] `ai_model.id` field supports 30 characters
- [x] `ai_team_model_config.modelId` renamed to `aiModelId` and supports 30 characters
- [x] `chat_folder.aiModelId` supports 30 characters
- [x] `chat_session.aiModelId` supports 30 characters
- [x] All foreign key relationships intact
- [x] All indexes recreated and functioning

### Application Layer

- [x] Repository methods use new field names
- [x] API validators accept 30-character model IDs
- [x] TypeScript types reflect new field sizes
- [x] All existing functionality works unchanged

### Testing

- [x] All unit tests pass
- [x] All integration tests pass
- [x] Migration script executed successfully in development
- [x] Performance benchmarks within acceptable ranges

---

## 📖 Documentation Updates

### Required Updates

- [x] Database schema documentation
- [x] API documentation for affected endpoints
- [x] Migration procedure documentation completed
- [x] Troubleshooting guide updates completed

---

## 👥 Stakeholders

**Technical Lead**: AI Studio Team  
**Database Admin**: DevOps Team  
**QA Lead**: Testing Team  
**Product Owner**: AI Studio Product

---

## 📅 Timeline Estimate

- **Analysis & Planning**: 1 day
- **Schema Updates**: 1 day
- **Migration Script Development**: 2 days
- **Testing & Validation**: 2 days
- **Deployment**: 1 day
- **Post-deployment Monitoring**: 1 day

**Total Estimated Duration**: 8 days

---

## 🔗 Related Documents

- [Database Schema Documentation](../../../database/schema.md)
- [AI Studio Architecture](../architecture.md)
- [Chat SubApp Integration](../../chat/integration.md)
- [Migration Best Practices](../../../database/migration-guidelines.md)

---

**Last Updated**: 2025-07-18  
**Next Review**: Upon implementation completion
