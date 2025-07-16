<!-- AI-METADATA:
category: standards
complexity: intermediate
updated: 2025-07-13
claude-ready: true
phase: 4
priority: high
token-optimized: true
audience: developers
ai-context-weight: important
-->

<!-- AI-CONTEXT-BOUNDARY: start -->
# Documentation Script Standards

> Comprehensive standards for managing, maintaining, and developing scripts that support the Kodix documentation system

## 🎯 Purpose

Define clear standards and best practices for documentation automation scripts, ensuring consistency, reliability, and AI-assistant compatibility across all documentation tooling.

## 📁 Script Organization Standards

### Directory Structure

```
/docs/scripts/                  # Documentation-specific automation
├── README.md                   # Central script documentation
├── /validation/                # Quality and compliance scripts
│   ├── validate-docs.sh        # Core documentation validation
│   ├── validate-patterns.sh    # Code pattern compliance
│   └── validate-ai-content.sh  # AI markup validation
├── /maintenance/               # File operations and repairs
│   ├── fix-broken-links.sh     # Link repair automation
│   └── move-file-smart.sh      # Smart file operations
├── /sync/                      # AI optimization scripts
│   └── claude-sync.sh          # Claude Code compatibility
└── /phase4/                    # Legacy phase scripts (archived)

/scripts/                       # Project-wide automation
├── README.md                   # Project script overview
└── /docs/                      # Documentation generation
    ├── generate-ai-docs.ts     # AI documentation generation
    └── validate-docs.ts        # TypeScript validation
```

### Naming Conventions

#### Script Files
- **Format**: `action-target.sh` or `action-target.ts`
- **Examples**: 
  - `validate-docs.sh`
  - `fix-broken-links.sh`
  - `generate-ai-docs.ts`

#### Folder Organization
- **Functional Groups**: Group by primary function (validation, maintenance, sync)
- **Clear Purpose**: Each directory has single responsibility
- **Consistent Depth**: Avoid deep nesting (max 2 levels)

## 🔧 Script Development Standards

### Shell Script Requirements

```bash
#!/bin/bash
# Script Name: validate-docs.sh
# Purpose: Validate documentation quality and compliance
# Author: Kodix Documentation Team
# Updated: YYYY-MM-DD

set -euo pipefail  # Strict error handling

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
readonly LOG_FILE="${PROJECT_ROOT}/logs/validation.log"

# Color output for human readability
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

# Help function (required)
show_help() {
    cat << EOF
Usage: $0 [OPTIONS]

Description:
    Validate documentation quality and compliance

Options:
    --dry-run       Run without making changes
    --verbose       Show detailed output
    --help         Show this help message

Examples:
    $0                    # Standard validation
    $0 --dry-run         # Test mode
    $0 --verbose         # Detailed output

Exit Codes:
    0 - Success
    1 - Validation errors found
    2 - Script error
EOF
}

# Error handling
error_exit() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit "${2:-1}"
}

# Main execution
main() {
    # Parse arguments
    # Validate environment
    # Execute primary logic
    # Report results
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
```

### TypeScript Script Requirements

```typescript
#!/usr/bin/env tsx
/**
 * Script Name: generate-ai-docs.ts
 * Purpose: Generate AI-optimized documentation
 * Author: Kodix Documentation Team
 * Updated: YYYY-MM-DD
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');

// Types
interface ScriptOptions {
  dryRun?: boolean;
  verbose?: boolean;
  target?: string;
}

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

// Error handling
class ScriptError extends Error {
  constructor(message: string, public exitCode: number = 1) {
    super(message);
    this.name = 'ScriptError';
  }
}

// Main execution
async function main(options: ScriptOptions): Promise<void> {
  try {
    // Implementation
    console.log('✅ Script completed successfully');
  } catch (error) {
    if (error instanceof ScriptError) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(error.exitCode);
    }
    throw error;
  }
}

// CLI handling
if (import.meta.url === `file://${process.argv[1]}`) {
  // Parse CLI arguments and call main()
}
```

## 🛡️ Quality Standards

### Code Quality Requirements

#### Error Handling
- **Strict Mode**: Use `set -euo pipefail` in bash scripts
- **Exit Codes**: Standard exit codes (0=success, 1=error, 2=usage)
- **Error Messages**: Clear, actionable error messages
- **Logging**: Comprehensive logging for debugging

#### Documentation
- **Header Comments**: Purpose, author, update date
- **Help Functions**: Required `--help` option
- **Usage Examples**: Clear usage examples in help
- **Exit Code Documentation**: Document all possible exit codes

#### Safety Features
- **Dry Run Mode**: `--dry-run` option for testing
- **Backup Creation**: Automatic backups before modifications
- **Validation**: Input validation and sanity checks
- **Rollback Instructions**: Clear rollback procedures

### Testing Requirements

#### Unit Testing
```bash
# test-script-name.sh
#!/bin/bash
# Unit tests for script-name.sh

