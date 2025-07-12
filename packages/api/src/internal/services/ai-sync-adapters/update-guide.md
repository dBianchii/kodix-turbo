# AI Provider Update Guide

<!-- AI-METADATA:
category: maintenance
stack: ai-providers
complexity: intermediate
dependencies: [pricing.json, prompt-strategies.json]
-->

## 🎯 Purpose

This unified guide provides step-by-step instructions for updating both **pricing data** and **prompt strategies** for AI providers in the Kodix platform, following the same structured approach for consistency.

## 📚 Overview

The Kodix platform maintains two types of configurations for each AI provider:

1. **Pricing Data**: Cost information for input/output tokens
2. **Prompt Strategies**: Behavioral configurations for agent switching

Both follow the same update methodology and validation process.

## 🔧 Unified Update Process

### Step 1: Preparation

#### Check Current State

- Review existing pricing in `{provider}-pricing.json`
- Review existing strategies in `{provider}-prompt-strategies.json`
- Identify what needs to be updated

#### Gather Information

- **For Pricing**: Check official provider pricing pages
- **For Strategies**: Research provider documentation and test model behavior
- Document the rationale for changes

### Step 2: Provider-Specific Research

Follow the detailed guides for each provider:

| Provider      | Pricing Guide                                    | Strategy Guide                                                       | Research Guide                                                 |
| ------------- | ------------------------------------------------ | -------------------------------------------------------------------- | -------------------------------------------------------------- |
| **Anthropic** | [`anthropic-pricing.md`](./anthropic-pricing.md) | [`anthropic-prompt-strategies.md`](./anthropic-prompt-strategies.md) | [`PROMPT_STRATEGY_RESEARCH.md`](./PROMPT_STRATEGY_RESEARCH.md) |
| **OpenAI**    | [`openai-pricing.md`](./openai-pricing.md)       | [`openai-prompt-strategies.md`](./openai-prompt-strategies.md)       | [`PROMPT_STRATEGY_RESEARCH.md`](./PROMPT_STRATEGY_RESEARCH.md) |
| **Google**    | [`google-pricing.md`](./google-pricing.md)       | [`google-prompt-strategies.md`](./google-prompt-strategies.md)       | [`PROMPT_STRATEGY_RESEARCH.md`](./PROMPT_STRATEGY_RESEARCH.md) |

### Step 3: Update JSON Files

#### Pricing Updates

```json
// {provider}-pricing.json
[
  {
    "modelId": "exact-model-id-from-api",
    "pricing": {
      "input": "price_per_million_tokens",
      "output": "price_per_million_tokens",
      "unit": "per_million_tokens"
    }
  }
]
```

#### Strategy Updates

```json
// {provider}-prompt-strategies.json
[
  {
    "modelId": "exact-model-id-from-api",
    "strategy": {
      "type": "provider-category",
      "agentSwitchTemplate": "template-type",
      "assertiveness": "low|medium|high",
      "contextualMemory": "low|medium|high",
      "specialHandling": ["array", "of", "features"]
    }
  }
]
```

### Step 4: Validation

#### Pricing Validation

- [ ] Prices are strings, not numbers
- [ ] Unit is `"per_million_tokens"`
- [ ] Prices match official sources
- [ ] Model IDs match API responses exactly

#### Strategy Validation

- [ ] Strategy type is valid for provider
- [ ] Template type is appropriate
- [ ] Assertiveness/memory levels are valid
- [ ] Special handling features are relevant

### Step 5: Testing

#### Development Testing

```bash
# Start development environment
sh scripts/start-dev-bg.sh

# Build API with changes
pnpm build --filter @kdx/api

# Test in AI Studio UI
# 1. Trigger model sync for provider
# 2. Verify pricing displays correctly
# 3. Test agent switching functionality
# 4. Verify prompt strategies work as expected
```

#### Validation Points

- **Pricing**: Models show correct costs in UI
- **Strategies**: Agent switching works consistently
- **Performance**: No regression in other models
- **Sync**: Provider sync completes successfully

## 📝 Common Update Scenarios

### Scenario 1: New Model Released

#### Pricing Update

1. Check provider's official pricing page
2. Add new entry to `{provider}-pricing.json`
3. Verify model ID matches API exactly

#### Strategy Update

1. Research model capabilities and behavior
2. Determine appropriate strategy based on model size/type
3. Add configuration to `{provider}-prompt-strategies.json`
4. Test agent switching with new model

#### Example: Adding GPT-5

