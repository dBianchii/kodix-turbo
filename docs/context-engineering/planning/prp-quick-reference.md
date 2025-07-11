# PRP Workflow Quick Reference

<!-- AI-METADATA:
category: reference
stack: general
complexity: basic
dependencies: [prp-workflow-implementation.md]
-->

## 🎯 Quick Summary

Cheat sheet for using `/generate-prp` and `/execute-prp` commands in Kodix development with Cursor.

## 🔧 Cursor Implementation

The PRP workflow commands are implemented as structured prompts in Cursor through the `.cursor/rules/kodix-prp-workflow.md` file. When you type the commands, Cursor will follow the predefined workflows.

## 📝 /generate-prp Command

### Basic Usage

```markdown
/generate-prp

Feature: [What to build]
Context: [Why it's needed]
Users: [Who will use it]
Stack: [Technologies involved]
```

### Example

```markdown
/generate-prp

Feature: Add search functionality to the user dashboard
Context: Users can't find specific items quickly in long lists
Users: All dashboard users
Stack: Next.js, tRPC, Elasticsearch
```

### What Cursor Will Do

1. **Analyze your input** and extract requirements
2. **Search the codebase** for similar patterns
3. **Reference documentation** from `/docs/`
4. **Generate a complete PRP** using the standard template
5. **Save the PRP** in the appropriate directory

### Output

- Creates a PRP document in the appropriate `prp/` folder
- Includes: Goal, Context, Users, Acceptance Criteria, Technical Spec, Testing, Implementation Plan

## 🔧 /execute-prp Command

### Basic Usage

```markdown
/execute-prp [path-to-prp]
```

### With Options

```markdown
/execute-prp docs/subapps/dashboard/prp/search-feature.md --phase 1
/execute-prp docs/subapps/dashboard/prp/search-feature.md --dry-run
/execute-prp docs/subapps/dashboard/prp/search-feature.md --strict
```

### What Cursor Will Do

1. **Read and parse** the PRP document
2. **Break down tasks** into atomic units
3. **Implement phase by phase**:
   - Phase 1: Setup (structure, routing, components)
   - Phase 2: Core Implementation (logic, UI, data flow)
   - Phase 3: Testing & Polish (tests, optimization)
4. **Run quality gates** after each task
5. **Report progress** with detailed status

### Options

- `--phase [1|2|3|all]`: Execute specific phase
- `--dry-run`: Preview what would be done
- `--strict`: Stop on any test failure

## 📁 PRP Organization

```
docs/
├── subapps/
│   ├── [app-name]/
│   │   └── prp/
│   │       └── [feature-name].md
├── core-service/
│   └── prp/
│       └── [service-feature].md
├── architecture/
│   └── prp/
│       └── [pattern-name].md
```

## ✅ Quality Gates

Each execution must pass:

1. **Lint**: `pnpm eslint`
2. **Types**: `pnpm typecheck`
3. **Tests**: `pnpm test`
4. **Build**: `pnpm build`

## 🎯 Best Practices

### For /generate-prp

- Be specific about the feature
- Include business context
- Specify exact stack components
- Define clear user groups

### For /execute-prp

- Review PRP before execution
- Run phases incrementally
- Monitor output for issues
- Test manually after completion

## 📊 Workflow

```
1. Feature Request
   ↓
2. /generate-prp
   ↓
3. Review & Adjust PRP
   ↓
4. /execute-prp --phase 1
   ↓
5. /execute-prp --phase 2
   ↓
6. /execute-prp --phase 3
   ↓
7. Manual Testing
   ↓
8. Ship! 🚀
```

## 🚨 Common Issues

| Issue           | Solution                            |
| --------------- | ----------------------------------- |
| PRP too vague   | Add more specific requirements      |
| Tests failing   | Check error logs, fix incrementally |
| Wrong location  | Move PRP to correct folder          |
| Missing context | Update PRP with codebase references |

## 🔧 Cursor-Specific Tips

### Setup

1. Ensure `.cursor/rules/kodix-prp-workflow.md` exists
2. Restart Cursor after adding the rules file
3. Test with a simple feature first

### Usage

1. Type the command exactly as shown
2. Wait for Cursor to process the request
3. Review generated content before proceeding
4. Use incremental execution for complex features

### Troubleshooting

1. If commands don't work, check the rules file
2. Ensure you're in the project root
3. Try restarting Cursor
4. Check that documentation references are valid

## 📚 Full Documentation

- [Complete PRP Workflow Guide](./prp-workflow-implementation.md)
- [Example PRPs](../../../subapps/ai-studio/prp/)
- [Context Engineering Plan](./kodix-documentation-upgrade-plan.md)
- [Cursor Rules File](../../../.cursor/rules/kodix-prp-workflow.md)

<!-- AI-RELATED: [prp-workflow-implementation.md] -->
<!-- REQUIRED-BY: [development-workflow] -->
<!-- SEE-ALSO: [kodix-documentation-upgrade-plan.md] -->