source "$(dirname "$0")/script-name.sh"

test_basic_functionality() {
    # Test implementation
    assert_equals "expected" "$(function_to_test)"
}

test_error_handling() {
    # Test error conditions
    assert_fails "function_with_bad_input"
}

# Run tests
run_tests() {
    test_basic_functionality
    test_error_handling
    echo "✅ All tests passed"
}

run_tests
```

#### Integration Testing
- **Real Environment**: Test with actual documentation files
- **Edge Cases**: Test boundary conditions and edge cases
- **Performance**: Monitor execution time and resource usage
- **Compatibility**: Test across different operating systems

## 🤖 AI-Assistant Integration

### Claude Code Compatibility

#### Script Output Format
```bash
# AI-friendly output formatting
echo "<!-- AI-SCRIPT-RESULT: validation -->"
echo "**Status**: ${status}"
echo "**Files Processed**: ${file_count}"
echo "**Issues Found**: ${error_count}"
echo "**Fixes Applied**: ${fix_count}"
echo "<!-- /AI-SCRIPT-RESULT -->"
```

#### Metadata Integration
- **AI-METADATA Headers**: Include in generated documentation
- **Semantic Markers**: Use AI-CONTEXT boundaries appropriately
- **Progress Indicators**: Claude Code-friendly progress reporting
- **Result Summaries**: Structured output for AI consumption

### Cross-AI Compatibility
- **Universal Patterns**: Work with Claude Code, Cursor, GitHub Copilot
- **Structured Output**: Consistent formatting across tools
- **Context Preservation**: Maintain context for AI assistants
- **Error Reporting**: AI-parseable error formats

## 📊 Performance Standards

### Execution Requirements
- **Speed**: Complete validation in < 30 seconds for typical docs
- **Memory**: Use < 100MB memory for standard operations
- **Scalability**: Handle 1000+ documentation files efficiently
- **Resource Cleanup**: Clean up temporary files and processes

### Optimization Guidelines
- **Parallel Processing**: Use parallel execution where possible
- **Caching**: Cache expensive operations (file parsing, validation)
- **Incremental Operations**: Process only changed files when possible
- **Progress Reporting**: Show progress for long-running operations

## 🔒 Security Standards

### Input Validation
```bash
# Validate file paths
validate_file_path() {
    local file_path="$1"
    
    # Check for path traversal
    if [[ "$file_path" =~ \.\./\.\. ]]; then
        error_exit "Invalid file path: $file_path" 2
    fi
    
    # Ensure within project bounds
    local resolved_path
    resolved_path="$(realpath "$file_path" 2>/dev/null)" || error_exit "Invalid path: $file_path" 2
    
    if [[ ! "$resolved_path" =~ ^"$PROJECT_ROOT" ]]; then
        error_exit "Path outside project: $file_path" 2
    fi
}
```

### Safe Operations
- **Path Validation**: Validate all file paths for security
- **Permission Checks**: Verify file permissions before operations
- **Sandbox Execution**: Limit script access to necessary files only
- **Audit Logging**: Log all file modifications for tracking

## 🔄 Maintenance Workflows

### Development Lifecycle

#### Script Creation
1. **Planning**: Define purpose, inputs, outputs, and constraints
2. **Template**: Use standard template for consistency
3. **Implementation**: Follow coding standards and patterns
4. **Testing**: Unit and integration testing
5. **Documentation**: Update README and related docs
6. **Review**: Peer review and approval

#### Script Updates
1. **Version Control**: Use semantic versioning for major changes
2. **Backward Compatibility**: Maintain compatibility when possible
3. **Deprecation**: Proper deprecation warnings for removed features
4. **Migration**: Clear migration paths for breaking changes

### Regular Maintenance

#### Weekly Tasks
- [ ] Run all validation scripts
- [ ] Check for script failures in logs
- [ ] Update scripts for any new requirements
- [ ] Review and address any performance issues

#### Monthly Tasks
- [ ] Review script usage metrics
- [ ] Update dependencies and tools
- [ ] Optimize slow-running scripts
- [ ] Update documentation and examples

#### Quarterly Tasks
- [ ] Comprehensive script review
- [ ] Security audit of script permissions
- [ ] Performance benchmarking
- [ ] Technology stack updates

## 📋 Script Categories

### Validation Scripts (`/validation/`)
**Purpose**: Quality assurance and compliance checking

#### Standards
- **Comprehensive Coverage**: Check all quality dimensions
- **Clear Reporting**: Detailed error reports with suggestions
- **Fast Execution**: Complete quickly for daily use
- **Configurable**: Allow different validation levels

#### Examples
- `validate-docs.sh` - Core documentation validation
- `validate-patterns.sh` - Code pattern compliance
- `validate-ai-content.sh` - AI markup validation

### Maintenance Scripts (`/maintenance/`)
**Purpose**: File operations and automated repairs

#### Standards
- **Safe Operations**: Always create backups
- **Dry Run Mode**: Test mode for all operations
- **Smart Detection**: Automatic problem detection
- **Progress Reporting**: Clear operation progress

#### Examples
- `fix-broken-links.sh` - Automated link repair
- `move-file-smart.sh` - Intelligent file operations
- `cleanup-legacy.sh` - Automated cleanup operations

### Sync Scripts (`/sync/`)
**Purpose**: AI assistant optimization and synchronization

#### Standards
- **AI-Specific**: Optimized for specific AI tools
- **Metadata Management**: Automatic metadata updates
- **Compatibility**: Cross-AI assistant compatibility
- **Performance**: Optimized for AI consumption

#### Examples
- `claude-sync.sh` - Claude Code optimization
- `cursor-sync.sh` - Cursor IDE integration
- `github-copilot-sync.sh` - GitHub Copilot optimization

## 🚨 Emergency Procedures

### Script Failure Recovery
1. **Immediate Assessment**: Identify scope of failure
2. **Rollback**: Use backup files to restore state
3. **Root Cause Analysis**: Determine failure cause
4. **Fix Implementation**: Apply targeted fix
5. **Validation**: Verify fix resolves issue
6. **Prevention**: Update scripts to prevent recurrence

### Critical Script Updates
1. **Urgent Fix**: Apply minimal necessary changes
2. **Fast Track Testing**: Essential testing only
3. **Deployment**: Deploy with monitoring
4. **Post-Deploy Validation**: Comprehensive testing
5. **Documentation**: Update documentation and runbooks

## 🔗 Integration Points

### CI/CD Integration
```yaml
# .github/workflows/docs-validation.yml
name: Documentation Validation
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate Documentation
        run: |
          cd docs
          ./scripts/validation/validate-docs.sh
          ./scripts/validation/validate-patterns.sh
