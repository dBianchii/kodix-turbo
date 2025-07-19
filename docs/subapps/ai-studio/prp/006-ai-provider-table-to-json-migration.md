# PRP: AI Provider Table to JSON Migration

<!-- AI-METADATA:
category: prp
feature: ai-provider-json-migration
complexity: intermediate
estimated-effort: 8 hours
created: 2025-07-19
validation-status: aligned
language: en
-->

## 🔍 **Pre-Implementation Validation**

### Code Alignment Check ✅

- [x] Similar implementations reviewed (JSON config pattern exists in supported-providers.json)
- [x] No conflicting patterns identified (current repository pattern can be adapted)
- [x] Architecture boundaries respected (service layer patterns maintained)
- [x] Folder paths validated (all referenced paths exist)

### ESLint Compliance ✅

- [x] useTRPC() pattern planned (no frontend changes required)
- [x] Explicit typing strategy defined (strong TypeScript interfaces)
- [x] Promise.allSettled usage planned (where applicable)
- [x] Validated env usage planned (no direct process.env usage)
- [x] No forbidden patterns in plan

### Mandatory Formatting ✅

- [x] Document written in English only
- [x] Sequential naming convention followed (006-*)
- [x] Proper numerical sequence identified (next after 005-*)

## 🎯 Goal

Replace the `ai_provider` database table with JSON configuration while maintaining complete backward compatibility and zero impact on existing functionality.

## 📋 Context

The current AI Provider system stores provider metadata (OpenAI, Anthropic, Google, XAI) in a database table, but the system also maintains a JSON configuration file with the same information. This creates redundancy and maintenance overhead.

The migration aims to:
- Eliminate database dependency for static provider data
- Use `supported-providers.json` as single source of truth
- Maintain exact same API interface for all existing code
- Reduce system complexity while improving maintainability

Business value includes simplified configuration management, faster provider lookups through in-memory caching, and elimination of database migration dependencies for provider changes.

## 👥 Users

**Primary Users:**
- Development team maintaining AI provider configurations
- AI Studio SubApp functionality requiring provider metadata
- Chat SubApp utilizing provider information for API communication

**Secondary Users:**
- System administrators managing provider configurations
- Support team troubleshooting provider-related issues

**Use Cases:**
- Model synchronization requiring provider validation
- Chat sessions accessing provider API endpoints
- Team token management per provider
- Cross-SubApp provider data access

## ✅ Acceptance Criteria

- [x] All existing `AiProviderRepository` methods continue working without code changes
- [x] Provider data sourced from `supported-providers.json` instead of database
- [x] Performance meets current baseline (sub-10ms provider lookups)
- [x] All foreign key relationships (`ai_model.providerId`, `ai_team_provider_token.providerId`) remain valid
- [x] Error handling for JSON parsing failures implemented
- [x] JSON schema validation on application startup
- [x] Complete test coverage for new JSON-based functionality
- [x] No regression in existing SubApp functionality
- [x] **ESLint compliance** (all rules followed)
- [x] **Architecture boundaries** respected (service layer patterns maintained)

## 🏗️ Technical Specification

### Architecture

**SubApp Involvement:**
- **AI Studio SubApp**: Primary owner of provider management functionality
- **Chat SubApp**: Consumer of provider data for API communication
- **Service Layer**: Cross-app communication maintained through existing patterns

**Multi-tenancy Compliance:**
- TeamId isolation preserved for token management
- Provider data is global (not team-specific) as currently implemented
- **Data contracts & boundaries** compliance maintained

### Components

**Backend Components:**

- `JsonProviderService`: Core service for loading and caching JSON provider data
  - Loads `supported-providers.json` on startup
  - Provides in-memory cached access to provider data
  - **Service layer** communication patterns followed

- `AiProviderRepository` (Modified): Adapter pattern implementation
  - Maintains exact same public interface
  - Internal implementation switches from database to JSON service
  - **Type-safe** operations preserved

**No Frontend Changes Required:**
- Existing UI components continue using same tRPC endpoints
- **ESLint compliant** (useTRPC pattern already in use)
- No changes to React components or hooks

**Database Components:**
- No schema changes required during implementation
- Foreign key relationships preserved
- Future table removal in separate migration phase

