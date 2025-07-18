# PRP-004: Rename ai_model.id to modelId and Remove universal_model_id

**Created**: 2025-07-18  
**Status**: Draft  
**Priority**: High  
**Scope**: AI Studio + Chat SubApps  

---

## 📋 Summary

Rename the primary key field `id` to `modelId` in the `ai_model` table and completely remove the `universal_model_id` field. All references to `universal_model_id` will be replaced with the new `modelId` field, creating a single source of truth for model identification.

---

## 🎯 Objectives

### Primary Goals
1. **Simplify schema**: Rename `ai_model.id` to `ai_model.modelId` for better semantic clarity
2. **Remove redundancy**: Eliminate `universal_model_id` field completely from all tables
3. **Update references**: Change all foreign key references from `id` to `modelId`
4. **Maintain consistency**: Ensure single source of truth using `modelId` everywhere
5. **Zero data loss**: Preserve all existing functionality during migration

### Success Criteria
- [ ] `ai_model.id` renamed to `ai_model.modelId`
- [ ] `ai_model.universal_model_id` completely removed
- [ ] All foreign key relationships updated to reference `modelId`
- [ ] All queries and business logic use `modelId` instead of `universal_model_id`
- [ ] Frontend components display `modelId` values
- [ ] All tests pass with new schema
- [ ] No breaking changes to core functionality

---

## 🔍 Current State Analysis

### Current ai_model Table Structure
```sql
ai_model {
  id VARCHAR(30) PRIMARY KEY,                    -- Will become modelId
  universal_model_id VARCHAR(60) NOT NULL,      -- Will be REMOVED
  provider_id VARCHAR(12) NOT NULL,
  status ENUM('active', 'archived'),
  config TEXT,
  original_config TEXT,
  enabled BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
}
```

### Target ai_model Table Structure
```sql
ai_model {
  modelId VARCHAR(30) PRIMARY KEY,              -- Renamed from id
  provider_id VARCHAR(12) NOT NULL,
  status ENUM('active', 'archived'),
  config TEXT,
  original_config TEXT,
  enabled BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
}
-- Note: universal_model_id completely removed
```

### Affected Foreign Key References
1. **ai_team_model_config.aiModelId** → references `ai_model.id` (will reference `ai_model.modelId`)
2. **chat_folder.aiModelId** → references `ai_model.id` (will reference `ai_model.modelId`)  
3. **chat_session.aiModelId** → references `ai_model.id` (will reference `ai_model.modelId`)

### Current Usage Patterns
- **Primary key access**: `ai_model.id` used for relationships and lookups
- **Display values**: `universal_model_id` used in UI components and business logic
- **Sync operations**: Both fields used inconsistently across different services

---

## 🏗️ Technical Implementation

### Phase 1: Database Schema Changes

#### Step 1.1: Update ai_model Table Definition
```typescript
// packages/db/src/schema/apps/ai-studio.ts
export const aiModel = mysqlTable(
  "ai_model",
  (t) => ({
    modelId: aiModelIdPrimaryKey(t).primaryKey(),  // Renamed from 'id'
    // universalModelId: REMOVED COMPLETELY
    providerId: t
      .varchar({ length: NANOID_SIZE })
      .notNull()
      .references(() => aiProvider.id),
    status: mysqlEnum("status", ["active", "archived"])
      .default("active")
      .notNull(),
    config: t.text(),
    originalConfig: t.text("original_config"),
    enabled: t.boolean().default(true).notNull(),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp().onUpdateNow(),
  }),
  (table) => ({
    // Remove universalModelIdIdx completely
    providerIdx: index("ai_model_provider_idx").on(table.providerId),
    statusIdx: index("ai_model_status_idx").on(table.status),
  }),
);
```

#### Step 1.2: Update Foreign Key References
```typescript
// packages/db/src/schema/apps/ai-studio.ts
export const aiTeamModelConfig = mysqlTable(
  "ai_team_model_config",
  (t) => ({
    // ... other fields
    aiModelId: t.varchar({ length: MODEL_ID_SIZE })
      .notNull()
      .references(() => aiModel.modelId, { onDelete: "cascade" }), // Updated reference
  }),
);

// packages/db/src/schema/apps/chat.ts
export const chatFolder = mysqlTable(
  "chat_folder",
  (t) => ({
    // ... other fields
    aiModelId: t.varchar({ length: MODEL_ID_SIZE })
      .references(() => aiModel.modelId), // Updated reference
  }),
);

export const chatSession = mysqlTable(
  "chat_session",
  (t) => ({
    // ... other fields  
    aiModelId: t.varchar({ length: MODEL_ID_SIZE })
      .notNull()
      .references(() => aiModel.modelId), // Updated reference
  }),
);
```

### Phase 2: Migration Strategy

