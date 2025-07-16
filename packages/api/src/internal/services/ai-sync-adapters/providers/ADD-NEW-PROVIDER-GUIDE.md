# Adding New AI Provider - Complete Guide

This guide provides step-by-step instructions for adding a new AI provider to the Kodix AI sync adapters system.

## 📋 Overview

Adding a new provider involves:
1. Configuring API key in root `.env` file
2. Creating provider folder structure in the new `providers/` directory
3. Implementing the adapter class
4. Creating comprehensive pricing documentation
5. Updating the sync script
6. Updating configuration files  
7. Testing the integration

## 🚀 Step-by-Step Process

### Step 1: Configure Environment Variables

Before creating any files, add your provider's API key to the root `.env` file:

```bash
# In the root .env file
[PROVIDER_NAME]_API_KEY=your_api_key_here
```

**Examples of existing providers**:
```bash
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...
XAI_API_KEY=xai-...
```

**Naming Convention**: 
- Always use `[PROVIDER_NAME]_API_KEY` format
- Provider name should be UPPERCASE
- Use underscores for multi-word providers (e.g., `MISTRAL_AI_API_KEY`)

> ⚠️ **Important**: Never commit API keys to version control. Ensure `.env` is in `.gitignore`.

### Step 2: Create Provider Folder Structure

Create a new folder for your provider in the **providers directory**:

```bash
mkdir packages/api/src/internal/services/ai-sync-adapters/providers/[provider-name]
```

**Example**: For a new provider like Cohere
```bash
mkdir packages/api/src/internal/services/ai-sync-adapters/providers/cohere
```

### Step 3: Create Required Files

Each provider folder needs these files:

```
providers/[provider-name]/
├── [provider-name]-adapter.ts      # ✅ Required: API adapter implementation
├── [provider-name]-pricing.json    # ✅ Required: Pricing data (manually configured)
├── [provider-name]-pricing.md      # ✅ Required: Comprehensive pricing documentation
├── [provider-name]-models.json     # 🔄 Auto-generated: Model specifications
└── [provider-name]-models-summary.json # 🔄 Auto-generated: Model IDs only
```

**Legend:**
- ✅ **Required**: Must be created manually
- 🔄 **Auto-generated**: Created by sync script

> **⚠️ Important**: The pricing JSON file is now manually configured based on official provider pricing, not auto-generated with defaults.

### Step 4: Implement the Adapter Class

Create `[provider-name]-adapter.ts` following this template:

