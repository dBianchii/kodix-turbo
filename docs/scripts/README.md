# Documentation Scripts & Automation
<!-- AI-CONTEXT-PRIORITY: always-include="false" summary-threshold="medium" -->
<!-- AI-METADATA:
category: automation
complexity: intermediate
updated: 2024-12-21
claude-ready: true
-->

**Location**: `/docs/scripts/`  
**Purpose**: Comprehensive automation suite for documentation maintenance, quality assurance, and AI integration.

## 🎯 Philosophy

This script collection follows **AI-first documentation** principles, providing tools that maintain both human readability and AI assistant compatibility (especially Claude Code). All scripts are designed to support the modern documentation workflow established in our documentation modernization phases.

## 📁 Directory Structure

```
/docs/scripts/
├── validation/                 # Quality & compliance checks
│   ├── validate-docs.sh             # Core documentation validation
│   └── validate-patterns.sh         # Coding pattern compliance
├── maintenance/                # File operations & repairs
│   ├── fix-broken-links.sh          # Unified link fixing
│   └── move-file-smart.sh           # Smart file moves with auto-updates
├── sync/                       # AI integration & optimization
│   └── claude-sync.sh               # Claude Code compatibility optimization
└── README.md                   # This file
```

## 🚀 Quick Start Guide

### **Daily Development Workflow**
<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# From /docs directory

# Before committing documentation changes
./scripts/validation/validate-docs.sh

# Fix any broken links found
./scripts/maintenance/fix-broken-links.sh

# Optimize for AI assistants (weekly)
./scripts/sync/claude-sync.sh
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **File Operations**
<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Smart file move with automatic reference updates
./scripts/maintenance/move-file-smart.sh old/path.md new/path.md

# Validate architectural patterns
./scripts/validation/validate-patterns.sh
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 📚 Script Documentation

### **🔍 Validation Scripts** (`/validation/`)

#### `validate-docs.sh`
**Purpose**: Comprehensive documentation quality validation  
**Features**:
- ✅ Critical README file presence
- ✅ Broken internal link detection  
- ✅ Claude Code compatibility metrics
- ✅ Version consistency checking
- ✅ AI metadata coverage analysis

**Usage**:
<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
./scripts/validation/validate-docs.sh
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

**Exit Codes**:
- `0` - All validations passed
- `1` - Issues found requiring attention

#### `validate-patterns.sh` 
**Purpose**: Validates coding patterns and architectural compliance  
**Features**:
- ✅ tRPC v11 pattern compliance
- ✅ SubApp isolation verification
- ✅ Type safety pattern checking
- ✅ Forbidden pattern detection

**Usage**:
<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
./scripts/validation/validate-patterns.sh
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **🔧 Maintenance Scripts** (`/maintenance/`)

#### `fix-broken-links.sh`
**Purpose**: Unified solution for detecting and fixing broken links  
**Features**:
- 🔧 Comprehensive pattern fixing
- 🔧 Dry-run mode for safe testing
- 🔧 Automatic backup creation
- 🔧 Progress reporting

**Usage**:
<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Fix all broken links
./scripts/maintenance/fix-broken-links.sh

# Test without making changes
./scripts/maintenance/fix-broken-links.sh --dry-run
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

#### `move-file-smart.sh`
**Purpose**: Smart file operations with automatic reference updates  
**Features**:
- 📁 Automatic reference detection and updating
- 📁 Comprehensive backup system
- 📁 Redirect file creation
- 📁 Detailed operation reporting

**Usage**:
<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
./scripts/maintenance/move-file-smart.sh source.md destination.md
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **🤖 Sync Scripts** (`/sync/`)

#### `claude-sync.sh`
**Purpose**: Optimize documentation for Claude Code AI assistant  
**Features**:
- 🤖 AI-METADATA enhancement
- 🤖 Semantic marker optimization  
- 🤖 CLAUDE.md management
- 🤖 Compatibility scoring

**Usage**:
<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
./scripts/sync/claude-sync.sh
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🔄 Integration Workflows

### **Pre-Commit Workflow**
<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Recommended pre-commit sequence
./scripts/validation/validate-docs.sh
./scripts/validation/validate-patterns.sh

# Fix any issues found
./scripts/maintenance/fix-broken-links.sh
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **Weekly Maintenance**
<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# Comprehensive weekly maintenance
./scripts/maintenance/fix-broken-links.sh
./scripts/sync/claude-sync.sh
./scripts/validation/validate-docs.sh
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

