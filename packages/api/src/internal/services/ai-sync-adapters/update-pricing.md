# AI Provider Pricing Update Guide

<!-- AI-METADATA:
category: maintenance
stack: ai-providers
complexity: basic
dependencies: [pricing.json]
-->

## 🎯 Purpose

This guide provides detailed instructions for updating pricing data for AI providers in the Kodix platform.

## 📚 Quick Reference

| Provider      | Pricing Documentation                            | JSON File                                            | Official Pricing Page                                                                 |
| ------------- | ------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Anthropic** | [`anthropic-pricing.md`](./anthropic-pricing.md) | [`anthropic-pricing.json`](./anthropic-pricing.json) | [docs.anthropic.com/pricing](https://docs.anthropic.com/en/docs/about-claude/pricing) |
| **OpenAI**    | [`openai-pricing.md`](./openai-pricing.md)       | [`openai-pricing.json`](./openai-pricing.json)       | [openai.com/api/pricing](https://openai.com/api/pricing/)                             |
| **Google**    | [`google-pricing.md`](./google-pricing.md)       | [`google-pricing.json`](./google-pricing.json)       | [ai.google.dev/pricing](https://ai.google.dev/pricing)                                |

## 🔧 Update Process

### Step 1: Check Current Pricing

Before updating, review the current pricing data in the respective JSON files to understand what needs to be changed.

### Step 2: Follow Provider-Specific Instructions

Each provider has detailed documentation:

- **For Anthropic**: Read [`anthropic-pricing.md`](./anthropic-pricing.md)
- **For OpenAI**: Read [`openai-pricing.md`](./openai-pricing.md)
- **For Google**: Read [`google-pricing.md`](./google-pricing.md)

### Step 3: Update JSON Files

Each JSON file follows the same structure:

```json
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

### Step 4: Verify Model IDs

Ensure the `modelId` matches exactly what the provider's API returns:

#### Anthropic Model IDs

- `claude-opus-4-20250514`
- `claude-sonnet-4-20250514`
- `claude-3-7-sonnet-20250219`
- `claude-3-5-sonnet-20240620`
- `claude-3-5-sonnet-20241022`
- `claude-3-5-haiku-20241022`
- `claude-3-opus-20240229`
- `claude-3-haiku-20240307`

#### OpenAI Model IDs

- `gpt-4.1-2025-04-14`
- `gpt-4.1-mini-2025-04-14`
- `gpt-4.1-nano-2025-04-14`
- `o3-2025-01-31`
- `o3-mini-2025-01-31`
- `o1-2024-12-17`
- `o1-preview-2024-09-12`
- `o1-mini-2024-09-12`
- `gpt-4o-2024-11-20`
- `gpt-4o-2024-08-06`
- `gpt-4o-2024-05-13`
- `gpt-4o-mini-2024-07-18`
- `gpt-4-turbo-2024-04-09`
- `gpt-3.5-turbo-0125`

#### Google Model IDs

- `gemini-2.5-pro`
- `gemini-2.5-flash`
- `gemini-2.5-flash-lite`
- `gemini-2.0-flash`
- `gemini-2.0-flash-lite`
- `gemini-1.5-pro`
- `gemini-1.5-flash`
- `gemini-1.5-flash-8b`
- `gemini-1.0-pro`

## 📝 Common Update Scenarios

### Scenario 1: New Model Released

1. Check the provider's official pricing page
2. Add new entry to the respective JSON file
3. Update the pricing documentation if needed
4. Consider adding prompt strategy for the new model

### Scenario 2: Price Change

1. Visit the official pricing page
2. Update the existing model's pricing in the JSON file
3. Verify the change matches the official documentation

### Scenario 3: Model Deprecated

1. Check if the model is still available in the provider's API
2. Remove from JSON file if completely deprecated
3. The adapter will automatically mark it as archived during sync

## ✅ Pricing Format Guidelines

### Requirements

- Prices must be **strings** (e.g., `"2.50"`, not `2.50`)
- Unit must always be `"per_million_tokens"`
- Prices are in **USD per million tokens**
- Use exact decimal format from official sources

### Examples

```json
// ✅ Correct
{
  "modelId": "gpt-4.1-2025-04-14",
  "pricing": {
    "input": "2.00",
    "output": "8.00",
    "unit": "per_million_tokens"
  }
}

// ❌ Incorrect - numbers instead of strings
{
  "modelId": "gpt-4.1-2025-04-14",
  "pricing": {
    "input": 2.00,
    "output": 8.00,
    "unit": "per_million_tokens"
  }
}
```

## 🧪 Testing Changes

After updating pricing data:

1. **Build the API**: `pnpm build --filter @kdx/api`
2. **Run sync**: From the AI Studio UI, trigger the model sync for the desired provider
3. **Verify pricing**: Check that models show correct pricing in the UI

## 🚨 Important Notes

### Syncing Models

**The model synchronization process must be run from the AI Studio interface.** There is no command-line utility for this purpose. After updating the pricing files, you must go to the AI Studio in the Kodix application and trigger the sync manually for each provider.

### Pricing Sources

- Always use **official pricing pages** as the source of truth
- Pricing can change frequently - verify before updating
- Some models may have different pricing for different features (batch, caching, etc.)

### Model Matching

- The adapter matches models by `modelId` field
- Models without pricing data will still sync but without pricing information
- Mismatched model IDs will result in missing pricing data

### Sync Behavior

- New models are automatically detected and added
- Existing models are updated with new pricing
- Deprecated models are marked as archived
- Pricing updates are merged into existing model configurations

## 🔧 Troubleshooting

### Common Issues

1. **Model not showing pricing**: Check if `modelId` in JSON matches API response
2. **Sync failing**: Verify JSON syntax is valid
3. **Wrong pricing displayed**: Ensure prices are strings, not numbers

### Debugging

- Check server logs for sync errors
- Verify API keys are configured correctly
- Test individual provider adapters

## 📋 Contributing Guidelines

When updating pricing data:

1. Always reference the official pricing page
2. Update both JSON and documentation if needed
3. Test the changes before committing
4. Include the date of update in commit messages
5. Follow the pricing format guidelines exactly

## 🔗 Related Resources

- `update-strategies.md` - Guide for updating prompt strategies
- `PROMPT_STRATEGY_RESEARCH.md` - Research methodology for strategies
- Provider-specific documentation files
- Main `README.md` for overview