```typescript
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import type { NormalizedModel } from "../../../ai-model-sync.service";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface [ProviderName]Model {
  id: string;
  object: string;
  created?: number;
  owned_by?: string;
  active?: boolean;
  // Add provider-specific fields
}

export interface [ProviderName]ModelsResponse {
  object: string;
  data: [ProviderName]Model[];
}

interface PricingData {
  modelId: string;
  pricing: {
    input: string;
    output: string;
    unit: "per_million_tokens";
  };
}

export class [ProviderName]Adapter {
  private readonly apiKey: string;
  private readonly apiUrl = "[PROVIDER_API_ENDPOINT]";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetchModels(): Promise<NormalizedModel[]> {
    try {
      // 1. Call provider's models API
      const response = await fetch(this.apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `[ProviderName] API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as [ProviderName]ModelsResponse;

      // 2. Load/create pricing data
      const pricingPath = join(__dirname, "[provider-name]-pricing.json");
      let pricingData: PricingData[] = [];
      
      if (!existsSync(pricingPath)) {
        console.warn("⚠️  [ProviderName] pricing file not found. Please create it manually based on official pricing.");
        console.warn("📖 Check the [provider-name]-pricing.md documentation for pricing information.");
        return [];
      } else {
        pricingData = JSON.parse(
          readFileSync(pricingPath, "utf-8"),
        ) as PricingData[];
      }

      // 3. Filter to LLM models only
      const llmModels = data.data.filter((model) => this.isLLMModel(model.id));

      // 4. Normalize models
      const pricingMap = new Map(
        pricingData.map((p) => [p.modelId, p.pricing]),
      );

      const normalizedModels: NormalizedModel[] = llmModels.map((model) => {
        const pricing = pricingMap.get(model.id);
        const displayName = this.getDisplayName(model.id);
        const status = model.active === false ? "archived" : "active";

        return {
          modelId: model.id,
          name: displayName,
          displayName,
          pricing,
          maxTokens: this.getMaxTokensForModel(model.id),
          status: status,
        };
      });

      return normalizedModels;
    } catch (error) {
      console.error("[[ProviderName]Adapter] Error fetching models:", error);
      throw error;
    }
  }

  private isLLMModel(modelId: string): boolean {
    const id = modelId.toLowerCase();
    
    // Add provider-specific filtering logic
    // Example: Exclude non-LLM models
    if (id.includes("embedding")) return false;
    if (id.includes("image")) return false;
    if (id.includes("audio")) return false;
    
    return true;
  }

  private getDisplayName(modelId: string): string {
    // Add provider-specific naming logic
    return modelId
      .split(/[-_.]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  private getMaxTokensForModel(modelId: string): number | undefined {
    // Add known token limits for provider models
    const tokenLimits: Record<string, number> = {
      "model-name": 128000,
      // Add more models...
    };

    return tokenLimits[modelId];
  }

}
```

### Step 5: Create Comprehensive Pricing Documentation

Create `[provider-name]-pricing.md` with comprehensive documentation:

```markdown
# [Provider Name] Pricing Documentation

> **📋 Purpose**: This document serves as the authoritative source for [Provider Name] model pricing information and provides clear instructions for updating the pricing JSON file.

## 🔗 Official Pricing Resources

- **Primary Pricing Page**: [Provider Official Pricing]([PROVIDER_PRICING_URL])
- **API Documentation**: [Provider API Docs]([PROVIDER_API_URL])
- **Model Specifications**: [Provider Models]([PROVIDER_MODELS_URL])

## 💰 Current Models and Pricing

*Last Updated: [DATE]*

Based on the official [Provider] pricing page as of [DATE], the following models are available:

### 🚀 [Model Family 1] (Production Models)

| Model ID | Input Price | Output Price | Context Window | Notes |
|----------|-------------|--------------|----------------|-------|
| `model-name-1` | $X.XX/1M tokens | $X.XX/1M tokens | XXXk tokens | Production ready |
| `model-name-2` | $X.XX/1M tokens | $X.XX/1M tokens | XXXk tokens | Latest version |

### 🧪 [Model Family 2] (Preview/Beta Models)

| Model ID | Input Price | Output Price | Context Window | Notes |
|----------|-------------|--------------|----------------|-------|
| `preview-model` | $X.XX/1M tokens | $X.XX/1M tokens | XXXk tokens | Preview pricing |

## 🔄 Updating [provider-name]-pricing.json

**When to update**: Update pricing when new models are released or existing pricing changes.

### Step-by-Step Update Process

1. **📖 Check official sources**:
   - Visit [Provider Pricing]([PROVIDER_PRICING_URL])
   - Review [Provider Blog/Announcements] for new models
   - Check API documentation for model availability

2. **🔍 Identify changes**:
   - New models released
   - Price changes for existing models
   - Model status changes (active → deprecated)

3. **✏️ Update the JSON file** (`[provider-name]-pricing.json`):
   ```json
   [
     {
       "modelId": "exact-model-id-from-api",
       "pricing": {
         "input": "X.XX",
         "output": "X.XX",
         "unit": "per_million_tokens"
       }
     }
   ]
   ```

4. **✅ Validation checklist**:
   - [ ] Model IDs exactly match [Provider] API responses
   - [ ] Pricing values are strings (not numbers)
   - [ ] Unit is "per_million_tokens" for all entries
   - [ ] Focused on LLM/text generation models only
   - [ ] No embedding, image, or audio models included

5. **📝 Update this documentation**:
   - Update the pricing tables above
   - Update the "Last Updated" date
   - Add notes about changes in "Recent Updates" section

### 🎯 Model ID Guidelines

**✅ Include these models**:
- Text generation models (e.g., `gpt-4`, `claude-3`, `gemini-pro`)
- Chat/instruction models
- Reasoning models (e.g., `o1-preview`)

**❌ Exclude these models**:
- Embedding models (contain "embedding" in name)
- Image generation models
- Audio/speech models
- Deprecated models (unless specifically needed)

### 📊 Expected Format

```json
[
  {
    "modelId": "provider-model-large",
    "pricing": {
      "input": "5.00",
      "output": "15.00",
      "unit": "per_million_tokens"
    }
  },
  {
    "modelId": "provider-model-small",
    "pricing": {
      "input": "0.50",
      "output": "1.50",
      "unit": "per_million_tokens"
    }
  }
]
```

## 📈 Pricing Analysis

### Model Categories

- **Flagship Models**: Highest capability, premium pricing
- **Standard Models**: Balanced performance and cost
- **Efficient Models**: Optimized for speed and cost
- **Preview Models**: Latest features, experimental pricing

### Pricing Trends

- Input tokens typically cost 3-5x less than output tokens
- Larger models have higher per-token costs
- Preview models may have temporary pricing

## 🔧 Provider-Specific Features

### Context Windows
- [Model Family 1]: Up to XXXk tokens
- [Model Family 2]: Up to XXXk tokens

### Capabilities
- Function calling: [List supported models]
- Vision: [List vision-capable models]
- Code generation: [List code-optimized models]

## 📅 Recent Updates

### [DATE] - Latest Update
- Added new model: `new-model-name`
- Updated pricing for: `existing-model`
- Deprecated: `old-model-name`

### [PREVIOUS_DATE] - Previous Update
- Initial pricing documentation created
- Established update process

## 🆘 Troubleshooting

### Common Issues

1. **Model not found in API**:
   - Check if model ID spelling is correct
   - Verify model is available in your region
   - Check if model requires special access

2. **Pricing discrepancies**:
   - Compare with official pricing page
   - Check for regional pricing differences
   - Verify currency (USD vs local currency)

3. **JSON validation errors**:
   - Ensure valid JSON format
   - Check for trailing commas
   - Verify string quotes are correct

### Support Resources

- [Provider Support]([PROVIDER_SUPPORT_URL])
- [Provider Community]([PROVIDER_COMMUNITY_URL])
- [Provider Status Page]([PROVIDER_STATUS_URL])

---

**📝 Documentation Standards**: This follows the Kodix pricing documentation template v2.0
**🔄 Update Frequency**: Monthly or when new models are released
**👥 Maintainers**: AI Platform Team
```

### Step 6: Update Sync Script

Modify `packages/api/src/internal/services/ai-sync-adapters/update/models-sync-provider.dev.ts`:

#### 5.1: Add Import

```typescript
import { [ProviderName]Adapter } from "../providers/[provider-name]/[provider-name]-adapter.js";
```

#### 5.2: Update Environment Variables Documentation

```typescript
* Environment Variables Required:
*   - OPENAI_API_KEY (optional)
*   - GOOGLE_API_KEY (optional) 
*   - ANTHROPIC_API_KEY (optional)
*   - XAI_API_KEY (optional)
*   - [PROVIDER_NAME]_API_KEY (optional)
```

#### 5.3: Add Provider Case in fetchModelsForProvider

```typescript
private async fetchModelsForProvider(providerName: string): Promise<SourceModel[]> {
  switch (providerName.toLowerCase()) {
    case "openai":
      return this.fetchOpenAIModels();
    case "google":
      return this.fetchGoogleModels();
    case "anthropic":
      return this.fetchAnthropicModels();
    case "xai":
      return this.fetchXaiModels();
    case "[provider-name]":
      return this.fetch[ProviderName]Models();
    default:
      console.warn(`⚠️  Unknown provider: ${providerName}`);
      return [];
  }
}
```

#### 5.4: Add Provider Pattern in getSupportedModelsForProvider

```typescript
switch (providerName.toLowerCase()) {
  case "openai":
    return modelId.includes("gpt") || modelId.includes("o1") || modelId.includes("o3") || modelId.includes("o4") || modelId.includes("chatgpt");
  case "google":
    return modelId.includes("gemini");
  case "anthropic":
    return modelId.includes("claude");
  case "xai":
    return modelId.includes("grok");
  case "[provider-name]":
    return modelId.includes("[pattern1]") || modelId.includes("[pattern2]");
  default:
    return false;
}
```

#### 5.5: Add Fetch Method

```typescript
private async fetch[ProviderName]Models(): Promise<SourceModel[]> {
  if (!process.env.[PROVIDER_NAME]_API_KEY) {
    console.warn("⚠️  [PROVIDER_NAME]_API_KEY not found, skipping [ProviderName]");
    return [];
  }

  try {
    const adapter = new [ProviderName]Adapter(process.env.[PROVIDER_NAME]_API_KEY);
    const normalizedModels = await adapter.fetchModels();

    return normalizedModels.map((model) => ({
      modelId: model.modelId,
      name: model.name,
      displayName: model.displayName || model.name,
      modelFamily: this.inferModelFamily(model.modelId, "[provider-name]"),
      provider: "[provider-name]",
      version: model.version || "",
      maxTokens: model.maxTokens,
      contextWindow: model.maxTokens,
      status: model.status || "active",
      description: model.description || "",
      modalities: this.inferModalitiesFromModel(model.modelId, "[provider-name]"),
      trainingDataCutoff: this.inferTrainingCutoff(model.modelId, "[provider-name]"),
      releaseDate: this.inferReleaseDate(model.modelId, "[provider-name]"),
      modelType: this.inferModelType(model.modelId, "[provider-name]"),
      inputFormat: this.inferInputFormat(model.modelId, "[provider-name]"),
      outputFormat: this.inferOutputFormat(model.modelId, "[provider-name]"),
      responseFormat: this.inferResponseFormat(model.modelId, "[provider-name]"),
      toolsSupported: this.inferToolsSupported(model.modelId, "[provider-name]"),
    }));
  } catch (error) {
    console.error("❌ [ProviderName] fetch error:", error);
    throw error;
  }
}
```

#### 5.6: Update Inference Methods

Add provider-specific logic to each inference method:

- `inferModalitiesFromModel`
- `inferTrainingCutoff`  
- `inferModelFamily`
- `inferReleaseDate`
- `inferModelType`
- `inferInputFormat`
- `inferOutputFormat`
- `inferResponseFormat`
- `inferToolsSupported`
- `getPricingForModel`

### Step 7: Update Configuration Files

#### 6.1: Add to supported-providers.json

```json
{
  "providers": [
    {
      "name": "openai",
      "base_url": "https://api.openai.com"
    },
    {
      "name": "[provider-name]", 
      "base_url": "[PROVIDER_BASE_URL]"
    }
  ]
}
```

#### 6.2: Add Models to supported-models.json

```json
[
  {"modelId": "existing-model"},
  {"modelId": "[provider-model-1]"},
  {"modelId": "[provider-model-2]"}
]
```

### Step 8: Update Documentation

#### 7.1: Update README.md

```markdown
# AI Sync Adapters

Synchronizes AI models from multiple providers (OpenAI, Google, Anthropic, [ProviderName]) with unified pricing management.
```

Update file structure diagram:
```
└── [provider-name]/
    ├── [provider-name]-models.json         # 🤖 Auto: Technical specs
    └── [provider-name]-models-summary.json # 🤖 Auto: Model IDs only
```

Add to pricing table:
```markdown
| `[model-family]` | $X.XX       | $X.XX        |
```

#### 7.2: Update How-To-Sync.md

Add provider to examples:
```json
{
  "providers": [
    {"name": "openai", "base_url": "https://api.openai.com"},
    {"name": "[provider-name]", "base_url": "[PROVIDER_BASE_URL]"}
  ]
}
```

### Step 9: Testing

#### 9.1: Verify Environment Setup

Ensure your API key is properly configured in the root `.env` file:
```bash
# Check if the environment variable is set
echo $[PROVIDER_NAME]_API_KEY

# Should output something like: your_api_key_here (partially hidden)
```

**Common Issues**:
- If the key is not found, ensure you've added it to the root `.env` file (not in packages/)
- Make sure there are no extra spaces around the `=` sign
- Verify the provider name matches exactly (case-sensitive in code)

#### 9.2: Test Sync

```bash
pnpm run --filter @kdx/api models-sync
```

#### 9.3: Validation Checklist

- [ ] API key added to root `.env` file

- [ ] Provider folder created with all required files
- [ ] Adapter implementation works correctly
- [ ] Sync script includes new provider  
- [ ] Configuration files updated
- [ ] Documentation updated
- [ ] Pricing file auto-generates correctly
- [ ] Models sync successfully
- [ ] No errors in console output

## 📁 Complete File Structure

After completion, your provider should have:

```
[provider-name]/
├── [provider-name]-adapter.ts           # ✅ Manual: Adapter implementation
├── [provider-name]-pricing.md           # ✅ Manual: Comprehensive pricing docs
├── [provider-name]-pricing.json         # ✅ Manual: Pricing configuration
├── [provider-name]-models.json          # 🔄 Auto: Technical model specs
└── [provider-name]-models-summary.json  # 🔄 Auto: Model IDs only
```

## 🔧 Maintenance

After adding the provider:

1. **Secure API keys**: Ensure keys are properly stored and never committed
2. **Monitor pricing**: Check official pricing pages regularly
3. **Update models**: Add new models to `supported-models.json`
4. **Test sync**: Regularly test the sync process
5. **Update docs**: Keep pricing documentation current
6. **Rotate keys**: Periodically rotate API keys for security

## 📞 Need Help?

- Check existing providers (openai, google, anthropic) for reference implementations
- Follow the patterns established in the codebase
- Test thoroughly before committing changes

---

**Template Version**: v2.0  
**Last Updated**: 2025-07-15  
**Example Implementations**: 
- `openai/` - Full implementation with O-series models
- `anthropic/` - Claude models with vision support  
- `google/` - Gemini models with multimodal capabilities
- `xai/` - Grok models with custom error handling

**Key Changes in v2.0**:
- Manual pricing configuration (no auto-generation)
- Comprehensive pricing documentation format
- Updated for new `providers/` directory structure
- Enhanced error handling and validation
- Provider-specific optimization patterns