# PRP-002: Remove displayName from Chat and AI Studio - Use Only universal_model_id

**Status**: Ready for Implementation  
**Priority**: High  
**Impact**: Chat and AI Studio SubApps  
**Created**: 2025-01-18  

## Context and Problem Statement

Currently, the `ai_model` table contains both `displayName` and `universal_model_id` fields. The system inconsistently uses both fields across Chat and AI Studio SubApps, leading to confusion and potential data inconsistencies. The goal is to completely remove `displayName` usage from both SubApps and use only `universal_model_id` as the single source of truth for model identification.

## Current State Analysis

### Database Schema
```sql
-- ai_model table structure
CREATE TABLE ai_model (
  id VARCHAR(21) PRIMARY KEY,
  displayName VARCHAR(100) NOT NULL,          -- TO BE REMOVED FROM USAGE
  universal_model_id VARCHAR(60) NOT NULL,    -- SINGLE SOURCE OF TRUTH
  providerId VARCHAR(21) NOT NULL,
  status ENUM('active', 'archived') DEFAULT 'active',
  config TEXT,
  enabled BOOLEAN DEFAULT true,
  -- ... other fields
);
```

### Current Usage Patterns

#### displayName Usage Found:
1. **Frontend Components**:
   - `model-selector.tsx`: Uses `displayName` for UI display and sorting
   - `model-info-badge.tsx`: Uses `displayName` as fallback for model identification
   - `models-section.tsx`: Displays `displayName` in table and forms
   - `enabled-models-section.tsx`: Shows `displayName` in UI

2. **Backend Repositories**:
   - `ai-studio.ts`: Repository methods return and sort by `displayName`
   - Database queries use `displayName` for sorting and display

3. **API Routes**:
   - tRPC validators accept `displayName` in schemas
   - API responses include `displayName` fields

4. **Types and Interfaces**:
   - TypeScript interfaces include `displayName` as required field
   - Component prop types expect `displayName`

#### universal_model_id Usage:
- Currently used primarily for unique constraints and model sync operations
- Used in `model-info-badge.tsx` as primary identifier in some cases
- Repository has methods to find by `universal_model_id`

## Decision

**Remove all usage of `displayName` from Chat and AI Studio SubApps and use only `universal_model_id`.**

### Rationale:
1. **Single Source of Truth**: Eliminates confusion between two identification fields
2. **Data Consistency**: Reduces risk of data mismatches
3. **Simplified Logic**: Removes conditional logic that checks both fields
4. **Future-Proof**: Aligns with model sync architecture that uses `universal_model_id`

## Implementation Plan

### Phase 1: Backend Migration (Priority: Critical)

#### 1.1 Update Database Repositories
**Files**: `packages/db/src/repositories/ai-studio.ts`

- **Repository Methods**: Update all methods to use `universal_model_id` instead of `displayName`
  - `findMany()`: Sort by `universal_model_id` instead of `displayName`
  - `findAvailableModelsByTeam()`: Use `universal_model_id` for sorting
  - All query results: Return `universal_model_id` as the display identifier

#### 1.2 Update API Routes and Validators
**Files**: 
- `packages/validators/src/trpc/app/ai-studio.ts`
- `packages/api/src/trpc/routers/app/ai-studio/models.ts`

- **Validator Schemas**: 
  - Remove `displayName` from create/update schemas
  - Replace with `universal_model_id` where needed
  - Update TypeScript types

- **API Handlers**:
  - Update create model handler to not use `displayName`
  - Modify response structures

#### 1.3 Update Service Layer
**Files**: `packages/api/src/internal/services/ai-studio.service.ts`

- Update service methods to work with `universal_model_id`
- Ensure cross-SubApp communication uses `universal_model_id`

### Phase 2: Frontend Migration (Priority: High)

#### 2.1 Update TypeScript Interfaces
**Files**: `apps/kdx/src/trpc/shared.ts` and component types

- Remove `displayName` from interfaces
- Update type definitions to use `universal_model_id`

#### 2.2 Update Chat Components
**Files**:
- `apps/kdx/src/app/[locale]/(authed)/apps/chat/_components/model-selector.tsx`
- `apps/kdx/src/app/[locale]/(authed)/apps/chat/_components/model-info-badge.tsx`
- `apps/kdx/src/app/[locale]/(authed)/apps/chat/_components/app-sidebar.tsx`

**Changes**:
- Replace all `displayName` references with `universal_model_id`
- Update sorting logic to use `universal_model_id`
- Modify UI display to show `universal_model_id`
- Update component props and interfaces

#### 2.3 Update AI Studio Components
**Files**:
- `apps/kdx/src/app/[locale]/(authed)/apps/aiStudio/_components/sections/models-section.tsx`
- `apps/kdx/src/app/[locale]/(authed)/apps/aiStudio/_components/sections/enabled-models-section.tsx`

**Changes**:
- Remove `displayName` from table columns and forms
- Display `universal_model_id` instead of `displayName`
- Update form validation and submission logic
- Modify sorting and filtering to use `universal_model_id`

### Phase 3: Database Schema Cleanup (Priority: Medium)

#### 3.1 Database Migration Script
**Files**: `packages/db/drizzle/migrations/`

