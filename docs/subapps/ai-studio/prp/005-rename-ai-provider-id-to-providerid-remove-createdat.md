# PRP-005: Rename ai_provider.id to providerId and Remove createdAt Field

## Overview

**Priority**: Medium  
**Estimated Effort**: 4-6 hours  
**SubApp**: AI Studio  
**Dependencies**: None  
**Breaking Changes**: Yes

## Background

This PRP addresses a database schema change for the `ai_provider` table to improve consistency and reduce unused fields:

1. **Field Rename**: `ai_provider.id` → `ai_provider.providerId` for better semantic clarity
2. **Field Removal**: Remove `ai_provider.createdAt` field as it's not actively used in the application

### Motivation

- **Consistency**: The field name `providerId` better reflects its usage across the codebase where it's referenced as a provider identifier
- **Clarity**: Aligns with naming conventions used in related tables (`ai_model.providerId`, `ai_team_provider_token.providerId`)
- **Cleanup**: The `createdAt` field has no business logic dependencies and removing it simplifies the schema

## Technical Analysis

### Current Dependencies

#### Database Schema Impact
- **Primary Key**: `ai_provider.id` is the primary key with constraint `ai_provider_id`
- **Foreign Key References**: Multiple tables reference `ai_provider.id`:
  - `ai_model.providerId` → `ai_provider.id` (active FK)
  - `ai_team_provider_token.providerId` → `ai_provider.id` (active FK)
- **Index Impact**: `ai_provider_created_at_idx` index will be removed

#### Code Dependencies Analysis

**Repository Layer** (`packages/db/src/repositories/ai-studio.ts`):
- `AiProviderRepository.findById()` - Uses `aiProvider.id`
- `AiProviderRepository.update()` - Uses `aiProvider.id` in WHERE clause
- `AiProviderRepository.delete()` - Uses `aiProvider.id` in WHERE clause
- Repository relations use `aiProvider.id` for joins

**tRPC API Layer** (`packages/api/src/trpc/routers/app/ai-studio/providers.ts`):
- All CRUD operations use `id` parameter
- `findAiProviderById`, `updateAiProvider`, `deleteAiProvider` procedures

**Service Layer** (`packages/api/src/internal/services/`):
- `ai-studio.service.ts` - Uses provider ID for token lookup
- `ai-model-sync.service.ts` - References `aiProvider.id` for provider queries

**Frontend Components**:
- `AiProviderForm.tsx` - Uses `providerId` prop
- `hooks/useAiProvider.ts` - TypeScript interface defines `id: string`
- Provider selection components use provider ID

**Validation Layer** (`packages/validators/src/trpc/app/ai-studio.ts`):
- `updateAiProviderSchema` has `id: z.string()` field
- `idSchema` for generic ID validation

**Type Definitions** (`packages/shared/src/types/ai-studio.ts`):
- `AiProvider` interface has `id: string` field
- Multiple interfaces reference `providerId`

### Impact Assessment

#### High Impact Areas
1. **Database Migration**: Complex migration due to foreign key constraints
2. **Repository Layer**: All CRUD operations need field name updates
3. **API Layer**: Parameter validation and routing logic
4. **Frontend**: TypeScript interfaces and component props

#### Medium Impact Areas
1. **Service Layer**: Provider lookup and caching logic
2. **Tests**: Update test data and assertions
3. **Documentation**: Update API documentation and schemas

#### Low Impact Areas
1. **Frontend UI**: Minimal visual changes
2. **Performance**: No performance impact expected

### Risk Assessment

**High Risks**:
- Database migration with active foreign keys requires careful transaction handling
- Potential downtime during schema migration
- Need to update all referencing code simultaneously

**Medium Risks**:
- TypeScript compilation errors if interfaces aren't updated consistently
- Test suite failures requiring comprehensive test data updates

**Mitigation Strategies**:
- Use database transactions for atomic migration
- Implement comprehensive test coverage before migration
- Deploy during low-traffic window
- Have rollback plan ready

## Implementation Plan

