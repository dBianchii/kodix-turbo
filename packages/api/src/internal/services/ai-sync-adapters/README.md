# AI Sync Adapters

This directory contains adapters for synchronizing AI models from different providers (OpenAI, Google, Anthropic) with the Kodix platform.

## 🎯 Quick Start

For updating provider configurations, use the **unified approach**:

- **📘 Complete Guide**: [`update-guide.md`](./update-guide.md) - Unified process for both pricing and strategies
- **💰 Pricing Only**: [`update-pricing.md`](./update-pricing.md) - Detailed pricing update instructions
- **🧠 Strategies Only**: [`update-strategies.md`](./update-strategies.md) - Detailed strategy update instructions

## 📚 Overview

Each provider has two types of configurations:

### 🔧 Technical Components

- **Adapter**: TypeScript class that fetches models from the provider's API
- **Pricing JSON**: Static pricing data for models
- **Prompt Strategies JSON**: Model-specific prompt engineering strategies
- **Prompt Templates JSON**: Centralized agent switching prompt templates

### 📖 Documentation

- **Pricing Documentation**: Provider-specific pricing update instructions
- **Strategies Documentation**: Provider-specific strategy update instructions
- **Research Guide**: Methodology for researching optimal strategies

## 📁 File Structure

```
ai-sync-adapters/
├── README.md                           # This file - main documentation
├── update-guide.md                     # Unified update process
├── update-pricing.md                   # Pricing-specific updates
├── update-strategies.md                # Strategy-specific updates
├── prompt-templates.json               # Centralized prompt templates
├── anthropic-adapter.ts                # Anthropic API synchronization
├── anthropic-pricing.json              # Anthropic model pricing data
├── anthropic-pricing.md                # Anthropic pricing documentation
├── anthropic-prompt-strategies.json    # Anthropic prompt strategies
├── anthropic-prompt-strategies.md      # Anthropic strategy documentation
├── google-adapter.ts                   # Google API synchronization
├── google-pricing.json                 # Google model pricing data
├── google-pricing.md                   # Google pricing documentation
├── google-prompt-strategies.json       # Google prompt strategies
├── google-prompt-strategies.md         # Google strategy documentation
├── openai-adapter.ts                   # OpenAI API synchronization
├── openai-pricing.json                 # OpenAI model pricing data
├── openai-pricing.md                   # OpenAI pricing documentation
├── openai-prompt-strategies.json       # OpenAI prompt strategies
└── openai-prompt-strategies.md         # OpenAI strategy documentation
```

## 🎯 Core Components

### Prompt Templates (`prompt-templates.json`)

Centralized repository of all prompt templates used for agent switching across different AI providers. Each template is identified by a key and contains placeholders for dynamic content.

**Essential Templates:**

- `xml-tags-high`: Aggressive XML-structured template for high-capability models
- `xml-tags-default`: Standard XML-structured template for Claude models
- `hierarchical-high`: Priority-based template for advanced GPT models
- `hierarchical-default`: Standard hierarchical template for GPT models
- `direct-command`: Command-style template for Gemini models
- `direct-simple`: Simple direct template for standard models
- `simple`: Minimal template for lightweight models
- `reasoning-focused`: Specialized template for O-series reasoning models

## 🚀 How to Update Configurations

### Recommended Approach

**Use the unified guide for best results:**

1. **📘 Start here**: [`update-guide.md`](./update-guide.md) - Complete process for updating both pricing and strategies
2. **🎯 Follow the checklist**: Ensures consistency and validation
3. **🧪 Test thoroughly**: Both pricing display and agent switching functionality

### Alternative: Specific Updates

If you only need to update one type of configuration:

- **💰 Pricing only**: [`update-pricing.md`](./update-pricing.md)
- **🧠 Strategies only**: [`update-strategies.md`](./update-strategies.md)

### Provider Resources

