# PRP Workflow Test Example

<!-- AI-METADATA:
category: example
stack: general
complexity: basic
dependencies: [prp-workflow-implementation.md]
-->

## 🎯 Purpose

This document provides a simple test case to validate the PRP workflow implementation in Cursor.

## 🧪 Test Case: Simple Feature Toggle

Use this example to test that your PRP workflow commands are working correctly.

### Step 1: Generate PRP

Type this exact command in Cursor:

```markdown
/generate-prp

Feature: Add a simple feature toggle component for enabling/disabling dark mode
Context: Users want to easily switch between light and dark themes
Users: All Kodix application users
Stack: Next.js component, Zustand for state management, Tailwind CSS for styling
```

### Expected Output

Cursor should:

1. Analyze the request
2. Search for similar components in the codebase
3. Reference relevant documentation
4. Generate a complete PRP document
5. Save it to `docs/subapps/[appropriate-app]/prp/feature-toggle-dark-mode.md`

### Step 2: Review Generated PRP

The generated PRP should include:

- Clear goal statement
- Context and user needs
- Specific acceptance criteria
- Technical specification with Zustand integration
- Testing requirements
- Three-phase implementation plan
- Risk assessment

### Step 3: Execute PRP (Phase 1 Only)

```markdown
/execute-prp docs/subapps/[app]/prp/feature-toggle-dark-mode.md --phase 1
```

### Expected Execution

Cursor should:

1. Read the PRP document
2. Create basic component structure
3. Set up initial tests
4. Run quality gates (lint, types, tests, build)
5. Report progress with status indicators

## ✅ Success Criteria

The workflow is working correctly if:

- [ ] `/generate-prp` creates a complete, well-structured PRP
- [ ] PRP follows the standard template format
- [ ] PRP includes Kodix-specific patterns and conventions
- [ ] `/execute-prp` reads the PRP and starts implementation
- [ ] Quality gates run after each task
- [ ] Progress is reported clearly
- [ ] All generated code follows Kodix standards

## 🚨 Troubleshooting

If the commands don't work:

1. **Check Rules File**: Ensure `.cursor/rules/kodix-prp-workflow.md` exists
2. **Restart Cursor**: Close and reopen the application
3. **Verify Location**: Make sure you're in the project root directory
4. **Check Syntax**: Type commands exactly as shown
5. **Review Output**: Look for any error messages or unexpected behavior

## 📚 Next Steps

Once this test works:

1. Try a more complex feature
2. Test all three phases of execution
3. Validate quality gates are working
4. Share feedback on the workflow

<!-- AI-RELATED: [prp-workflow-implementation.md] -->
<!-- DEPENDS-ON: [prp-workflow-implementation.md] -->
<!-- SEE-ALSO: [prp-quick-reference.md] -->