### Phase 1: Database Migration Script
1. **Create Migration SQL** that handles:
   ```sql
   -- Disable foreign key checks temporarily
   SET FOREIGN_KEY_CHECKS = 0;
   
   -- Rename primary key column
   ALTER TABLE ai_provider CHANGE COLUMN id providerId varchar(12) NOT NULL;
   
   -- Update constraint name
   ALTER TABLE ai_provider DROP PRIMARY KEY;
   ALTER TABLE ai_provider ADD CONSTRAINT ai_provider_providerId PRIMARY KEY (providerId);
   
   -- Remove createdAt column and its index
   DROP INDEX ai_provider_created_at_idx ON ai_provider;
   ALTER TABLE ai_provider DROP COLUMN createdAt;
   
   -- Re-enable foreign key checks
   SET FOREIGN_KEY_CHECKS = 1;
   ```

2. **Update Foreign Key References**:
   - No changes needed for `ai_model.providerId` and `ai_team_provider_token.providerId` as they already use correct naming

### Phase 2: Schema Definition Updates
1. **Update Drizzle Schema** (`packages/db/src/schema/apps/ai-studio.ts`):
   ```typescript
   export const aiProvider = mysqlTable(
     "ai_provider",
     (t) => ({
       providerId: nanoidPrimaryKey(t), // Renamed from 'id'
       name: t.varchar({ length: 100 }).notNull(),
       baseUrl: t.text(),
       // createdAt removed
     }),
     (table) => ({
       nameIdx: index("ai_provider_name_idx").on(table.name),
       // createdAtIdx removed
     }),
   );
   ```

2. **Update Relations**:
   ```typescript
   export const aiModelRelations = relations(aiModel, ({ one, many }) => ({
     provider: one(aiProvider, {
       fields: [aiModel.providerId],
       references: [aiProvider.providerId], // Updated reference
     }),
     // ... other relations
   }));
   ```

### Phase 3: Repository Layer Updates
1. **Update `AiProviderRepository`** methods:
   ```typescript
   // Update all queries to use providerId instead of id
   findById: async (providerId: string) => {
     return db.query.aiProvider.findFirst({
       where: eq(aiProvider.providerId, providerId), // Updated field
       // ...
     });
   },
   
   update: async (providerId: string, data: Partial<typeof aiProvider.$inferInsert>) => {
     await db.update(aiProvider).set(data).where(eq(aiProvider.providerId, providerId));
     return AiProviderRepository.findById(providerId);
   },
   
   delete: async (providerId: string) => {
     // Update WHERE clauses
     await tx.delete(aiProvider).where(eq(aiProvider.providerId, providerId));
   },
   ```

### Phase 4: API and Service Layer Updates
1. **Update tRPC Procedures**:
   ```typescript
   // Change parameter names from 'id' to 'providerId'
   const providerIdSchema = z.object({
     providerId: z.string(),
   });
   
   findAiProviderById: protectedProcedure
     .input(providerIdSchema)
     .query(async ({ input }) => {
       return await aiStudioRepository.AiProviderRepository.findById(input.providerId);
     }),
   ```

2. **Update Service Methods**:
   - Update `AiStudioService.getProviderToken()` calls
   - Update any caching keys that use provider ID

### Phase 5: Frontend and Type Updates
1. **Update TypeScript Interfaces**:
   ```typescript
   // packages/shared/src/types/ai-studio.ts
   export interface AiProvider {
     providerId: string; // Renamed from 'id'
     name: string;
     baseUrl?: string;
     // createdAt removed
     models?: AiModel[];
     tokens?: AiProviderToken[];
   }
   ```

2. **Update React Components**:
   ```typescript
   // Update all props and state that reference provider.id
   interface AiProviderFormProps {
     providerId?: string; // Updated prop name
     onSuccess?: (provider: any) => void;
     onCancel?: () => void;
   }
   ```

3. **Update Validation Schemas**:
   ```typescript
   export const updateAiProviderSchema = z.object({
     providerId: z.string(), // Renamed from 'id'
     name: z.string().min(1, "Nome é obrigatório").optional(),
     // ... other fields
   });
   ```

### Phase 6: Testing Updates
1. **Update Test Data**:
   - Mock data objects with `providerId` instead of `id`
   - Remove `createdAt` from test fixtures
   
2. **Update Test Assertions**:
   - Verify queries use correct field names
   - Test foreign key relationships still work
   - Validate API responses use new structure

### Phase 7: Documentation Updates
1. **API Documentation**: Update all references to use `providerId`
2. **Database Schema Documentation**: Update ER diagrams and field descriptions
3. **Developer Guides**: Update any code examples