| Provider      | Pricing Guide                                    | Strategy Guide                                                       | Official Page                                                                 |
| ------------- | ------------------------------------------------ | -------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Anthropic** | [`anthropic-pricing.md`](./anthropic-pricing.md) | [`anthropic-prompt-strategies.md`](./anthropic-prompt-strategies.md) | [docs.anthropic.com](https://docs.anthropic.com/en/docs/about-claude/pricing) |
| **OpenAI**    | [`openai-pricing.md`](./openai-pricing.md)       | [`openai-prompt-strategies.md`](./openai-prompt-strategies.md)       | [openai.com/api/pricing](https://openai.com/api/pricing/)                     |
| **Google**    | [`google-pricing.md`](./google-pricing.md)       | [`google-prompt-strategies.md`](./google-prompt-strategies.md)       | [ai.google.dev/pricing](https://ai.google.dev/pricing)                        |

## ⚡ Quick Examples

### Adding a New Model

```json
// 1. Add to {provider}-pricing.json
{
  "modelId": "new-model-2025-01-01",
  "pricing": {
    "input": "2.00",
    "output": "8.00",
    "unit": "per_million_tokens"
  }
}

// 2. Add to {provider}-prompt-strategies.json
{
  "modelId": "new-model-2025-01-01",
  "strategy": {
    "type": "provider-advanced",
    "agentSwitchTemplate": "hierarchical-high", // Reference to a template in prompt-templates.json
    "assertiveness": "medium",
    "contextualMemory": "high",
    "specialHandling": ["relevant-features"]
  }
}
```

### Testing Process

```bash
# 1. Build API
pnpm build --filter @kdx/api

# 2. Start development environment
sh scripts/start-dev-bg.sh

# 3. Test in AI Studio UI:
#    - Trigger provider sync
#    - Verify pricing displays
#    - Test agent switching
```

## Prompt Templates

The `prompt-templates.json` file is a centralized repository for agent switch prompts. Instead of hardcoding prompts in the service layer, this file provides a clean, maintainable way to manage different prompt styles.

- **Centralized**: All prompt templates are in one place.
- **Reusable**: Strategies in `*-prompt-strategies.json` files refer to templates by their key (e.g., `"xml-tags-high"`).
- **Maintainable**: Easy to update, add, or A/B test new prompt styles.

### Prompt Strategies (`*-prompt-strategies.json`)

Configuration files that define how each AI model should handle agent switching. Each strategy maps a model to a specific template and behavioral parameters.

**Strategy Structure:**

```json
{
  "modelId": "model-name",
  "strategy": {
    "type": "provider-category",
    "agentSwitchTemplate": "template-key",
    "assertiveness": "low|medium|high",
    "contextualMemory": "low|medium|high",
    "specialHandling": ["feature1", "feature2"]
  }
}
```

**Key Fields:**

- `agentSwitchTemplate`: References a template key from `prompt-templates.json`
- `assertiveness`: How forceful the agent switch instructions should be
- `contextualMemory`: How much conversation history influences responses
- `specialHandling`: Provider-specific features or behavioral modifiers

### Usage

The strategies are automatically loaded by the `AiStudioService` when building agent switch prompts. The service reads the strategy, finds the corresponding template from `prompt-templates.json`, and constructs the final prompt.

```typescript
// 1. Get strategy for the model
const strategy = this.getPromptStrategy(modelName);
// 2. Build prompt using the template referenced in the strategy
const prompt = this.buildAgentSwitchPrompt({ strategy, ... });
```

### Provider-Specific Files

- **Anthropic**: `anthropic-prompt-strategies.json` + `anthropic-prompt-strategies.md`
- **OpenAI**: `openai-prompt-strategies.json` + `openai-prompt-strategies.md`
- **Google**: `google-prompt-strategies.json` + `google-prompt-strategies.md`

### Updating Strategies

When adding new models or updating existing ones:

1. Determine the model's behavioral characteristics
2. Test the model's response to different prompt styles from `prompt-templates.json`
3. Update the appropriate JSON file with the optimal strategy
4. Document any model-specific quirks in the provider's markdown file

## 📋 Important Notes

### Model Synchronization

- **Sync must be triggered from AI Studio UI** - no command-line utility available
- Both pricing and strategies sync together automatically
- Changes take effect immediately after successful sync

### Model ID Consistency

- **Critical**: `modelId` must be identical in both pricing and strategy files
- Must match exactly what the provider's API returns
- Mismatched IDs result in missing data or sync failures

### Understanding Model IDs in Kodix

It is crucial to understand the difference between the identifiers for a model:

- **`universalModelId` (string)**: This is the **public-facing ID** from the provider (e.g., `"gpt-4o"`, `"claude-3-5-sonnet-20240620"`). **This is the ID that MUST be used as the key in the `pricing` and `strategies` JSON files.** It is what links a model in our system to its configuration.
- **`name` (string)**: This is a **display name or alias** used internally within Kodix for presentation purposes in the UI. It can be renamed by users and should **NEVER** be used as a key for looking up strategies or pricing. It is for display only.
- **`id` (cuid)**: This is the **internal primary key** for the model in the Kodix database (`aiModels` table). It is a unique UUID generated by our system and should **NEVER** be used in the configuration files.

The `AiStudioService` uses the internal `id` to fetch the model from the database, retrieves its `universalModelId`, and then uses the `universalModelId` to look up the correct pricing and strategy from the JSON files.

### Data Format Requirements

- **Pricing**: Prices must be strings (`"2.50"`), unit must be `"per_million_tokens"`
- **Strategies**: Use only valid types/templates for each provider
- **Both**: Maintain consistent JSON formatting

## 🔗 Complete Documentation

- **📘 [`update-guide.md`](./update-guide.md)** - Unified update process (recommended)
- **💰 [`update-pricing.md`](./update-pricing.md)** - Detailed pricing instructions
- **🧠 [`update-strategies.md`](./update-strategies.md)** - Detailed strategy instructions
- **🔬 [`PROMPT_STRATEGY_RESEARCH.md`](./PROMPT_STRATEGY_RESEARCH.md)** - Research methodology

## 📞 Contact

For questions about pricing updates, prompt strategies, or adapter functionality, refer to the main Kodix documentation or contact the development team.