```

### Pre-commit Hooks
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

### IDE Integration
- **Claude Code**: Automatic script discovery and execution
- **Cursor**: Integrated script running and results
- **VS Code**: Task definitions for common scripts

## 📈 Metrics and Monitoring

### Script Performance Metrics
- **Execution Time**: Track script execution duration
- **Success Rate**: Monitor script success/failure rates
- **Resource Usage**: Memory and CPU utilization
- **File Processing**: Documents processed per second

### Quality Metrics
- **Coverage**: Percentage of documentation validated
- **Issue Detection**: Number of issues found and fixed
- **False Positives**: Incorrect issue detection rate
- **User Satisfaction**: Developer feedback on script utility

## 🔮 Future Enhancements

### Planned Features
- **Smart Scheduling**: Automatic script execution based on changes
- **AI-Powered Optimization**: Machine learning for script improvement
- **Real-time Validation**: Live validation during editing
- **Cross-Platform Support**: Enhanced Windows and macOS support

### Integration Roadmap
- **Documentation CMS**: Integration with content management systems
- **Analytics Dashboard**: Real-time script performance monitoring
- **Automated Testing**: Continuous integration testing improvements
- **Multi-language Support**: Support for additional programming languages

## 🔗 Related Standards

- [Writing Rules](./writing-rules.md) - Content style and format guidelines
- [AI Assistant Compatibility](./ai-assistant-compatibility.md) - AI optimization standards
- [How to Update Documentation](./how-to-update-docs.md) - Maintenance workflows
- [Folder Structure](./folder-structure.md) - Directory organization guidelines

---

**Last Updated**: 2025-07-13  
**Version**: 1.0 (Created for Documentation Script Validation)  
**Maintenance**: Review quarterly for script evolution

<!-- AI-CONTEXT-BOUNDARY: end -->