# Product Requirements Prompt (PRP) System

<!-- AI-METADATA:
category: guide
stack: general
complexity: basic
dependencies: []
-->

## 🎯 Quick Summary

The PRP system is a universal workflow for transforming feature requests into working code through structured documentation and AI-assisted implementation.

## 📋 Overview

The PRP (Product Requirements Prompt) system provides a structured approach to feature development that works with any AI coding assistant. Instead of "vibe coding" or ad-hoc development, PRPs ensure consistent, high-quality implementations through comprehensive specifications.

### Why PRPs?

- **Clear Specifications**: Transform vague requests into detailed requirements
- **Quality Assurance**: Built-in testing and validation at every step
- **Pattern Consistency**: Ensures adherence to project architecture
- **Tool Agnostic**: Works with Cursor, Claude Code, Windsurf, or any AI assistant
- **Documentation**: Every feature is automatically documented

## 🔄 The PRP Workflow

```mermaid
graph LR
    subgraph "Phase 1: Specification"
        A[Feature Request] --> B[/generate-prp]
        B --> C[PRP Document]
        C --> D[Review & Adjust]
    end

    subgraph "Phase 2: Implementation"
        D --> E[/execute-prp]
        E --> F[Working Code]
        F --> G[Quality Checks]
        G --> H[Ready to Ship]
    end

    style B fill:#4CAF50,stroke:#333,stroke-width:2px
    style E fill:#2196F3,stroke:#333,stroke-width:2px
```

## 🚀 Getting Started

### Step 1: Create a Feature Request

Create an `INITIAL.md` file with your feature description:

```markdown
## FEATURE:

Add real-time collaboration to document editing

## CONTEXT:

Users need to collaborate on documents in real-time, similar to Google Docs

## USERS:

Team members working on shared documents

## STACK:

WebSockets, CRDT algorithms, React, tRPC

## EXAMPLES:

Look at existing WebSocket implementation in chat feature

## DOCUMENTATION:

- WebSocket API docs
- CRDT library documentation

## OTHER CONSIDERATIONS:

- Handle offline mode gracefully
- Optimize for performance with many concurrent users
```

### Step 2: Generate the PRP

Use the generate command:

```
/generate-prp INITIAL.md
```

Or provide details directly:

```
/generate-prp Add dark mode toggle to settings page
```

### Step 3: Review the Generated PRP

The AI will create a comprehensive PRP document with:

- Clear goals and acceptance criteria
- Technical specifications
- Implementation phases
- Testing requirements
- Risk assessment

### Step 4: Execute the Implementation

Run the execute command:

```
/execute-prp docs/subapps/editor/prp/real-time-collaboration.md
```

The AI will:

1. Create an implementation plan
2. Write code following project patterns
3. Add comprehensive tests
4. Ensure all quality checks pass
5. Verify acceptance criteria are met

## 📁 Directory Structure

PRPs are organized by scope:

```
docs/
├── context-engineering/
│   └── prp/
│       ├── README.md           # This file
│       ├── INITIAL-example.md  # Example feature request
│       └── templates/
│           └── prp-base.md     # Base template
├── subapps/
│   └── [subapp-name]/
│       └── prp/
│           └── [feature-name].md
├── core-service/
│   └── prp/
└── architecture/
    └── prp/
```

## 📝 Command Reference

### `/generate-prp`

Generates a Product Requirements Prompt from a feature description.

**Accepts**:

- Direct feature description
- Path to INITIAL.md file
- Structured input with Feature/Context/Users/Stack

**Outputs**:

- Complete PRP document
- Saved to appropriate directory
- Ready for review and execution

### `/execute-prp`

Executes a PRP to implement the specified feature.

**Accepts**:

- Path to PRP document

**Process**:

1. Parses PRP requirements
2. Creates task breakdown
3. Implements incrementally
4. Runs quality checks
5. Ensures criteria are met

## 🎯 Universal Compatibility

The PRP system is designed to work with any AI assistant:

