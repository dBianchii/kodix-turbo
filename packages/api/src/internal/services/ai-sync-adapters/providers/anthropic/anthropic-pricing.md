# Anthropic Pricing Documentation

## Official Pricing Page

[Anthropic Claude Pricing](https://docs.anthropic.com/en/docs/about-claude/pricing)

## Current Models and Pricing

This document reflects the pricing data in `anthropic-pricing.json`. Always verify with the official pricing page before making changes.

> **⚠️ Important**: Prices shown below reflect the current JSON configuration, not necessarily the latest Anthropic pricing. Always check the official pricing page for updates.

### Claude 4 Series

- **Claude Opus 4** (`claude-opus-4-20250514`): $15.00/1M tokens input, $75.00/1M tokens output ✅
- **Claude Sonnet 4** (`claude-sonnet-4-20250514`): $3.00/1M tokens input, $15.00/1M tokens output ✅

### Claude 3.7 Series

- **Claude 3.7 Sonnet** (`claude-3-7-sonnet-20250219`): *No pricing configured*

### Claude 3.5 Series

- **Claude 3.5 Sonnet (Oct 2024)** (`claude-3-5-sonnet-20241022`): *No pricing configured*
- **Claude 3.5 Sonnet (June 2024)** (`claude-3-5-sonnet-20240620`): *No pricing configured*
- **Claude 3.5 Haiku** (`claude-3-5-haiku-20241022`): $0.25/1M tokens input, $1.25/1M tokens output ✅

### Claude 3 Series

- **Claude 3 Opus** (`claude-3-opus-20240229`): *No pricing configured*
- **Claude 3 Haiku** (`claude-3-haiku-20240307`): *No pricing configured*

## Missing Pricing Configuration

The following models are available in the API but **missing pricing configuration**:
- `claude-3-7-sonnet-20250219` (newest 3.7 series)
- `claude-3-5-sonnet-20241022` (October 2024 Sonnet)
- `claude-3-5-sonnet-20240620` (June 2024 Sonnet)
- `claude-3-opus-20240229` (Claude 3 Opus)
- `claude-3-haiku-20240307` (Claude 3 Haiku)

## Updating anthropic-pricing.json

Need to add pricing for **5 missing models** out of 8 total available models.

### 1. Verify Official Pricing
- **Visit**: [https://docs.anthropic.com/en/docs/about-claude/pricing](https://docs.anthropic.com/en/docs/about-claude/pricing)
- **Check**: "Model pricing" table for current pricing
- **Note**: Model names in docs vs API IDs may differ

### 2. JSON Structure
The `anthropic-pricing.json` file follows this format:

```json
[
  {
    "modelId": "exact-anthropic-model-id",
    "pricing": {
      "input": "price_per_million_tokens",
      "output": "price_per_million_tokens",
      "unit": "per_million_tokens"
    }
  }
]
```

### 3. Expected Missing Entries
Based on official Anthropic pricing (verify before using):

```json
[
  {
    "modelId": "claude-3-7-sonnet-20250219",
    "pricing": {
      "input": "3.00",
      "output": "15.00",
      "unit": "per_million_tokens"
    }
  },
  {
    "modelId": "claude-3-5-sonnet-20241022",
    "pricing": {
      "input": "3.00",
      "output": "15.00", 
      "unit": "per_million_tokens"
    }
  },
  {
    "modelId": "claude-3-5-sonnet-20240620",
    "pricing": {
      "input": "3.00",
      "output": "15.00",
      "unit": "per_million_tokens"
    }
  },
  {
    "modelId": "claude-3-opus-20240229",
    "pricing": {
      "input": "15.00",
      "output": "75.00",
      "unit": "per_million_tokens"
    }
  },
  {
    "modelId": "claude-3-haiku-20240307",
    "pricing": {
      "input": "0.25",
      "output": "1.25",
      "unit": "per_million_tokens"
    }
  }
]
```

### 4. Model ID Conventions
- **Date format**: YYYYMMDD (e.g., `20250514`, `20241022`)
- **Series naming**: `claude-{version}-{tier}-{date}`
- **Exact match required**: Use API response model IDs exactly

### 5. Anthropic-Specific Guidelines
- **Model tiers**: Opus (premium) > Sonnet (balanced) > Haiku (fast)
- **Consistent pricing**: Same tier usually has same pricing across dates
- **Batch discounts**: 50% off for batch API usage
- **Context pricing**: Same rate regardless of context length

### 6. Priority Order for Adding
**High Priority** (production stable):
1. `claude-3-5-sonnet-20241022` (latest Sonnet 3.5)
2. `claude-3-opus-20240229` (high-end model)
3. `claude-3-haiku-20240307` (cost-effective)

**Medium Priority**:
4. `claude-3-5-sonnet-20240620` (earlier Sonnet 3.5)
5. `claude-3-7-sonnet-20250219` (newest series)

## Model Categories & Pricing Patterns

### Claude 4 Series (Latest) ✅ Configured
- **Opus 4**: Premium reasoning model ($15/$75)
- **Sonnet 4**: Balanced performance ($3/$15)

### Claude 3.x Series (Production)
- **3.7 Sonnet**: Newest iteration, likely $3/$15
- **3.5 Sonnet**: Popular production model, typically $3/$15
- **3.5 Haiku**: Fast, cost-effective, typically $0.25/$1.25

### Claude 3 Series (Stable)
- **Opus**: Premium model, typically $15/$75
- **Haiku**: Entry-level, typically $0.25/$1.25

### Pricing Patterns
- **Opus tier**: $15 input, $75 output (5x multiplier)
- **Sonnet tier**: $3 input, $15 output (5x multiplier)
- **Haiku tier**: $0.25 input, $1.25 output (5x multiplier)

## Troubleshooting

### Common Issues
1. **Model ID mismatch**: Ensure exact API model ID format
2. **Date formats**: Use YYYYMMDD format consistently
3. **Pricing tiers**: Verify tier pricing patterns are consistent
4. **Missing quotes**: All prices must be strings, not numbers

### Quick Commands
```bash
# Validate JSON syntax
jq . anthropic-pricing.json

# Check current models from API
pnpm run --filter @kdx/api models-sync

# Compare with official pricing
# Visit: https://docs.anthropic.com/en/docs/about-claude/pricing
```

## Important Notes

- **Version stability**: Anthropic maintains stable model versions with date stamps
- **Pricing consistency**: Same tier models typically have identical pricing
- **Batch API**: 50% discount available for batch processing
- **Context windows**: All models support large context windows (200K+ tokens)
- **Multimodal**: Many models support text and image inputs
- **Rate limits**: Different models have different rate limits and quotas
