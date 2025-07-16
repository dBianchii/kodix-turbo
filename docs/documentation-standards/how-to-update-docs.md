<!-- AI-METADATA:
category: standards
complexity: intermediate
updated: 2025-01-12
claude-ready: true
phase: 4
priority: high
token-optimized: true
audience: developers
ai-context-weight: important
-->

<!-- AI-CONTEXT-BOUNDARY: start -->
# How to Update Kodix Documentation

> Comprehensive guide for maintaining, updating, and evolving documentation in the Kodix platform

## 🎯 Purpose

Provide clear workflows and processes for keeping Kodix documentation current, accurate, and optimized for both human developers and AI assistants.

## 🔄 Documentation Lifecycle

### Documentation States
- **Draft**: Work in progress, not yet ready for use
- **Active**: Current and accurate documentation
- **Deprecated**: Marked for replacement but still in use
- **Archived**: Historical documentation moved to legacy

### Update Triggers
- **Code Changes**: When implementation changes affect documentation
- **Technology Updates**: When dependencies or stack changes
- **Process Changes**: When development workflows evolve
- **Quality Issues**: When errors or gaps are identified
- **Scheduled Reviews**: Regular maintenance cycles

## 📋 Update Workflows

### 1. Content Update Workflow

#### Before Making Changes
```bash
# 1. Ensure you have latest documentation
git pull origin main

# 2. Validate current documentation
./docs/scripts/validation/validate-docs.sh

# 3. Check for broken links
./docs/scripts/maintenance/fix-broken-links.sh --dry-run
```

#### Making Updates
1. **Identify Scope**: Determine what documentation is affected
2. **Update Content**: Make necessary changes following standards
3. **Update Cross-References**: Ensure links remain valid
4. **Add AI Metadata**: Include or update AI markup as needed
5. **Validate Changes**: Run validation scripts

#### Standard Update Template
```markdown
<!-- Update existing AI-METADATA -->
<!-- AI-METADATA:
updated: 2025-01-12  # ← Update this date
last-ai-review: 2025-01-12  # ← Update if AI markup changed
-->

<!-- Document your changes -->
## Change Log
- [Date]: [Description of changes made]
- [Date]: [Previous changes]
```

### 2. Structural Changes Workflow

#### Adding New Documentation
```bash
# 1. Follow folder structure standards
mkdir -p docs/[category]/[subcategory]

# 2. Create README.md first
touch docs/[category]/README.md

# 3. Use templates from documentation-standards
cp docs/documentation-standards/templates/[template].md docs/[category]/[new-doc].md

# 4. Update parent navigation
# Edit parent README.md to include new documentation
```

#### Moving Documentation
```bash
# Use the smart move script to preserve links
./docs/scripts/maintenance/move-file-smart.sh \
  --source docs/old/location/file.md \
  --destination docs/new/location/file.md \
  --update-references
```

#### Removing Documentation
1. **Check Dependencies**: Ensure no other docs link to it
2. **Create Redirect**: Add entry to legacy section if needed
3. **Update Navigation**: Remove from parent README files
4. **Archive**: Move to legacy folder instead of deleting

### 3. Quality Maintenance Workflow

#### Regular Quality Checks
```bash
# Weekly: Run comprehensive validation
./docs/scripts/validation/validate-docs.sh --verbose

# Monthly: Check for outdated content
grep -r "updated: 2024" docs/ | grep -v legacy/

# Quarterly: Review and update AI metadata
./docs/scripts/validation/validate-ai-content.sh
```

#### Fixing Quality Issues
1. **Broken Links**: Use automated fix script
2. **Outdated Content**: Update based on current implementation
3. **Missing AI Markup**: Add required metadata and boundaries
4. **Inconsistent Formatting**: Apply standard formatting rules

## 🤖 AI Markup Maintenance

### Updating AI Metadata
```markdown
<!-- Always update these fields when content changes -->
<!-- AI-METADATA:
category: [verify category is still accurate]
complexity: [update if content complexity changed]
updated: [current date in YYYY-MM-DD format]
claude-ready: true
phase: 4
priority: [reassess priority level]
token-optimized: true
audience: [verify target audience]
ai-context-weight: [reassess importance]
last-ai-review: [date when AI markup was last reviewed]
-->
```

### AI Content Optimization
#### Token Budget Management
```markdown
<!-- Review and update token estimates -->
<!-- AI-TOKEN-BUDGET -->
**Estimated Tokens**: 
- Header: ~50 tokens
- Content: ~400 tokens  # ← Update based on actual content
- Examples: ~250 tokens # ← Update based on code examples
- Total: ~700 tokens    # ← Update total
<!-- /AI-TOKEN-BUDGET -->
```

#### Context Boundary Validation
- Ensure `<!-- AI-CONTEXT-BOUNDARY: start -->` and `<!-- AI-CONTEXT-BOUNDARY: end -->` properly wrap main content
- Exclude navigation, metadata, and decorative elements from boundaries
- Validate that boundaries contain complete, coherent information

### Cross-Reference Updates
```markdown
<!-- Update relationship metadata when structure changes -->
<!-- AI-RELATIONSHIPS -->
**Prerequisites**: [Update if dependencies changed]
**Dependencies**: [Update file references]
**Related**: [Add new related documents]
**Next Steps**: [Update progression paths]
<!-- /AI-RELATIONSHIPS -->
```

## 🛠️ Automation & Tools