**Create migration to**:
- ⚠️ **DO NOT DROP** `displayName` column (preserve for backward compatibility)
- Add database comment indicating `displayName` is deprecated
- Ensure `universal_model_id` has proper constraints and indexes

**Note**: Column removal should be planned separately after confirming no external dependencies.

### Phase 4: Testing and Validation (Priority: Critical)

#### 4.1 Update Existing Tests
**Files**: 
- `packages/api/src/services/__tests__/ai-studio-*.test.ts`
- `apps/kdx/src/app/[locale]/(authed)/apps/chat/__tests__/`

**Changes**:
- Update test data to use `universal_model_id`
- Modify assertions to check `universal_model_id`
- Add tests for migration scenarios

#### 4.2 Integration Testing
- Test Chat model selection with `universal_model_id`
- Verify AI Studio model management works correctly
- Ensure cross-SubApp communication still functions
- Test model sync processes

### Phase 5: Documentation Update (Priority: Low)

#### 5.1 Update API Documentation
**Files**: `docs/subapps/ai-studio/backend/api-reference.md`

- Update API endpoint documentation
- Revise model data structure examples
- Update integration examples

#### 5.2 Update Architecture Documentation
**Files**: `docs/subapps/ai-studio/` and `docs/subapps/chat/`

- Update data flow diagrams
- Revise model identification sections
- Update SubApp integration guides

## Implementation Details

### Key Considerations

1. **UI Display Strategy**:
   - Use `universal_model_id` directly for display
   - Apply formatting function if needed (e.g., replace underscores with spaces)
   - Consider adding user-friendly formatting for common model IDs

2. **Sorting and Filtering**:
   - Update all sorting logic to use `universal_model_id`
   - Maintain alphabetical sorting behavior
   - Ensure consistent ordering across components

3. **Backward Compatibility**:
   - Keep `displayName` column in database schema temporarily
   - Ensure model sync processes continue to work
   - Plan for gradual external system migration

4. **Data Migration**:
   - Ensure all existing models have valid `universal_model_id` values
   - Verify uniqueness constraints are properly enforced
   - Test with production-like data volumes

### Risk Mitigation

1. **Data Loss Prevention**:
   - Do not drop `displayName` column immediately
   - Implement comprehensive testing before deployment
   - Plan rollback strategy

2. **User Experience**:
   - Ensure model names remain user-friendly
   - Test UI with real model IDs
   - Consider user feedback on name readability

3. **System Integration**:
   - Verify all SubApp communications work correctly
   - Test model sync processes thoroughly
   - Ensure external integrations aren't broken

## Acceptance Criteria

### Must Have:
- [ ] All Chat components use only `universal_model_id`
- [ ] All AI Studio components use only `universal_model_id`
- [ ] API endpoints accept/return `universal_model_id` instead of `displayName`
- [ ] Database queries sort/filter by `universal_model_id`
- [ ] All existing tests pass with new implementation
- [ ] Model selection functionality works correctly
- [ ] Cross-SubApp model access uses `universal_model_id`

### Should Have:
- [ ] User-friendly display formatting for model IDs
- [ ] Comprehensive test coverage for migration
- [ ] Updated documentation reflecting changes
- [ ] Performance is maintained or improved

### Could Have:
- [ ] Database migration script for column cleanup
- [ ] Monitoring for usage of deprecated fields
- [ ] Automated validation of data consistency

## Success Metrics

1. **Functional**:
   - Zero references to `displayName` in Chat and AI Studio code
   - All model-related operations work correctly
   - Model sync processes continue to function

2. **Performance**:
   - No degradation in model loading times
   - Sorting and filtering performance maintained
   - Database query performance stable

3. **User Experience**:
   - Model selection UI remains intuitive
   - Model identification is clear to users
   - No breaking changes to user workflows

## Dependencies

### Internal:
- Database migrations framework
- tRPC API layer
- Component testing infrastructure
- Model sync service

### External:
- None identified (internal SubApp change only)

## Timeline

**Estimated Duration**: 2-3 days

- **Day 1**: Phase 1 (Backend migration) + Phase 2.1 (Types)
- **Day 2**: Phase 2.2-2.3 (Frontend components)
- **Day 3**: Phase 4 (Testing) + Phase 5 (Documentation)

**Critical Path**: Backend repository changes → API updates → Frontend component updates → Testing

## Technical Implementation Notes

### Code Patterns to Replace:

```typescript
// OLD: Using displayName
model.displayName
currentModel.displayName
sort((a, b) => a.displayName.localeCompare(b.displayName))

// NEW: Using universal_model_id
model.universalModelId
currentModel.universalModelId  
sort((a, b) => a.universalModelId.localeCompare(b.universalModelId))
```

### Database Query Updates:

```sql
-- OLD: 
ORDER BY displayName

-- NEW:
ORDER BY universal_model_id
```

### Component Props Updates:

```typescript
// OLD:
interface ModelProps {
  displayName: string;
}

// NEW:
interface ModelProps {
  universalModelId: string;
}
```

This PRP provides a comprehensive plan to remove `displayName` usage from Chat and AI Studio SubApps while using `universal_model_id` as the single source of truth for model identification.