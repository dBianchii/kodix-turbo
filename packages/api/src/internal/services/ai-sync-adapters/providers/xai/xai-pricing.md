# xAI Pricing Documentation

## Official Pricing Page

[xAI API Pricing](https://x.ai/api)

## Current Models and Pricing

This document reflects the pricing data in `xai-pricing.json`. Always verify with the official pricing page before making changes.

> **⚠️ Important**: Prices shown below reflect the current JSON configuration, not necessarily the latest xAI pricing. Always check the official pricing page for updates.

### Grok 4 Series (Latest)

- **Grok 4 (0709)** (`grok-4-0709`): $10.00/1M tokens input, $30.00/1M tokens output ✅
- **Grok 4 (Base)** (`grok-4` - *configured but not in API response*): $10.00/1M tokens input, $30.00/1M tokens output ⚠️

### Grok 3 Series

- **Grok 3** (`grok-3`): $2.50/1M tokens input, $10.00/1M tokens output ✅
- **Grok 3 Fast** (`grok-3-fast`): *No pricing configured*
- **Grok 3 Mini** (`grok-3-mini`): *No pricing configured*
- **Grok 3 Mini Fast** (`grok-3-mini-fast`): *No pricing configured*

### Grok 2 Series

- **Grok 2** (`grok-2` - *configured but not in API response*): $5.00/1M tokens input, $15.00/1M tokens output ⚠️
- **Grok 2 (1212)** (`grok-2-1212`): *No pricing configured*

### Beta Models

- **Grok Beta** (`grok-beta` - *configured but not in API response*): $5.00/1M tokens input, $15.00/1M tokens output ⚠️

## Pricing Configuration Issues

### Models with Pricing but Not in API
- `grok-4` (base version)
- `grok-2` (base version)
- `grok-beta`

### Models in API but Missing Pricing
- `grok-3-fast`
- `grok-3-mini`
- `grok-3-mini-fast`
- `grok-2-1212`

> **Note**: Current configuration may be based on expected models rather than actual API availability. Consider updating based on actual API response.

## Updating xai-pricing.json

**Issue**: Mismatch between configured models and actual API response. Need to align pricing with available models.

### 1. Verify Official Pricing
- **Visit**: [https://x.ai/api](https://x.ai/api) or [https://console.x.ai/](https://console.x.ai/)
- **Check**: API documentation for current model pricing
- **Note**: xAI pricing may differ from other providers due to unique features

### 2. JSON Structure
The `xai-pricing.json` file follows this format:

```json
[
  {
    "modelId": "exact-grok-model-id",
    "pricing": {
      "input": "price_per_million_tokens",
      "output": "price_per_million_tokens",
      "unit": "per_million_tokens"
    }
  }
]
```

### 3. Recommended Updates
Based on actual API models (verify pricing before using):

```json
[
  {
    "modelId": "grok-4-0709",
    "pricing": {
      "input": "10.00",
      "output": "30.00",
      "unit": "per_million_tokens"
    }
  },
  {
    "modelId": "grok-3",
    "pricing": {
      "input": "2.50",
      "output": "10.00",
      "unit": "per_million_tokens"
    }
  },
  {
    "modelId": "grok-3-fast",
    "pricing": {
      "input": "1.00",
      "output": "5.00",
      "unit": "per_million_tokens"
    }
  },
  {
    "modelId": "grok-3-mini",
    "pricing": {
      "input": "0.50",
      "output": "2.50",
      "unit": "per_million_tokens"
    }
  },
  {
    "modelId": "grok-3-mini-fast",
    "pricing": {
      "input": "0.25",
      "output": "1.25",
      "unit": "per_million_tokens"
    }
  },
  {
    "modelId": "grok-2-1212",
    "pricing": {
      "input": "5.00",
      "output": "15.00",
      "unit": "per_million_tokens"
    }
  }
]
```

### 4. Cleanup Recommended
**Remove entries for models not in API**:
- `grok-4` (base version)
- `grok-2` (base version)
- `grok-beta`

### 5. xAI-Specific Considerations
- **Model variants**: Fast versions typically cost less
- **Mini models**: Smaller, faster, cheaper variants
- **Version dating**: Models may have specific version dates
- **Beta pricing**: May be free or heavily discounted during preview

### 6. Priority Order for Updates
**High Priority** (available in API):
1. `grok-4-0709` (latest flagship) ✅ Already configured
2. `grok-3` (balanced performance) ✅ Already configured
3. `grok-3-fast` (speed optimized)
4. `grok-3-mini` (cost optimized)

**Medium Priority**:
5. `grok-3-mini-fast` (fastest, cheapest)
6. `grok-2-1212` (legacy but still available)

## Model Categories & Expected Pricing

### Flagship Models
- **Grok 4 series**: Premium pricing, latest capabilities
- **Grok 3 series**: Production-ready, competitive pricing

### Optimization Variants
- **Fast models**: Optimized for speed, potentially lower pricing
- **Mini models**: Smaller, more cost-effective versions
- **Mini-fast**: Combination of small size and speed optimization

### Pricing Patterns (Estimated)
- **Flagship**: $10+ input, $30+ output
- **Standard**: $2-5 input, $10-15 output
- **Fast variants**: 50-75% of standard pricing
- **Mini variants**: 25-50% of standard pricing

## Troubleshooting

### Common Issues
1. **Model availability**: API models may differ from documentation
2. **Credits required**: Account needs credits to access models
3. **Pricing uncertainty**: New platform with evolving pricing
4. **Version confusion**: Multiple variants (fast, mini, dated) per model

### Access Issues
- **No credits**: Purchase credits at https://console.x.ai/
- **API key**: Ensure valid API key from console.x.ai
- **Rate limits**: Check subscription tier limits

### Quick Commands
```bash
# Validate JSON syntax
jq . xai-pricing.json

# Check current models from API
pnpm run --filter @kdx/api models-sync

# Compare with official pricing
# Visit: https://x.ai/api or https://console.x.ai/
```

## Important Notes

- **Platform evolution**: xAI is rapidly evolving with frequent model updates
- **Credit system**: Requires credits purchase for API access
- **Real-time features**: Unique capabilities may affect pricing
- **X integration**: Special features tied to X/Twitter platform
- **Beta nature**: Pricing and availability subject to change
- **Regional access**: May have geographic restrictions

## xAI-Specific Features

- **Real-time data**: Access to current X/Twitter data and trends
- **Humor/personality**: More conversational and witty responses  
- **Less restrictive**: More open content policies than some competitors
- **X platform integration**: Seamless integration with X features
- **Live search**: Real-time web search capabilities (additional costs may apply)