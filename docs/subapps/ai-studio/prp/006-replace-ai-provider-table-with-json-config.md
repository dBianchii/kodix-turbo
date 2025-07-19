# PRP-006: Replace ai_provider Table with JSON Configuration

**Status**: Draft  
**Priority**: Medium  
**Complexity**: Medium  
**Estimated Time**: 4-6 hours  
**Author**: Claude Code  
**Date**: 2025-01-19  
**Component**: AI Studio SubApp  

## Overview

Replace the `ai_provider` database table with a JSON configuration file for managing AI provider metadata. This change simplifies the architecture by treating provider information as static configuration data rather than dynamic database records.

## Background

The current system stores AI provider information (name, base URL) in the `ai_provider` database table. However, this data is relatively static and doesn't change frequently. The existing `supported-providers.json` file already contains this information and serves as the source of truth for provider validation.

### Current Architecture Issues

1. **Dual Source of Truth**: Provider data exists in both database table and JSON config
2. **Unnecessary Complexity**: Simple metadata doesn't require database storage
3. **Foreign Key Overhead**: Relationships require database joins for static data
4. **Sync Complexity**: Provider data must be kept in sync between database and config

## Proposed Solution

### Core Changes

1. **Remove Database Dependencies**: Eliminate all database operations for provider metadata
2. **JSON-Only Configuration**: Use `supported-providers.json` as single source of truth
3. **Service Layer Updates**: Replace repository calls with JSON file reads
4. **Foreign Key Replacement**: Store `providerId` strings directly without foreign key constraints

### Architecture Benefits

- **Simplified Data Flow**: Single source of truth for provider configuration
- **Reduced Database Load**: Fewer tables and relationships to manage
- **Easier Deployment**: Configuration changes without database migrations
- **Better Performance**: In-memory JSON access vs database queries

## Technical Implementation

### 1. Database Schema Changes

#### Remove Tables
- `ai_provider` table (complete removal)

#### Update Foreign Key References
- `ai_model.providerId` - Keep as varchar, remove foreign key constraint
- `ai_team_provider_token.providerId` - Keep as varchar, remove foreign key constraint

### 2. JSON Configuration Structure

```json
{
  "providers": [
    {
      "providerId": "openai",
      "name": "OpenAI", 
      "baseUrl": "https://api.openai.com/v1"
    },
    {
      "providerId": "anthropic",
      "name": "Anthropic",
      "baseUrl": "https://api.anthropic.com/v1"
    },
    {
      "providerId": "google", 
      "name": "Google",
      "baseUrl": "https://generativelanguage.googleapis.com"
    },
    {
      "providerId": "xai",
      "name": "XAI", 
      "baseUrl": "https://api.x.ai/v1"
    }
  ]
}
```

### 3. Service Layer Implementation

#### New Provider Configuration Service

```typescript
// packages/api/src/internal/services/provider-config.service.ts
export class ProviderConfigService {
  private static readonly CONFIG_PATH = 'ai-model-sync-adapter/config/supported-providers.json';
  
  static getProviders(): ProviderConfig[] {
    // Read and parse JSON configuration
  }
  
  static getProviderById(providerId: string): ProviderConfig | null {
    // Find provider by ID
  }
  
  static getProviderByName(name: string): ProviderConfig | null {
    // Find provider by name
  }
  
  static validateProviderId(providerId: string): boolean {
    // Validate provider exists in configuration
  }
}
```

### 4. Repository Layer Updates

#### Remove AiProviderRepository
- Delete `AiProviderRepository` class completely
- Update imports across codebase

#### Update Related Repositories
- `AiModelRepository`: Replace provider joins with service calls
- `AiTeamProviderTokenRepository`: Replace provider joins with service calls

### 5. API Layer Updates

#### Remove Provider CRUD Endpoints
- Remove `createAiProvider`
- Remove `updateAiProvider` 
- Remove `deleteAiProvider`
- Keep `findAiProviders` as read-only (JSON-based)

#### Update Existing Endpoints
- Modify endpoints to use `ProviderConfigService`
- Update response types to exclude database metadata

### 6. Frontend Updates

#### Remove Provider Management UI
- Remove provider creation forms
- Remove provider edit functionality
- Keep provider listing as read-only display

#### Update Provider Selection
- Use JSON configuration for dropdowns
- Remove dynamic provider creation options

### 7. Database Migration

