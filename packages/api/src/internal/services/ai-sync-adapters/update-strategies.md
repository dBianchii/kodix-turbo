# Prompt Strategy Update Guide

<!-- AI-METADATA:
category: maintenance
stack: ai-providers
complexity: intermediate
dependencies: [prompt-strategies.json]
-->

## 🎯 Purpose

This guide provides structured procedures for updating and maintaining prompt strategy configurations for AI providers in the Kodix platform.

## 📋 Update Process

### 1. Research-Based Updates

Before making any changes, follow the research methodology in `PROMPT_STRATEGY_RESEARCH.md`:

1. **Literature Review**: Check provider documentation for changes
2. **Empirical Testing**: Test current strategies against real data
3. **Validation**: A/B test proposed changes
4. **Documentation**: Record findings and rationale

### 2. Strategy Configuration Structure

Each provider has a JSON file with this structure:

```json
{
  "modelId": "model-name",
  "strategy": {
    "type": "provider-category",
    "agentSwitchTemplate": "template-type",
    "assertiveness": "low|medium|high",
    "contextualMemory": "low|medium|high",
    "specialHandling": ["array", "of", "features"]
  }
}
```

### 3. Valid Configuration Values

#### `agentSwitchTemplate` (Template Key)

This field no longer contains the prompt itself. Instead, it holds a **key** that references a specific template within the centralized `prompt-templates.json` file.

**Examples of Keys**:

- `xml-tags-high`
- `hierarchical-default`
- `direct-command`
- `simple`
- `reasoning-focused`

---

#### Anthropic (Claude)

- **Types**: `claude-advanced`, `claude-standard`, `claude-lite`
- **Template Keys**: `xml-tags-high`, `xml-tags-default`, `simple`
- **Special Handling**: `system-reset`, `identity-override`, `xml-structure`, `constitutional-ai`

#### OpenAI (GPT)

- **Types**: `gpt-advanced`, `gpt-standard`, `gpt-lite`, `reasoning-model`
- **Template Keys**: `hierarchical-high`, `hierarchical-default`, `simple`, `reasoning-focused`
- **Special Handling**: `priority-system`, `role-override`, `chain-of-thought`, `gentle-reset`

#### Google (Gemini)

- **Types**: `google-advanced`, `google-standard`, `google-lite`, `google-legacy`
- **Template Keys**: `direct-command`, `direct-simple`, `simple`
- **Special Handling**: `command-structure`, `role-assignment`, `multimodal`, `safety-filters`

## 🔧 Update Procedures

### Adding a New Model

1. **Research the Model**: Check provider documentation for capabilities
2. **Choose a Template**: Select the most appropriate template key from `prompt-templates.json`.
3. **Configure the Strategy**: Update the provider's `*-prompt-strategies.json` file.
4. **Test Thoroughly**: Validate the new configuration in a testing environment.

### Updating Existing Strategy

1. **Document Current Behavior**: Record what's not working
2. **Research Solution**: Use provider documentation
3. **Test Changes**: In development environment
4. **Update Configuration**: Modify specific fields
5. **Validate**: Ensure agent switching works correctly

### Example Updates

#### Increasing Assertiveness for Claude

```json
// Before
"assertiveness": "medium"

// After (if agent switching is inconsistent)
"assertiveness": "high"
```

#### Adding New Special Handling

```json
// Before
"specialHandling": ["system-reset"]

// After (adding identity override)
"specialHandling": ["system-reset", "identity-override"]
```

## ✅ Validation Checklist

Before updating any strategy file:

### Pre-Update

- [ ] Research provider documentation changes
- [ ] Test current strategy performance
- [ ] Document specific issues to address
- [ ] Plan testing approach

### During Update

- [ ] Follow JSON structure exactly
- [ ] Use only valid configuration values
- [ ] Maintain consistent formatting
- [ ] Add comments explaining changes

### Post-Update

- [ ] Test agent switching functionality
- [ ] Verify no regression in other models
- [ ] Document changes in commit message
- [ ] Update related documentation if needed

## 🔍 Testing Strategy Updates

### 1. Development Testing

```bash
# Start development environment
sh scripts/start-dev-bg.sh

# Test specific model switching
# Use chat interface to switch between agents
# Verify prompt changes take effect
```

### 2. Validation Points

- **Agent Recognition**: Does the AI recognize the new agent?
- **Instruction Following**: Does it follow the new agent's instructions?
- **Context Preservation**: Is conversation context maintained?
- **Consistency**: Are responses consistent with agent personality?

### 3. Performance Metrics

- **Switch Success Rate**: % of successful agent switches
- **Response Quality**: Subjective assessment of responses
- **Latency**: Time to recognize and switch agents
- **Edge Cases**: Behavior with complex scenarios

## 📊 Strategy Evolution Tracking

### Change Log Format

When updating strategies, document in this format:

```markdown
## [Date] - [Provider] Strategy Update

### Changed Models

- `model-id`: Changed `field` from `old-value` to `new-value`

### Rationale

Brief explanation of why the change was made.

### Testing Results

Summary of testing performed and results.

### Impact

Expected impact on agent switching performance.
```

### Version Control

- **Commit Messages**: Clear description of strategy changes
- **Branch Naming**: `feature/update-[provider]-strategies`
- **PR Description**: Include testing results and rationale

## 🚨 Common Issues and Solutions

### Agent Switching Not Working

1. **Check Assertiveness**: Increase if model is "stubborn"
2. **Verify Template**: Ensure template matches provider preferences
3. **Review Special Handling**: Add appropriate features for model type

### Inconsistent Responses

1. **Adjust Contextual Memory**: Lower if responses are too influenced by history
2. **Modify Template**: Use more structured approach
3. **Add Special Handling**: Include specific behavioral modifiers

### Performance Issues

1. **Simplify Template**: Use `simple` for faster models
2. **Reduce Special Handling**: Remove unnecessary features
3. **Lower Assertiveness**: Reduce prompt complexity

## 📚 Maintenance Schedule

### Monthly Reviews

- [ ] Check provider documentation for updates
- [ ] Review model performance metrics
- [ ] Update deprecated model configurations
- [ ] Test new model releases

### Quarterly Assessments

- [ ] Comprehensive strategy effectiveness review
- [ ] A/B testing of alternative approaches
- [ ] Documentation updates
- [ ] Training data analysis

## 🔗 Related Resources

- `PROMPT_STRATEGY_RESEARCH.md` - Research methodology
- `anthropic-prompt-strategies.json` - Anthropic configurations
- `openai-prompt-strategies.json` - OpenAI configurations
- `google-prompt-strategies.json` - Google configurations
- `docs/subapps/chat/agent-switching-architecture.md` - System architecture
