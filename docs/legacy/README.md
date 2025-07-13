<!-- AI-METADATA:
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="medium" -->category: overview
complexity: basic
updated: 2025-07-12
claude-ready: true
phase: 4
priority: medium
token-optimized: true
audience: all
ai-context-weight: important
last-ai-review: 2025-07-12
-->

# 🗂️ Legacy Documentation Archive

This section contains deprecated documentation and files that have been moved as part of the documentation modernization.

## 📋 Legacy Cleanup

For detailed cleanup instructions, see: **[CLEANUP-INSTRUCTIONS.md](./CLEANUP-INSTRUCTIONS.md)**

---

## 🔄 Migration Summary

As part of Phase 1 modernization (completed 2025-07-12), the following structural changes were made:

### Moved Directories

| Old Location | New Location | Reason |
|--------------|--------------|--------|
| `/docs/apps/` | `/docs/applications/` | Clear distinction between apps and subapps |
| `/docs/tests/` | `/docs/development/testing/` | Consolidated development resources |
| `/docs/debug/` | `/docs/development/debugging/` | Consolidated development resources |
| `/docs/eslint/` | `/docs/development/linting/` | Consolidated development resources |
| `/docs/ui-catalog/` | `/docs/ui-design/` | More descriptive naming |

### Renamed Files

| Old Name | New Name | Reason |
|----------|----------|--------|
| `Architecture_Standards.md` | `architecture-standards.md` | Consistent kebab-case naming |

### New Structure Created

- `/docs/core/` - Central platform documentation
- `/docs/infrastructure/` - Infrastructure and operations
- `/docs/development/` - Development tools and workflows
- `/docs/applications/` - Standalone applications
- Enhanced `/docs/subapps/` with AI Studio and Chat

## 📋 Backward Compatibility

If you have bookmarks or references to old locations:

### Old App References
- **Old**: `/docs/apps/care-mobile/` → **New**: `/docs/applications/mobile-apps/care-mobile/`
- **Old**: `/docs/apps/planning/` → **New**: `/docs/applications/web-apps/kodix-web/`

### Old Development References
- **Old**: `/docs/tests/` → **New**: `/docs/development/testing/`
- **Old**: `/docs/debug/` → **New**: `/docs/development/debugging/`
- **Old**: `/docs/eslint/` → **New**: `/docs/development/linting/`

### Old UI References
- **Old**: `/docs/ui-catalog/` → **New**: `/docs/ui-design/`

## 🎯 Next Steps

This migration enables:
- **Phase 2**: Architecture documentation enhancement
- **Phase 3**: Content quality improvements
- **Phase 4**: Advanced AI-first features

For current documentation, always use the new structure starting from the [Documentation Hub](../README.md).

---

**Migration Completed**: 2025-07-12  
**Structure Version**: 2.0  
**Next Phase**: Phase 2 - Architecture & Core Docs
