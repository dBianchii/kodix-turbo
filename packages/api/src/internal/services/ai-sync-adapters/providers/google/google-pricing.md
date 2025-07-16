# Google AI Pricing Documentation

## Official Pricing Page

[Google AI Studio Pricing](https://ai.google.dev/pricing)

## Current Models and Pricing

This document reflects the pricing data in `google-pricing.json`. Always verify with the official pricing page before making changes.

> **⚠️ Important**: Prices shown below reflect the current JSON configuration, not necessarily the latest Google AI pricing. Always check the official pricing page for updates.

### Gemini 2.5 Series (Latest)

- **Gemini 2.5 Pro** (`gemini-2.5-pro`, preview versions): *No pricing configured*
- **Gemini 2.5 Flash** (`gemini-2.5-flash`, preview versions): *No pricing configured*
- **Gemini 2.5 Flash-Lite** (preview versions): *No pricing configured*

### Gemini 2.0 Series

- **Gemini 2.0 Flash** (`gemini-2.0-flash`, `gemini-2.0-flash-exp`): *No pricing configured*
- **Gemini 2.0 Flash-Lite** (`gemini-2.0-flash-lite`, preview versions): *No pricing configured*
- **Gemini 2.0 Pro** (`gemini-2.0-pro-exp`, `gemini-2.0-pro-exp-02-05`): *No pricing configured*

### Gemini 1.5 Series

- **Gemini 1.5 Pro** (`gemini-1.5-pro`, `gemini-1.5-pro-latest`): *No pricing configured*
- **Gemini 1.5 Flash** (`gemini-1.5-flash`, `gemini-1.5-flash-latest`): *No pricing configured*
- **Gemini 1.5 Flash-8B** (`gemini-1.5-flash-8b`, `gemini-1.5-flash-8b-latest`): *No pricing configured*

### Experimental Models

- **Gemini Exp** (`gemini-exp-1206`): *No pricing configured*

## Missing Pricing Configuration

**All Google models are currently missing pricing configuration** in `google-pricing.json`. The file appears to be empty or incomplete.

**Available API Models Needing Pricing**:
- `gemini-1.5-pro` and `gemini-1.5-pro-latest`
- `gemini-1.5-flash` and `gemini-1.5-flash-latest`  
- `gemini-1.5-flash-8b` and `gemini-1.5-flash-8b-latest`
- `gemini-2.5-pro` and preview versions
- `gemini-2.5-flash` and preview versions
- `gemini-2.0-flash` series
- `gemini-2.0-pro-exp` series
- Experimental models

## Updating google-pricing.json

Currently **empty** - needs complete pricing configuration for all models.

### 1. Verify Official Pricing
- **Visit**: [https://ai.google.dev/pricing](https://ai.google.dev/pricing)
- **Check**: "Gemini API" section for current pricing
- **Note**: Preview models may have different or no pricing

### 2. JSON Structure Required
The `google-pricing.json` file should follow this format:

```json
[
  {
    "modelId": "exact-gemini-model-id",
    "pricing": {
      "input": "price_per_million_tokens",
      "output": "price_per_million_tokens",
      "unit": "per_million_tokens"
    }
  }
]
```

### 3. Expected Pricing Examples
Based on official Google AI pricing (verify before using):

```json
[
  {
    "modelId": "gemini-1.5-pro",
    "pricing": {
      "input": "1.25",
      "output": "5.00",
      "unit": "per_million_tokens"
    }
  },
  {
    "modelId": "gemini-1.5-flash",
    "pricing": {
      "input": "0.075",
      "output": "0.30",
      "unit": "per_million_tokens"
    }
  },
  {
    "modelId": "gemini-1.5-flash-8b",
    "pricing": {
      "input": "0.0375",
      "output": "0.15",
      "unit": "per_million_tokens"
    }
  }
]
```

### 4. Model ID Guidelines
- **Use exact API IDs**: Match the model IDs from the actual API response
- **Include latest variants**: Both `gemini-1.5-pro` and `gemini-1.5-pro-latest`
- **Handle previews**: May have separate pricing or no pricing
- **Version dates**: Include specific version dates when available

### 5. Google-Specific Considerations
- **Preview models**: Often free or have special pricing
- **Experimental models**: May not have public pricing
- **Multimodal pricing**: Text-only vs image/video may differ
- **Context length**: Pricing may vary by context window size

### 6. Required Models to Configure
**High Priority** (stable models):
- `gemini-1.5-pro` and `gemini-1.5-pro-latest`
- `gemini-1.5-flash` and `gemini-1.5-flash-latest`
- `gemini-1.5-flash-8b` and `gemini-1.5-flash-8b-latest`

**Medium Priority** (newer stable):
- `gemini-2.0-flash`
- `gemini-2.5-pro` (if stable)
- `gemini-2.5-flash` (if stable)

**Low Priority** (experimental):
- Preview and experimental models
- Version-specific models

## Model Categories & Pricing Tiers

### Production Models (Stable Pricing)
- **Gemini 1.5 Pro**: Premium model for complex tasks
- **Gemini 1.5 Flash**: Balanced performance and cost
- **Gemini 1.5 Flash-8B**: Cost-optimized smaller model

### Preview Models (Variable Pricing)
- **Gemini 2.5 series**: Latest models, pricing may change
- **Gemini 2.0 series**: Newer architecture
- **Experimental**: Often free during preview period

### Pricing Characteristics
- **Free tier**: Many models have generous free quotas
- **Pay-per-use**: No subscription required
- **Batch processing**: May have different rates
- **Regional differences**: Pricing may vary by region

## Troubleshooting

### Common Issues
1. **Empty file**: Create initial JSON array structure
2. **Preview pricing**: Check if preview models have published pricing
3. **Model ID format**: Ensure exact match with API response
4. **Free tier confusion**: Distinguish between free quota and paid pricing

### Quick Commands
```bash
# Validate JSON syntax
jq . google-pricing.json

# Check current models from API
pnpm run --filter @kdx/api models-sync

# Compare with official pricing
# Visit: https://ai.google.dev/pricing
```

## Important Notes

- **Rapid model evolution**: Google frequently releases new Gemini versions
- **Preview periods**: New models often start as free previews
- **Multimodal capabilities**: Most models support text, image, audio, video
- **Context windows**: Many models support 1M+ token contexts
- **Regional availability**: Some models may not be available in all regions
