# OpenAI Pricing Documentation

## Official Pricing Page

[OpenAI API Pricing](https://openai.com/api/pricing/)

## Current Models and Pricing

This document reflects the pricing data in `openai-pricing.json`. Always verify with the official pricing page before making changes.

### O-Series (Reasoning Models)

- **o1 Pro**: $50.00/1M tokens input, $100.00/1M tokens output
- **o1**: $25.00/1M tokens input, $50.00/1M tokens output
- **o1 Preview**: $12.50/1M tokens input, $25.00/1M tokens output
- **o1 Mini**: $1.10/1M tokens input, $4.40/1M tokens output
- **o3 Mini**: $1.10/1M tokens input, $4.40/1M tokens output
- **o4 Mini**: $1.10/1M tokens input, $4.40/1M tokens output

### GPT-4.5 Series

- **GPT-4.5 Preview**: $75.00/1M tokens input, $150.00/1M tokens output

### GPT-4.1 Series

- **GPT-4.1**: $2.00/1M tokens input, $8.00/1M tokens output
- **GPT-4.1 Mini**: $0.50/1M tokens input, $2.00/1M tokens output
- **GPT-4.1 Nano**: $0.20/1M tokens input, $0.80/1M tokens output

### GPT-4o Series

- **GPT-4o**: $5.00/1M tokens input, $15.00/1M tokens output
- **GPT-4o (Aug 2024)**: $2.50/1M tokens input, $10.00/1M tokens output
- **GPT-4o Mini**: $0.15/1M tokens input, $0.60/1M tokens output

### GPT-4 Series

- **GPT-4 Turbo**: $10.00/1M tokens input, $30.00/1M tokens output
- **GPT-4**: $30.00/1M tokens input, $60.00/1M tokens output

### GPT-3.5 Series

- **GPT-3.5 Turbo**: $0.50/1M tokens input, $1.50/1M tokens output

## Updating openai-pricing.json

When asked to update the pricing information, follow these steps:

1. **Visit the official pricing page**: [https://openai.com/api/pricing/](https://openai.com/api/pricing/)

2. **Check the "Language models" section** for the latest pricing information

3. **Update the `openai-pricing.json` file** with the current pricing structure:

```json
[
  {
    "modelId": "model-id",
    "pricing": {
      "input": "price_per_million_tokens",
      "output": "price_per_million_tokens",
      "unit": "per_million_tokens"
    }
  }
]
```

4. **Model ID Format**: Use the exact model ID format from the OpenAI API (e.g., `gpt-4.1-2025-04-14`, `gpt-4o-2024-11-20`, `o3-2025-01-31`)

5. **Pricing Format**:
   - Input/output prices should be strings (e.g., "2.50", "10.00")
   - Unit should always be "per_million_tokens"
   - Prices are in USD per million tokens

## Notes

- Prices are subject to change - always verify with the official pricing page
- The adapter will automatically match models by their `modelId` field
- Models without pricing data in the JSON will still be synced but without pricing information
- Batch API offers 50% discount on standard pricing
- Fine-tuning and embedding models have different pricing structures (not covered in this adapter)
- Real-time API and audio models have separate pricing tiers
- GPT-4.1 series features 1M token context window and improved coding capabilities
- o3 and o1 series are specialized reasoning models with higher costs but superior performance on complex tasks
