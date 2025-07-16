# AI Pricing Update Script

> **🤖 Task**: Update pricing for all AI providers and create a sync status report.

## 📁 File Locations (Important!)

**Read from**:
- Provider list: `packages/api/src/internal/services/ai-model-sync-adapter/supported-providers.json`
- Provider docs: `packages/api/src/internal/services/ai-model-sync-adapter/providers/[provider]/[provider]-pricing.md`

**Update**:
- Provider pricing: `packages/api/src/internal/services/ai-model-sync-adapter/providers/[provider]/[provider]-pricing.json`

## Execute These Steps

### 1. Get Provider List
Read: `packages/api/src/internal/services/ai-model-sync-adapter/supported-providers.json`

### 2. Update Each Provider

For each provider in the list, do:

1. **Read provider instructions**: `packages/api/src/internal/services/ai-model-sync-adapter/providers/[provider]/[provider]-pricing.md`
2. **Visit official pricing page** (URL in the MD file)
3. **Update pricing JSON**: `packages/api/src/internal/services/ai-model-sync-adapter/providers/[provider]/[provider]-pricing.json`

**JSON Format**:
```json
{
  "modelId": "exact-model-id",
  "pricing": {
    "input": "X.XX",
    "output": "Y.YY",
    "unit": "per_million_tokens"
  }
}
```

### 3. Verify Updates

**After updating each provider's pricing file**:
- Verify JSON syntax is valid
- Check that all required models have pricing
- Ensure all prices are strings, not numbers
- Confirm unit is "per_million_tokens"

## Quick Reference

| Provider | Pricing Page | Notes |
|----------|-------------|-------|
| OpenAI | https://openai.com/api/pricing/ | Check for o4-mini, GPT-4.1 series |
| Google | https://ai.google.dev/pricing | Check for Gemini 2.5 series |
| Anthropic | https://docs.anthropic.com/en/docs/about-claude/pricing | Check for Claude Opus 4, Sonnet 4 |
| xAI | https://docs.x.ai/docs#pricing | Check for new Grok models |

## Important Rules

- **Prices must be strings** ("2.50" not 2.50)
- **Use exact model IDs** from provider API
- **Only update models** that exist in the pricing MD files
- **Check supported models**: Verify models exist in provider's models.json
- **Document changes** in provider pricing files

## Validation Checklist

Before updating pricing:
- [ ] Model ID exists in provider's pricing.md documentation
- [ ] Model ID matches exactly from provider API
- [ ] Pricing source is official provider page
- [ ] Prices are formatted as strings
- [ ] Unit is "per_million_tokens"
- [ ] JSON syntax is valid

## Common Issues

1. **Model not found**: Check if model ID spelling is correct
2. **Pricing discrepancies**: Always use official provider pricing pages
3. **JSON validation errors**: Ensure valid JSON format, no trailing commas
4. **File paths**: Use new providers/ directory structure

## Testing After Update

1. Build API: `pnpm build --filter @kdx/api`
2. Run sync from AI Studio UI for each provider
3. Verify pricing displays correctly in the UI

## 📝 Completion Checklist

After executing this script, verify:

- [ ] All 4 providers updated (openai, google, anthropic, xai)
- [ ] Each provider's pricing JSON file updated in their respective folders
- [ ] All prices are strings (e.g., "2.50" not 2.50)
- [ ] All entries have "per_million_tokens" unit
- [ ] JSON files are valid (no syntax errors)
- [ ] All models have current pricing from official sources

## 🔗 Quick File Reference

```
ai-model-sync-adapter/
├── supported-providers.json       # ← Read provider list
└── providers/
    ├── openai/
    │   ├── openai-pricing.md       # ← Read instructions
    │   └── openai-pricing.json     # ← Update pricing
    ├── google/
    │   ├── google-pricing.md       # ← Read instructions  
    │   └── google-pricing.json     # ← Update pricing
    ├── anthropic/
    │   ├── anthropic-pricing.md    # ← Read instructions
    │   └── anthropic-pricing.json  # ← Update pricing
    └── xai/
        ├── xai-pricing.md          # ← Read instructions
        └── xai-pricing.json        # ← Update pricing
```

---
**Execute this script to update all provider pricing**