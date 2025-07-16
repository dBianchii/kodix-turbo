# OpenAI Pricing Documentation

## Official Pricing Page

[OpenAI API Pricing](https://openai.com/api/pricing/)

## Current Models and Pricing

This document reflects the pricing data in `openai-pricing.json`. Always verify with the official pricing page before making changes.

> **⚠️ Important**: Prices shown below reflect the current JSON configuration, not necessarily the latest OpenAI pricing. Always check the official pricing page for updates.

### O-Series (Reasoning Models)

#### O1 Series
- **o1 Pro** (`o1-pro`, `o1-pro-2025-03-19`): $15.00/1M tokens input, $60.00/1M tokens output
- **o1** (`o1`, `o1-2024-12-17`): $15.00/1M tokens input, $60.00/1M tokens output
- **o1 Preview** (`o1-preview`): *No pricing configured*
- **o1 Mini** (`o1-mini`): $3.00/1M tokens input, $12.00/1M tokens output

#### O3 Series
- **o3 Mini** (`o3-mini`, `o3-mini-2025-01-31`): $3.00/1M tokens input, $12.00/1M tokens output

#### O4 Series
- **o4 Mini** (`o4-mini`, `o4-mini-2025-04-16`): $3.00/1M tokens input, $12.00/1M tokens output
- **o4 Mini Deep Research** (`o4-mini-deep-research`, `o4-mini-deep-research-2025-06-26`): *No pricing configured*

### GPT-4.1 Series

- **GPT-4.1** (`gpt-4.1`, `gpt-4.1-2025-04-14`): $10.00/1M tokens input, $30.00/1M tokens output
- **GPT-4.1 Mini** (`gpt-4.1-mini`, `gpt-4.1-mini-2025-04-14`): $0.15/1M tokens input, $0.60/1M tokens output
- **GPT-4.1 Nano** (`gpt-4.1-nano`, `gpt-4.1-nano-2025-04-14`): $0.15/1M tokens input, $0.60/1M tokens output

### GPT-4o Series

- **GPT-4o** (`gpt-4o`, `gpt-4o-2024-11-20`): $2.50/1M tokens input, $10.00/1M tokens output
- **GPT-4o (Aug 2024)** (`gpt-4o-2024-08-06`): *No pricing configured*
- **GPT-4o Mini** (`gpt-4o-mini`, `gpt-4o-mini-2024-07-18`): *No pricing configured*
- **ChatGPT-4o Latest** (`chatgpt-4o-latest`): $2.50/1M tokens input, $10.00/1M tokens output

### GPT-4 Series

- **GPT-4 Turbo** (`gpt-4-turbo`): $10.00/1M tokens input, $30.00/1M tokens output
- **GPT-4** (`gpt-4`): $30.00/1M tokens input, $60.00/1M tokens output

### GPT-3.5 Series

- **GPT-3.5 Turbo** (`gpt-3.5-turbo`, `gpt-3.5-turbo-0125`): $0.50/1M tokens input, $1.50/1M tokens output
- **GPT-3.5 Turbo Instruct** (`gpt-3.5-turbo-instruct`): $0.50/1M tokens input, $1.50/1M tokens output

## Missing Pricing Configuration

The following models are available in the API but **missing pricing configuration**:
- `o1-preview`
- `gpt-4o-2024-08-06`
- `gpt-4o-mini` and `gpt-4o-mini-2024-07-18`
- `o4-mini-deep-research` series

## Updating openai-pricing.json

When asked to update the pricing information, follow these steps:

### 1. Verify Official Pricing
- **Visit**: [https://openai.com/api/pricing/](https://openai.com/api/pricing/)
- **Check**: "Language models" section for latest pricing
- **Compare**: Current JSON prices vs official website

### 2. Update JSON Structure
The `openai-pricing.json` file should follow this exact format:

```json
[
  {
    "modelId": "exact-api-model-id",
    "pricing": {
      "input": "price_per_million_tokens",
      "output": "price_per_million_tokens",
      "unit": "per_million_tokens"
    }
  }
]
```

### 3. Real Examples
Here are examples of properly formatted entries:

```json
[
  {
    "modelId": "gpt-4o",
    "pricing": {
      "input": "2.50",
      "output": "10.00",
      "unit": "per_million_tokens"
    }
  },
  {
    "modelId": "o1-mini",
    "pricing": {
      "input": "3.00",
      "output": "12.00",
      "unit": "per_million_tokens"
    }
  }
]
```

### 4. Model ID Requirements
- **Use exact API model IDs**: `gpt-4o`, `o1-pro`, `gpt-4.1-mini-2025-04-14`
- **Include version-specific IDs** when available: `gpt-4o-2024-11-20`, `o3-mini-2025-01-31`
- **Check current available models** by running the models-sync script

### 5. Pricing Format Rules
- **Prices**: Always strings, not numbers (`"2.50"` not `2.50`)
- **Decimals**: Use 2 decimal places (`"10.00"` not `"10"`)
- **Unit**: Always `"per_million_tokens"`
- **Currency**: USD per million tokens

### 6. Validation
After updating, verify:
- JSON is valid (use `jq . openai-pricing.json`)
- Model IDs match actual API response
- Prices match official OpenAI pricing page
- No syntax errors

## Model Categories & Notes

### Reasoning Models (O-Series)
- **Higher cost**: Specialized for complex reasoning tasks
- **Variable pricing**: Different tiers (o1, o3, o4) with different capabilities
- **Latest models**: May not have pricing immediately available

### Standard Models (GPT Series)
- **Stable pricing**: Well-established pricing structure
- **Multiple versions**: Often have dated versions with different prices
- **Batch discounts**: 50% off standard pricing for batch API

### Legacy Models
- **GPT-3.5**: Lower cost, maintained for compatibility
- **Older GPT-4**: Higher cost but stable pricing

## Important Notes

- **Pricing volatility**: Reasoning models (o-series) may have frequent price changes
- **Missing pricing**: New models may not have pricing immediately available
- **Batch API**: Offers 50% discount on standard pricing
- **Specialized APIs**: Real-time, audio, and fine-tuning have separate pricing
- **Regional differences**: Prices may vary by region
- **Usage tiers**: Some models have different pricing for different usage levels

## Troubleshooting

### Common Issues
1. **Invalid JSON**: Use `jq` to validate syntax
2. **Model ID mismatch**: Check current available models with models-sync
3. **Pricing discrepancies**: Always verify with official pricing page
4. **Missing models**: Add entries for models that appear in API but lack pricing

### Quick Commands
```bash
# Validate JSON syntax
jq . openai-pricing.json

# Check current models from API
pnpm run --filter @kdx/api models-sync

# Compare with official pricing
# Visit: https://openai.com/api/pricing/
```