#### Migration Script
```sql
-- 1. Verify no orphaned references
SELECT COUNT(*) FROM ai_model WHERE providerId NOT IN (
  SELECT providerId FROM ai_provider
);

-- 2. Drop foreign key constraints
ALTER TABLE ai_model DROP FOREIGN KEY ai_model_provider_id_fk;
ALTER TABLE ai_team_provider_token DROP FOREIGN KEY ai_team_provider_token_provider_id_fk;

-- 3. Drop the ai_provider table
DROP TABLE ai_provider;
```

#### Rollback Plan
```sql
-- Recreate table and restore data from backup if needed
CREATE TABLE ai_provider (
  providerId varchar(21) PRIMARY KEY,
  name varchar(100) NOT NULL,
  baseUrl text
);
```

## Implementation Steps

### Phase 1: Service Layer (1-2 hours)
1. Create `ProviderConfigService`
2. Implement JSON configuration reading
3. Add provider validation methods
4. Write comprehensive tests

### Phase 2: Repository Updates (1-2 hours)  
1. Update `AiModelRepository` to use service
2. Update `AiTeamProviderTokenRepository` to use service
3. Remove `AiProviderRepository` completely
4. Update all imports and dependencies

### Phase 3: API Layer (1 hour)
1. Remove provider CRUD endpoints
2. Update existing endpoints to use service
3. Update response types and validation
4. Test API functionality

### Phase 4: Database Migration (30 minutes)
1. Create migration script
2. Test migration on development database
3. Verify data integrity after migration
4. Document rollback procedures

### Phase 5: Frontend Updates (1-2 hours)
1. Remove provider management components
2. Update provider selection to use JSON config
3. Update UI to reflect read-only nature
4. Test user interface changes

### Phase 6: Testing & Validation (30 minutes)
1. Run full test suite
2. Verify provider functionality works
3. Test model sync with new architecture
4. Validate token management still works

## Testing Strategy

### Unit Tests
- `ProviderConfigService` methods
- Repository layer provider resolution
- API endpoint responses

### Integration Tests
- Model sync process with JSON providers
- Token management with string provider IDs
- End-to-end provider selection flow

### Manual Testing
- Provider listing in UI
- Model assignment to providers
- Token creation for providers

## Risk Assessment

### Low Risk
- ✅ JSON configuration is already established pattern
- ✅ Provider data is relatively static
- ✅ No team-specific provider data to migrate

### Medium Risk
- ⚠️ Multiple components depend on provider relationships
- ⚠️ Foreign key removal requires careful testing
- ⚠️ UI changes affect user workflows

### Mitigation Strategies
- Comprehensive test coverage before changes
- Staged rollout with database backup
- Fallback to original architecture if issues arise

## Success Criteria

### Functional Requirements
- [ ] All provider-related functionality works without database table
- [ ] Model sync process continues working correctly
- [ ] Token management supports provider selection
- [ ] Provider information displays correctly in UI

### Performance Requirements  
- [ ] Provider lookups perform adequately with JSON config
- [ ] No degradation in model/token operations
- [ ] Reduced database query load

### Code Quality
- [ ] Clean removal of all database provider code
- [ ] Consistent use of `ProviderConfigService` across codebase
- [ ] No remaining references to `AiProviderRepository`
- [ ] Updated type definitions and interfaces

## Future Considerations

### Configuration Management
- Consider environment-specific provider configs
- Potential for dynamic provider registration in future
- Integration with external provider registries

### Scalability
- Monitor JSON file size as providers are added
- Consider caching strategies for high-traffic scenarios
- Plan for provider-specific configuration extensions

## Dependencies

### Internal
- No blocking dependencies within Kodix codebase
- Builds on existing `supported-providers.json` structure

### External
- No external API or service dependencies
- Standard Node.js file system operations

## Documentation Updates

### Technical Documentation
- Update AI Studio architecture documentation
- Document provider configuration management
- Update API documentation for removed endpoints

### User Documentation  
- Update provider management user guide
- Document read-only provider listing
- Update troubleshooting guides

---

**Implementation Guidelines**:
- Follow Kodix coding standards and ESLint rules
- Maintain backward compatibility where possible  
- Use TypeScript strict mode throughout
- Include comprehensive error handling
- Add detailed logging for debugging

**Review Requirements**:
- Code review required for all service layer changes
- Database migration review required
- UI/UX review for frontend changes
- Security review for configuration access patterns