#### Step 2.1: Data Migration Script
```sql
-- Step 1: Add new modelId column with data from current id
ALTER TABLE ai_model ADD COLUMN modelId VARCHAR(30);
UPDATE ai_model SET modelId = id;

-- Step 2: Drop foreign key constraints temporarily
ALTER TABLE ai_team_model_config DROP FOREIGN KEY fk_ai_team_model_config_ai_model_id;
ALTER TABLE chat_folder DROP FOREIGN KEY fk_chat_folder_ai_model_id;
ALTER TABLE chat_session DROP FOREIGN KEY fk_chat_session_ai_model_id;

-- Step 3: Update foreign key references to use new modelId values
-- (No data changes needed since modelId = id)

-- Step 4: Drop old primary key and make modelId the new primary key
ALTER TABLE ai_model DROP PRIMARY KEY;
ALTER TABLE ai_model DROP COLUMN id;
ALTER TABLE ai_model ADD PRIMARY KEY (modelId);

-- Step 5: Remove universal_model_id column completely
ALTER TABLE ai_model DROP COLUMN universal_model_id;
ALTER TABLE ai_model DROP INDEX ai_model_universal_model_id_idx;

-- Step 6: Recreate foreign key constraints with new references
ALTER TABLE ai_team_model_config 
  ADD CONSTRAINT fk_ai_team_model_config_ai_model_id 
  FOREIGN KEY (aiModelId) REFERENCES ai_model(modelId) ON DELETE CASCADE;

ALTER TABLE chat_folder 
  ADD CONSTRAINT fk_chat_folder_ai_model_id 
  FOREIGN KEY (aiModelId) REFERENCES ai_model(modelId);

ALTER TABLE chat_session 
  ADD CONSTRAINT fk_chat_session_ai_model_id 
  FOREIGN KEY (aiModelId) REFERENCES ai_model(modelId);
```

### Phase 3: Repository Layer Updates

#### Step 3.1: Update Repository Queries
```typescript
// packages/db/src/repositories/ai-studio.ts
export const AiModelRepository = {
  findById: async (modelId: string) => {
    return db.query.aiModel.findFirst({
      where: eq(aiModel.modelId, modelId), // Updated field reference
      with: {
        provider: {
          columns: { id: true, name: true, baseUrl: true },
        },
      },
    });
  },

  findByUniversalModelId: async (universalModelId: string) => {
    // REMOVE THIS METHOD - No longer needed
    // Replace all calls with findById(modelId)
  },

  create: async (data: {
    modelId: string; // Updated parameter name
    providerId: string;
    config?: any;
    enabled?: boolean;
    status?: "active" | "archived";
  }) => {
    const modelData = {
      ...data,
      modelId: data.modelId, // Use modelId directly
    };
    
    await db.insert(aiModel).values(modelData);
    return AiModelRepository.findById(modelData.modelId);
  },
};
```

#### Step 3.2: Update Service Layer
```typescript
// packages/api/src/internal/services/ai-model-sync.service.ts
export class AiModelSyncService {
  async applySync(diff: ModelSyncDiff) {
    // Update new model creation
    for (const model of newModels) {
      await db.insert(aiModel).values({
        modelId: model.modelId, // Use modelId as primary key
        providerId,
        status: model.status || "active",
        enabled: model.status !== "archived",
        config: JSON.stringify(model),
        originalConfig: JSON.stringify(model),
      });
    }

    // Update existing model queries
    for (const { existing, updated } of updatedModels) {
      await db
        .update(aiModel)
        .set({
          status: updated.status || "active",
          enabled: updated.status !== "archived",
          config: JSON.stringify(updated),
          originalConfig: JSON.stringify(updated),
          updatedAt: new Date(),
        })
        .where(eq(aiModel.modelId, existing.modelId)); // Updated field reference
    }
  }
}
```

### Phase 4: API Layer Updates

#### Step 4.1: Update Validators
```typescript
// packages/validators/src/trpc/app/ai-studio.ts
export const createAiModelSchema = z.object({
  modelId: ZModelId, // Changed from universalModelId
  providerId: z.string(),
  config: z.any().optional(),
  enabled: z.boolean().default(true),
});

export const updateAiModelSchema = z.object({
  modelId: ZModelId, // Primary key field
  providerId: z.string().optional(),
  config: z.any().optional(),
  enabled: z.boolean().optional(),
});

// Remove all universalModelId references
```

#### Step 4.2: Update tRPC Routes
```typescript
// packages/api/src/trpc/routers/app/ai-studio/*.ts
// Update all route handlers to use modelId instead of universalModelId
// Update all database queries to reference the new field structure
```

### Phase 5: Frontend Updates