## Testing Strategy

### Pre-Migration Testing
1. **Backup Validation**: Ensure complete database backup exists
2. **FK Constraint Testing**: Verify all foreign key relationships
3. **Data Integrity Checks**: Validate no orphaned records exist

### Migration Testing
1. **Transaction Testing**: Verify atomic migration in transaction
2. **Rollback Testing**: Test rollback procedures work correctly
3. **Performance Testing**: Measure migration execution time

### Post-Migration Testing
1. **API Testing**: Full tRPC API test suite
2. **Integration Testing**: Cross-SubApp functionality (Chat ↔ AI Studio)
3. **UI Testing**: Frontend components work with new field names
4. **Data Integrity**: Verify all relationships maintained

### Comprehensive Test Cases
```typescript
describe('AI Provider Schema Migration', () => {
  test('provider CRUD operations use providerId field', async () => {
    // Test create, read, update, delete with new field name
  });
  
  test('foreign key relationships work correctly', async () => {
    // Test ai_model and ai_team_provider_token relationships
  });
  
  test('API endpoints accept providerId parameter', async () => {
    // Test all tRPC procedures
  });
  
  test('frontend components render with new prop names', async () => {
    // Test React components
  });
});
```

## Deployment Strategy

### Preparation Phase
1. **Code Review**: Complete code review of all changes
2. **Staging Deployment**: Deploy to staging environment
3. **Staging Testing**: Run full test suite on staging
4. **Performance Testing**: Validate no performance regression

### Migration Execution
1. **Maintenance Window**: Schedule during low-traffic period
2. **Database Backup**: Create pre-migration backup
3. **Execute Migration**: Run migration script in transaction
4. **Validate Migration**: Run post-migration integrity checks
5. **Deploy Code**: Deploy application code with new field references
6. **Smoke Testing**: Run critical path tests

### Rollback Plan
If issues occur:
1. **Stop Application**: Put application in maintenance mode
2. **Restore Database**: Restore from pre-migration backup
3. **Deploy Previous Code**: Revert to previous application version
4. **Validate Rollback**: Ensure system functioning normally

## Success Criteria

### Technical Success
- [ ] All database queries use `providerId` field correctly
- [ ] Foreign key relationships maintained and functional
- [ ] No `createdAt` field references remain in codebase
- [ ] All tests passing with new schema
- [ ] No runtime errors in staging environment

### Functional Success
- [ ] AI Studio provider management works correctly
- [ ] Chat SubApp can access AI providers through service layer
- [ ] Provider token management functional
- [ ] Model-provider relationships intact
- [ ] API responses use correct field names

### Performance Success
- [ ] No performance degradation in provider queries
- [ ] Migration completes within acceptable time window
- [ ] Application startup time unchanged

## Implementation Checklist

### Database Migration
- [ ] Create migration SQL script
- [ ] Test migration on staging database
- [ ] Verify foreign key constraints work
- [ ] Validate data integrity post-migration

### Code Updates
- [ ] Update Drizzle schema definitions
- [ ] Update repository layer methods
- [ ] Update tRPC API procedures
- [ ] Update service layer calls
- [ ] Update TypeScript interfaces
- [ ] Update validation schemas
- [ ] Update React components
- [ ] Update test files

### Quality Assurance
- [ ] Run full test suite
- [ ] Perform integration testing
- [ ] Validate API documentation
- [ ] Test frontend UI functionality
- [ ] Performance testing complete

### Deployment
- [ ] Deploy to staging environment
- [ ] Staging validation complete
- [ ] Production deployment plan ready
- [ ] Rollback procedures tested
- [ ] Monitoring alerts configured

## Notes

### Architecture Considerations
- This change maintains the existing Service Layer pattern
- No changes to multi-tenancy security model
- Foreign key relationships preserved with correct references
- Drizzle ORM migrations handle schema evolution

### Future Considerations
- Consider adding `updatedAt` field if audit trail becomes needed
- Monitor if `createdAt` removal impacts any reporting needs
- Evaluate adding provider-level configuration fields in future

### Related PRPs
- None - this is an isolated schema optimization
- Could be combined with other AI Studio schema cleanups in future

---

**Created**: 2025-01-19  
**Author**: Claude Code Assistant  
**Status**: Ready for Review  
**Priority**: Medium