### Data Flow

1. Application startup loads `supported-providers.json` via `JsonProviderService`
2. Provider data cached in memory for fast access
3. `AiProviderRepository` methods route to `JsonProviderService` instead of database
4. Existing tRPC endpoints continue working without modification (**useTRPC pattern** maintained)
5. Cross-SubApp communication preserved through service layer
6. Response format remains identical to current implementation

### Kodix Stack Integration

**Next.js 15 (App Router):**
- No frontend changes required
- Existing pages and components unaffected
- Server/Client separation maintained

**tRPC v11:**
- Existing endpoints: `aiStudio.providers.*` continue unchanged
- Input validation with Zod preserved
- **useTRPC() pattern** already implemented and maintained

**Service Layer:**
- `AiStudioService` provider token methods unchanged
- Cross-SubApp communication patterns preserved
- Multi-tenancy isolation maintained

**JSON Configuration:**
- Source: `packages/api/src/internal/services/ai-model-sync-adapter/config/supported-providers.json`
- Schema validation with Zod
- In-memory caching for performance

## 🧪 Testing Requirements

### Unit Tests

- `JsonProviderService` loading and caching functionality
- `AiProviderRepository` method compatibility with JSON backend
- JSON schema validation and error handling
- Provider lookup performance benchmarks

### Integration Tests

- Model-provider relationship queries
- Team token operations with JSON-sourced providers
- Cross-SubApp service layer communication
- Foreign key integrity validation

### Migration Validation Tests

- Data consistency between database and JSON
- Provider ID matching validation
- Referential integrity checks for existing relationships

**Testing Reference**: Follow patterns from existing AI Studio test suite

## 🚀 Implementation Plan

### Phase 1: JSON Service Foundation (3 hours)

1. **Create JsonProviderService** 
   - Implement JSON loading with Zod validation
   - Add in-memory caching mechanism
   - Error handling for malformed JSON
   - Performance optimization for repeated access

2. **Provider Interface Standardization**
   - Ensure JSON structure matches database schema exactly
   - TypeScript interface alignment
   - **Type-safe** validation implementation

### Phase 2: Repository Adapter Implementation (3 hours)

1. **Modify AiProviderRepository**
   - Replace database queries with JsonProviderService calls
   - Maintain identical method signatures and return types
   - Preserve error handling patterns
   - **ESLint compliance check**

2. **Service Layer Integration**
   - Update `AiStudioService` if needed
   - Ensure cross-SubApp communication patterns preserved
   - Multi-tenancy considerations validated

### Phase 3: Validation & Testing (2 hours)

1. **Data Migration Validation**
   - Verify all database provider IDs exist in JSON
   - Validate foreign key relationships
   - Run comprehensive test suite
   - Performance benchmark comparison

2. **Integration Testing**
   - Test Chat SubApp provider access
   - Validate model synchronization functionality
   - Cross-SubApp service communication verification

## ⚠️ Risks & Mitigations

- **Risk**: Existing provider IDs in database don't match JSON → **Mitigation**: Pre-implementation data consistency validation
- **Risk**: Performance degradation from JSON access → **Mitigation**: In-memory caching and benchmark validation
- **Risk**: Foreign key violations after migration → **Mitigation**: Comprehensive referential integrity checks
- **Multi-tenancy**: Provider data remains global as designed
- **Performance**: JSON caching strategy ensures sub-10ms access times
- **ESLint violations**: Strict adherence to coding rules throughout implementation
- **Architecture boundaries**: Service layer enforcement maintained

## 📚 References

- Architecture: `docs/architecture/subapps/subapp-architecture.md`
- ESLint Rules: `docs/development/linting/kodix-eslint-coding-rules.md`
- Data Boundaries: `docs/architecture/backend/data-contracts-and-boundaries.md`
- Service Layer: `docs/architecture/backend/service-layer-patterns.md`
- Testing: `docs/development/testing/subapp-testing-guide.md`
- Similar patterns: AI model sync adapter configuration system
- Current implementation: `packages/db/src/repositories/ai-studio.ts`
- Target JSON: `packages/api/src/internal/services/ai-model-sync-adapter/config/supported-providers.json`