### How It Works

1. **Commands are Instructions**: The `/generate-prp` and `/execute-prp` commands are markdown files with instructions for the AI
2. **No Scripts Required**: No bash scripts or executable code needed
3. **AI Interprets**: The AI reads the command files and follows the instructions
4. **Tool Agnostic**: Works with any AI that can read markdown and follow instructions

### Supported AI Assistants

- ✅ **Cursor**: Add commands to `.cursor/commands/`
- ✅ **Claude Code**: Recognizes slash commands automatically
- ✅ **Windsurf**: Configure custom commands
- ✅ **Any AI Assistant**: Just reference the command files

## 📚 Templates and Examples

### INITIAL.md Template

See `INITIAL-example.md` for a complete example of a feature request.

### PRP Template

See `templates/prp-base.md` for the standard PRP structure.

### Example PRPs

Browse existing PRPs in the project:

- `docs/subapps/*/prp/` - SubApp features
- `docs/core-service/prp/` - Core features
- `docs/architecture/prp/` - Architecture patterns

## 🚀 Best Practices

### For Feature Requests (INITIAL.md)

1. **Be Specific**: Clearly describe what you want built
2. **Provide Context**: Explain why the feature is needed
3. **Identify Users**: Who will use this feature?
4. **Specify Stack**: What technologies are involved?
5. **Include Examples**: Reference similar existing code
6. **Add Documentation**: Link to relevant resources

### For PRPs

1. **Clear Goals**: One sentence that captures the essence
2. **Measurable Criteria**: Specific, testable requirements
3. **Realistic Phases**: Break work into manageable chunks
4. **Comprehensive Tests**: Cover all scenarios
5. **Risk Assessment**: Identify and mitigate risks

### For Implementation

1. **Follow the PRP**: Don't deviate from specifications
2. **Quality First**: Fix issues before proceeding
3. **Test Everything**: No untested code
4. **Document Well**: Clear comments and documentation
5. **Stay Consistent**: Follow project patterns

## 🔧 Kodix-Specific Considerations

When using PRPs in the Kodix monorepo:

1. **Multi-tenancy**: Always consider teamId isolation
2. **i18n Required**: No hardcoded strings
3. **SubApp Architecture**: Follow isolation principles
4. **Service Layer**: Use for cross-app communication
5. **Testing**: Comprehensive tests are mandatory

## 📊 Benefits

### Immediate Benefits

- **50% Faster Development**: Clear specs reduce implementation time
- **Higher Quality**: Built-in validation catches issues early
- **Better Documentation**: Every feature is documented
- **Consistent Patterns**: Enforces architectural standards

### Long-term Benefits

- **Knowledge Base**: PRPs become searchable documentation
- **Pattern Library**: Successful implementations become templates
- **Team Alignment**: Clear specifications reduce miscommunication
- **Continuous Improvement**: System improves with each use

## 🚨 Troubleshooting

### Common Issues

**PRP Generation Issues**:

- Ensure feature description is clear and complete
- Check that all required sections are provided
- Reference existing code for patterns

**Execution Issues**:

- Verify PRP has all required sections
- Check that dependencies are available
- Ensure development environment is set up

**Quality Check Failures**:

- Read error messages carefully
- Fix issues incrementally
- Run checks after each fix

## 📚 Related Resources

- [Context Engineering Intro](https://github.com/coleam00/context-engineering-intro) - Original inspiration
- [Universal AI Principles](../../ai-assistants/universal-principles.md) - Core concepts
- [Kodix Architecture](../../architecture/) - Project patterns
- [Development Workflow](../../architecture/development-workflow.md) - Dev practices

<!-- AI-RELATED: [../README.md, ../../ai-assistants/universal-principles.md] -->
<!-- DEPENDS-ON: [context-engineering-principles] -->
<!-- REQUIRED-BY: [development-workflow] -->
<!-- SEE-ALSO: [templates/prp-base.md, INITIAL-example.md] -->
