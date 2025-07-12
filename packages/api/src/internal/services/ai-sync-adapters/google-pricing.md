# Google AI Pricing Documentation

## Official Pricing Page

[Google AI Studio Pricing](https://ai.google.dev/pricing)

## Current Models and Pricing

Based on the official Google AI pricing page, the following models are available:

### Gemini 2.5 Series (Latest)

- **Gemini 2.5 Pro**: $1.25/1M tokens input, $5.00/1M tokens output
- **Gemini 2.5 Flash**: $0.30/1M tokens input, $2.50/1M tokens output
- **Gemini 2.5 Flash-Lite**: $0.075/1M tokens input, $0.30/1M tokens output

### Gemini 2.0 Series

- **Gemini 2.0 Flash**: $0.075/1M tokens input, $0.30/1M tokens output
- **Gemini 2.0 Flash-Lite**: $0.075/1M tokens input, $0.30/1M tokens output

### Gemini 1.5 Series

- **Gemini 1.5 Pro**: $1.25/1M tokens input, $5.00/1M tokens output
- **Gemini 1.5 Flash**: $0.075/1M tokens input, $0.30/1M tokens output
- **Gemini 1.5 Flash-8B**: $0.0375/1M tokens input, $0.15/1M tokens output

### Gemini 1.0 Series

- **Gemini 1.0 Pro**: $0.50/1M tokens input, $1.50/1M tokens output

## Updating google-pricing.json

When asked to update the pricing information, follow these steps:

1. **Visit the official pricing page**: [Google AI Studio Pricing](https://ai.google.dev/pricing)

2. **Review current models**: Check for new model releases and pricing updates

3. **Update the JSON file**: Modify `google-pricing.json` with the format:

   ```json
   {
     "modelId": "gemini-model-name",
     "pricing": {
       "input": "X.XX",
       "output": "X.XX",
       "unit": "per_million_tokens"
     }
   }
   ```

4. **Key requirements**:

   - Use exact model IDs as they appear in the Google API
   - Pricing values must be strings, not numbers
   - Include the "per_million_tokens" unit
   - Focus on text-based models (exclude image/video generation models)

5. **Model ID examples**:
   - `gemini-2.5-pro`
   - `gemini-2.5-flash`
   - `gemini-2.5-flash-lite`
   - `gemini-2.0-flash`
   - `gemini-1.5-pro`
   - `gemini-1.5-flash`

## Notes

- **Gemini 2.5 Flash**: Pricing updated from preview to stable version ($0.30 input, $2.50 output)
- **Thinking vs Non-thinking**: Google removed the separate pricing for thinking vs non-thinking modes
- **Context Window**: Most models support 1M+ token context windows
- **Multimodal**: Many models support text, image, audio, and video inputs
- **Free Tier**: Some models may have free quotas in Google AI Studio

## Recent Updates

- **June 2025**: Gemini 2.5 Flash and Pro made generally available
- **Gemini 2.5 Flash-Lite**: New cost-effective option introduced
- **Pricing Consolidation**: Simplified pricing structure without thinking/non-thinking tiers
