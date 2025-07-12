# Anthropic Pricing Documentation

## Official Pricing Page

[Anthropic Claude Pricing](https://docs.anthropic.com/en/docs/about-claude/pricing)

## Current Models and Pricing

Based on the official Anthropic pricing page, the following models are available:

### Claude 4 Series

- **Claude Opus 4**: $15/MTok input, $75/MTok output
- **Claude Sonnet 4**: $3/MTok input, $15/MTok output

### Claude 3.5 Series

- **Claude Sonnet 3.5 (June 2024)**: $3/MTok input, $15/MTok output
- **Claude Sonnet 3.5 (October 2024)**: $3/MTok input, $15/MTok output
- **Claude Haiku 3.5**: $0.80/MTok input, $4/MTok output

### Claude 3 Series

- **Claude Opus 3**: $15/MTok input, $75/MTok output
- **Claude Haiku 3**: $0.25/MTok input, $1.25/MTok output

## Updating anthropic-pricing.json

When asked to update the pricing information, follow these steps:

1. **Visit the official pricing page**: [https://docs.anthropic.com/en/docs/about-claude/pricing](https://docs.anthropic.com/en/docs/about-claude/pricing)

2. **Check the "Model pricing" table** for the latest pricing information

3. **Update the `anthropic-pricing.json` file** with the current pricing structure:

```json
[
  {
    "modelId": "claude-model-id",
    "pricing": {
      "input": "price_per_million_tokens",
      "output": "price_per_million_tokens",
      "unit": "per_million_tokens"
    }
  }
]
```

4. **Model ID Format**: Use the exact model ID format from the Anthropic API (e.g., `claude-3-haiku-20240307`, `claude-3-5-sonnet-20240620`)

5. **Pricing Format**:

   - Input/output prices should be strings (e.g., "0.25", "15.00")
   - Unit should always be "per_million_tokens"
   - Prices are in USD per million tokens

6. **Model ID examples**:
   - `claude-opus-4-20250514`
   - `claude-sonnet-4-20250514`
   - `claude-3-7-sonnet-20250219`
   - `claude-3-opus-20240229`
   - `claude-3-haiku-20240307`
   - `claude-3-5-sonnet-20240620`
   - `claude-3-5-sonnet-20241022`
   - `claude-3-5-haiku-20241022`

## Notes

- MTok = Million tokens
- Prices are subject to change - always verify with the official pricing page
- The adapter will automatically match models by their `modelId` field
- Models without pricing data in the JSON will still be synced but without pricing information
- Batch processing offers 50% discount on standard pricing