#### Step 5.1: Update Component Logic
```typescript
// apps/kdx/src/app/.../enabled-models-section.tsx
function SortableTableRow({ model, ... }: SortableTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {/* Display modelId instead of universalModelId */}
          {model.modelId}
        </div>
      </TableCell>
      {/* ... rest of component */}
    </TableRow>
  );
}

// Update all other components that reference universalModelId
```

#### Step 5.2: Update Business Logic
```typescript
// Replace all instances of:
// model.universalModelId → model.modelId
// universalModelId → modelId
```

### Phase 6: Test Updates

#### Step 6.1: Update Test Data
```typescript
// packages/api/src/services/__tests__/*.test.ts
const testModel = {
  modelId: "gpt-4", // Changed from universalModelId
  providerId: "openai-provider-id",
  enabled: true,
  status: "active" as const,
};
```

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] Repository method tests with new field names
- [ ] Validator tests with updated schemas
- [ ] Service layer tests with modelId usage

### Integration Tests
- [ ] Full CRUD operations on ai_model table
- [ ] Foreign key relationship validation
- [ ] Cross-table queries and joins

### Migration Tests
- [ ] Data preservation during migration
- [ ] Foreign key constraint recreation
- [ ] Index recreation and performance

---

## 🚀 Migration Plan

### Pre-Migration Checklist
- [ ] Backup production database
- [ ] Test migration script on staging environment
- [ ] Validate all foreign key relationships
- [ ] Review performance impact of schema changes

### Migration Execution Steps
1. [ ] Run database migration script
2. [ ] Validate data integrity post-migration
3. [ ] Deploy updated application code
4. [ ] Test all AI Studio and Chat workflows
5. [ ] Monitor error logs and performance

### Post-Migration Validation
- [ ] Verify all foreign key constraints are active
- [ ] Test model sync functionality
- [ ] Validate frontend model display
- [ ] Run comprehensive test suite

---

## ⚠️ Risks and Mitigations

### Major Risks

#### **Risk**: Breaking changes to API contracts
**Mitigation**: 
- Coordinate deployment with frontend team
- Update all API documentation
- Test all integration points thoroughly

#### **Risk**: Data loss during migration
**Mitigation**:
- Complete database backup before migration
- Test migration script extensively on staging
- Prepare rollback procedures

#### **Risk**: Foreign key constraint violations
**Mitigation**:
- Drop and recreate constraints in correct order
- Validate data relationships before constraint recreation
- Monitor constraint creation for errors

### Rollback Plan
1. Restore from pre-migration backup if critical issues
2. Deploy previous application version
3. Revert database schema using reverse migration script

---

## 📚 Dependencies

### Internal Dependencies
- [ ] Update all packages that reference ai_model schema
- [ ] Coordinate with Chat SubApp team for schema changes
- [ ] Update shared TypeScript types and interfaces

### External Dependencies
- None identified

---

## 🔄 Acceptance Criteria

### Database Schema
- [ ] `ai_model.id` renamed to `ai_model.modelId`
- [ ] `ai_model.universal_model_id` completely removed
- [ ] All foreign key relationships reference `ai_model.modelId`
- [ ] All indexes updated and functioning correctly
- [ ] No orphaned data or constraint violations

### Application Layer
- [ ] All repository methods use `modelId` field
- [ ] All service layer logic references `modelId`
- [ ] API validators accept `modelId` parameter
- [ ] All existing functionality works unchanged

### Frontend
- [ ] Components display `modelId` values correctly
- [ ] No references to `universalModelId` remain
- [ ] All user interactions work as expected

### Testing
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Migration script tested successfully
- [ ] Performance benchmarks within acceptable ranges

---

## 📖 Documentation Updates

### Required Updates
- [ ] Database schema documentation
- [ ] API documentation for affected endpoints
- [ ] Migration procedure documentation
- [ ] Developer guide updates

---

## 👥 Stakeholders

**Technical Lead**: AI Studio Team  
**Database Admin**: DevOps Team  
**Frontend Team**: UI/UX Team  
**QA Lead**: Testing Team  

---

## 📅 Timeline Estimate

- **Analysis & Planning**: 1 day
- **Database Schema Updates**: 1 day
- **Migration Script Development**: 2 days
- **Repository & Service Updates**: 2 days
- **Frontend Updates**: 1 day
- **Testing & Validation**: 2 days
- **Deployment**: 1 day

**Total Estimated Duration**: 10 days

---

## 🔗 Related Documents

- [PRP-002: Remove displayName](./002-remove-displayname-use-universal-model-id.md)
- [PRP-003: Migrate Model ID Size](./003-migrate-model-id-size-to-30-chars.md)
- [Database Schema Documentation](../../../database/schema.md)
- [AI Studio Architecture](../architecture.md)

---

**Last Updated**: 2025-07-18  
**Next Review**: Upon technical team approval