### **After Major Restructuring**
<!-- AI-CODE-BLOCK: shell-command -->
<!-- AI-CODE-OPTIMIZATION: language="bash" context="kodix-development" -->
```bash
# AI-CONTEXT: Shell command for Kodix development
# After moving files or reorganizing
./scripts/maintenance/fix-broken-links.sh
./scripts/validation/validate-docs.sh
./scripts/validation/validate-patterns.sh
```
<!-- /AI-CODE-OPTIMIZATION -->
<!-- /AI-CODE-BLOCK -->

## 🎯 Design Principles

### **1. AI-First Compatibility**
- All scripts support Claude Code integration
- Outputs include AI-friendly formatting
- Metadata enhancement for better context

### **2. Human-Readable Operations**
- Clear progress indicators and summaries
- Comprehensive error messages with solutions
- Detailed operation reports

### **3. Safe Operations**
- Automatic backup creation
- Dry-run modes for testing
- Rollback instructions included

### **4. Comprehensive Coverage**
- Validates multiple quality dimensions
- Fixes common issues automatically
- Enhances documentation for AI consumption

## 📊 Quality Metrics

### **Validation Coverage**
- ✅ **Structural Quality**: README completeness, navigation
- ✅ **Link Integrity**: Zero broken internal references
- ✅ **Pattern Compliance**: Architectural standards adherence
- ✅ **AI Compatibility**: Claude Code optimization metrics

### **Maintenance Capabilities**
- 🔧 **Automated Fixing**: Common link patterns and references
- 🔧 **Smart Operations**: File moves with reference updates
- 🔧 **Backup Management**: Safe operations with rollback

### **AI Integration**
- 🤖 **Metadata Enhancement**: AI-METADATA for all files
- 🤖 **Semantic Optimization**: Enhanced marker usage
- 🤖 **Context Management**: CLAUDE.md optimization

## 🚫 Deprecated Scripts (Removed)

The following scripts were **temporary Phase 3 tools** and have been **removed**:

- ❌ `validate-phase3-criteria.sh` - Phase-specific validation (no longer needed)
- ❌ `final-validation.sh` - Phase completion only (archived)
- ❌ `fix-specific-broken-links.sh` - Merged into unified fixer
- ❌ `count-broken-links.sh` - Functionality integrated into main validation

**Rationale**: These scripts served specific Phase 3 cleanup purposes and are no longer relevant for ongoing documentation maintenance.

## 🔧 CI/CD Integration

### **GitHub Actions Example**
<!-- AI-CODE-OPTIMIZATION: language="yaml" context="configuration" -->
```yaml
# .github/workflows/docs-quality.yml
name: Documentation Quality
on: [push, pull_request]

jobs:
  validate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate Documentation
        run: |
          cd docs
          ./scripts/validation/validate-docs.sh
          ./scripts/validation/validate-patterns.sh
```
<!-- /AI-CODE-OPTIMIZATION -->

### **Pre-commit Hook**
<!-- AI-CODE-OPTIMIZATION: language="yaml" context="configuration" -->
```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: validate-docs
        name: Documentation Validation
        entry: docs/scripts/validation/validate-docs.sh
        language: script
        pass_filenames: false
```
<!-- /AI-CODE-OPTIMIZATION -->

## 💡 Best Practices

### **Script Usage**
1. **Always run from `/docs` directory** - Scripts are designed for this context
2. **Use dry-run modes** when available for testing changes
3. **Review operation reports** before committing changes
4. **Run validation after maintenance** operations

### **Development Guidelines**
1. **Test thoroughly** before adding new scripts
2. **Follow naming convention**: `action-target.sh`
3. **Include comprehensive help** and error messages
4. **Maintain backward compatibility** when possible

### **Maintenance Schedule**
- **Daily**: Run validation before commits
- **Weekly**: Full maintenance cycle with link fixing
- **Monthly**: AI optimization and compatibility review
- **After restructuring**: Complete validation and fixing cycle

## 🔮 Future Enhancements

### **Planned Features**
- 📈 **Analytics Dashboard**: Documentation health metrics over time
- 🔄 **Automated Scheduling**: Weekly maintenance automation
- 🌐 **Multi-format Support**: Validation for additional documentation formats
- 🎯 **Smart Suggestions**: AI-powered improvement recommendations

### **Integration Roadmap**
- **Phase 4**: Enhanced AI integration and automation
- **Phase 5**: Real-time validation and live editing support
- **Future**: Integration with documentation generators and CMS systems

---

**📝 Last Updated**: Post-Phase 3 Restructuring  
**🎯 Current Focus**: AI-first documentation automation  
**🤖 Claude Code Ready**: ✅ Fully optimized for AI assistant integration  
**📊 Script Maturity**: Production-ready automation suite