### Available Scripts
```bash
# Validation Scripts
./docs/scripts/validation/validate-docs.sh          # Comprehensive validation
./docs/scripts/validation/validate-patterns.sh     # Pattern compliance check
./docs/scripts/validation/validate-ai-content.sh   # AI markup validation

# Maintenance Scripts  
./docs/scripts/maintenance/fix-broken-links.sh     # Fix broken internal links
./docs/scripts/maintenance/move-file-smart.sh      # Smart file moving with reference updates

# Synchronization Scripts
./docs/scripts/sync/claude-sync.sh                 # Claude Code optimization
```

### Automated Validation
#### Pre-Commit Validation
```bash
# Add to git pre-commit hook
#!/bin/bash
echo "Validating documentation..."
./docs/scripts/validation/validate-docs.sh
if [ $? -ne 0 ]; then
    echo "Documentation validation failed. Please fix issues before committing."
    exit 1
fi
```

#### CI/CD Integration
```yaml
# Add to GitHub Actions workflow
- name: Validate Documentation
  run: |
    ./docs/scripts/validation/validate-docs.sh
    ./docs/scripts/validation/validate-patterns.sh
```

### Content Generation
#### Automated Updates
```bash
# Generate API documentation from code
./scripts/docs/generate-ai-docs.ts

# Update cross-references
./docs/scripts/maintenance/update-cross-references.sh

# Optimize for AI assistants
./docs/scripts/optimization/optimize-ai-context.sh
```

## 📊 Quality Standards

### Content Quality Checklist
- [ ] **Accuracy**: Information matches current implementation
- [ ] **Completeness**: All necessary information included
- [ ] **Clarity**: Content is clear and well-organized
- [ ] **Examples**: Code examples work and follow Kodix patterns
- [ ] **Links**: All cross-references are valid and helpful
- [ ] **Standards**: Follows documentation writing rules
- [ ] **AI Markup**: Proper metadata and optimization applied

### Technical Validation
```bash
# Comprehensive quality check
./docs/scripts/validation/validate-docs.sh --comprehensive

# Check specific quality aspects
./docs/scripts/validation/check-code-examples.sh
./docs/scripts/validation/validate-cross-references.sh
./docs/scripts/validation/check-ai-markup.sh
```

## 🔄 Review Processes

### Peer Review Workflow
1. **Self-Review**: Author validates changes against standards
2. **Technical Review**: Subject matter expert reviews accuracy
3. **Standards Review**: Documentation team validates compliance
4. **AI Compatibility**: Test with AI assistants if significant changes

### Review Templates
#### Standard Review Checklist
```markdown
## Documentation Review

**Reviewer**: [Name]
**Date**: [YYYY-MM-DD]
**Files Reviewed**: [List of files]

### Content Quality
- [ ] Accurate information
- [ ] Complete coverage
- [ ] Clear writing
- [ ] Working examples

### Standards Compliance
- [ ] Folder structure
- [ ] Naming conventions
- [ ] AI markup
- [ ] Cross-references

### Technical Accuracy
- [ ] Code examples tested
- [ ] API references correct
- [ ] Patterns followed
- [ ] Security considered

**Overall Assessment**: [Pass/Needs Work/Reject]
**Comments**: [Detailed feedback]
```

## 📅 Maintenance Schedules

### Regular Maintenance Tasks

#### Weekly
- [ ] Run automated validation scripts
- [ ] Check for and fix broken links
- [ ] Review new issues and requests

#### Monthly  
- [ ] Update outdated content (check `updated` dates)
- [ ] Review and update AI metadata
- [ ] Validate code examples against current implementation

#### Quarterly
- [ ] Comprehensive documentation review
- [ ] Architecture documentation alignment check
- [ ] AI assistant compatibility testing
- [ ] Performance optimization review

#### Semi-Annually
- [ ] Technology stack documentation updates
- [ ] Security review of documentation practices
- [ ] Cross-reference integrity audit

#### Annually
- [ ] Complete documentation architecture review
- [ ] Standards evolution and updates
- [ ] Legacy content cleanup
- [ ] Tool and process improvements

### Maintenance Ownership
- **Content Owners**: Responsible for accuracy of their domain areas
- **Documentation Team**: Responsible for standards compliance and quality
- **AI Specialists**: Responsible for AI markup optimization
- **DevOps Team**: Responsible for automation and tooling

## 🚨 Emergency Updates

### Critical Update Process
For urgent fixes (security issues, breaking changes, critical bugs):

1. **Immediate Action**: Make minimal necessary changes
2. **Fast Track Review**: Single reviewer approval sufficient
3. **Post-Update Cleanup**: Full review and optimization within 48 hours
4. **Root Cause Analysis**: Identify why urgent update was needed

### Communication
- **Internal**: Update team channels with changes
- **Documentation**: Add change notes to affected documents
- **AI Systems**: Trigger AI assistant cache refresh if needed

## 🔗 Related Resources

### Standards Documentation
- [Writing Rules](./writing-rules.md) - Content style and format guidelines
- [AI Assistant Compatibility](./ai-assistant-compatibility.md) - AI optimization standards
- [Folder Structure](./folder-structure.md) - Directory organization guidelines

### Tools & Scripts
- [Documentation Scripts](../scripts/) - Automation and validation tools
- [Context Engineering](../context-engineering/) - AI-specific optimization guides

### Templates & Examples
- [Architecture Templates](./core-architecture-docs.md) - Architecture documentation patterns
- [AI Markup Examples](../context-engineering/standards/ai-first-markup.md) - Semantic markup patterns

---

**Last Updated**: 2025-01-12  
**Version**: 1.0 (Consolidated from Phase 3 Quality Processes)  
**Maintenance**: Updated with each standards evolution

<!-- AI-CONTEXT-BOUNDARY: end -->