```json
// openai-pricing.json
{
  "modelId": "gpt-5-2025-06-01",
  "pricing": {
    "input": "5.00",
    "output": "15.00",
    "unit": "per_million_tokens"
  }
}

// openai-prompt-strategies.json
{
  "modelId": "gpt-5-2025-06-01",
  "strategy": {
    "type": "gpt-advanced",
    "agentSwitchTemplate": "hierarchical",
    "assertiveness": "medium",
    "contextualMemory": "high",
    "specialHandling": ["priority-system", "advanced-reasoning"]
  }
}
```

### Scenario 2: Price Change

1. Visit official pricing page
2. Update existing model's pricing in JSON
3. Verify change matches official documentation
4. Test sync to ensure pricing updates correctly

### Scenario 3: Strategy Optimization

1. Document current agent switching issues
2. Research provider recommendations
3. Test different strategy configurations
4. Update JSON with optimized settings
5. Validate improved performance

### Scenario 4: Model Deprecated

1. Check if model is still in provider API
2. Remove from both pricing and strategy JSONs
3. Adapter will automatically archive during sync

## ✅ Validation Checklist

### Pre-Update

- [ ] Research official provider documentation
- [ ] Test current behavior and identify issues
- [ ] Document specific problems to address
- [ ] Plan testing approach

### During Update

- [ ] Follow JSON structure exactly
- [ ] Use only valid configuration values
- [ ] Maintain consistent formatting
- [ ] Verify model IDs match API responses

### Post-Update

- [ ] Build API successfully
- [ ] Test provider sync in AI Studio
- [ ] Verify pricing displays correctly
- [ ] Test agent switching functionality
- [ ] Check for regressions in other models
- [ ] Document changes in commit message

## 🚨 Important Rules

### Model ID Consistency

**Critical**: The `modelId` must be identical in both files and match exactly what the provider's API returns.

```json
// ✅ Correct - Same model ID in both files
// pricing.json
{"modelId": "claude-3-5-sonnet-20241022", "pricing": {...}}

// prompt-strategies.json
{"modelId": "claude-3-5-sonnet-20241022", "strategy": {...}}

// ❌ Incorrect - Mismatched IDs
// pricing.json
{"modelId": "claude-3-5-sonnet-20241022", "pricing": {...}}

// prompt-strategies.json
{"modelId": "claude-3.5-sonnet-20241022", "strategy": {...}}
```

### Data Format Requirements

#### Pricing

- Prices must be **strings** (`"2.50"`, not `2.50`)
- Unit must be `"per_million_tokens"`
- Use exact decimal format from official sources

#### Strategies

- Use only valid strategy types for each provider
- Assertiveness/memory must be `"low"`, `"medium"`, or `"high"`
- Special handling must be an array of strings

### Sync Process

- Model sync must be triggered from AI Studio UI
- No command-line sync utility available
- Both pricing and strategies sync together
- Changes take effect immediately after sync

## 🔧 Troubleshooting

### Common Issues

#### Pricing Problems

- **Model not showing pricing**: Check model ID consistency
- **Wrong pricing displayed**: Verify prices are strings
- **Sync failing**: Validate JSON syntax

#### Strategy Problems

- **Agent switching not working**: Check assertiveness level
- **Inconsistent responses**: Adjust contextual memory
- **Template not effective**: Try different template type

### Debugging Steps

1. Check server logs for sync errors
2. Verify API keys are configured correctly
3. Test individual provider adapters
4. Validate JSON syntax in both files
5. Confirm model IDs match API responses

## 📋 Contributing Guidelines

When updating provider configurations:

1. **Always reference official sources** for pricing and capabilities
2. **Update both files together** when adding new models
3. **Test thoroughly** before committing changes
4. **Document rationale** in commit messages
5. **Follow validation checklist** completely
6. **Include update date** in commit messages

### Commit Message Format

```
feat(ai-sync): update [provider] pricing and strategies

- Add [new-model] with pricing $X.XX/$Y.YY
- Update [existing-model] strategy for better agent switching
- Source: [official-pricing-page-url]
- Tested: Agent switching and pricing display
```

## 🔗 Detailed Guides

For specific instructions:

- **Pricing Updates**: [`update-pricing.md`](./update-pricing.md)
- **Strategy Updates**: [`update-strategies.md`](./update-strategies.md)
- **Strategy Research**: [`PROMPT_STRATEGY_RESEARCH.md`](./PROMPT_STRATEGY_RESEARCH.md)
- **Provider-Specific**: Individual `.md` files for each provider

## 📊 Maintenance Schedule

### Weekly

- [ ] Monitor provider announcements for new models
- [ ] Check for pricing changes on official pages

### Monthly

- [ ] Review model performance metrics
- [ ] Update deprecated model configurations
- [ ] Test new model releases

### Quarterly

- [ ] Comprehensive strategy effectiveness review
- [ ] A/B testing of alternative approaches
- [ ] Documentation updates and improvements
