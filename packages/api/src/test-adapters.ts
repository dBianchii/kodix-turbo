#!/usr/bin/env tsx

/**
 * Model Sync Feature Test
 *
 * This script tests the AI provider adapters for the Model Sync feature.
 * It verifies that all three providers (OpenAI, Google, Anthropic) can:
 * - Connect to their respective APIs
 * - Fetch model information
 * - Apply pricing data from local JSON files
 * - Normalize model data into the expected format
 *
 * Usage: npx tsx packages/api/src/test-adapters.ts
 */
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

import { AnthropicAdapter } from "./internal/services/ai-model-sync-adapter/sync/providers/anthropic/anthropic-adapter";
import { GoogleAdapter } from "./internal/services/ai-model-sync-adapter/sync/providers/google/google-adapter";
import { OpenAIAdapter } from "./internal/services/ai-model-sync-adapter/sync/providers/openai/openai-adapter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from root .env BEFORE importing anything else
config({ path: resolve(__dirname, "../../../.env") });

async function testModelSyncAdapters() {
  console.log("🧪 Testing Model Sync Feature - Provider Adapters\n");

  const results = {
    openai: { success: false, models: 0, error: null as string | null },
    google: { success: false, models: 0, error: null as string | null },
    anthropic: { success: false, models: 0, error: null as string | null },
  };

  // Test OpenAI Adapter
  console.log("📡 Testing OpenAI Adapter...");
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY not found in environment");
    }

    const openaiAdapter = new OpenAIAdapter(openaiKey);
    const openaiModels = await openaiAdapter.fetchModels();

    results.openai.success = true;
    results.openai.models = openaiModels.length;

    console.log(`✅ OpenAI: Found ${openaiModels.length} models`);

    // Count models with and without pricing
    const withPricing = openaiModels.filter((m) => m.pricing).length;
    const withoutPricing = openaiModels.length - withPricing;

    console.log(`    💰 With pricing: ${withPricing}`);
    console.log(`    ❓ Without pricing: ${withoutPricing}`);

    // Show first few models
    openaiModels.slice(0, 3).forEach((model) => {
      console.log(`  - ${model.name} (${model.modelId})`);
      if (model.pricing) {
        console.log(
          `    💰 Input: $${model.pricing.input}, Output: $${model.pricing.output}`,
        );
      } else {
        console.log(`    ❓ No pricing data`);
      }
      if (model.maxTokens) {
        console.log(`    📏 Max tokens: ${model.maxTokens.toLocaleString()}`);
      }
    });
  } catch (error) {
    results.openai.error =
      error instanceof Error ? error.message : String(error);
    console.error("❌ OpenAI adapter failed:", error);
  }

  console.log("\n📡 Testing Google Adapter...");
  try {
    const googleKey = process.env.GOOGLE_API_KEY;
    if (!googleKey) {
      throw new Error("GOOGLE_API_KEY not found in environment");
    }

    const googleAdapter = new GoogleAdapter(googleKey);
    const googleModels = await googleAdapter.fetchModels();

    results.google.success = true;
    results.google.models = googleModels.length;

    console.log(`✅ Google: Found ${googleModels.length} models`);

    // Count models with and without pricing
    const googleWithPricing = googleModels.filter((m) => m.pricing).length;
    const googleWithoutPricing = googleModels.length - googleWithPricing;

    console.log(`    💰 With pricing: ${googleWithPricing}`);
    console.log(`    ❓ Without pricing: ${googleWithoutPricing}`);

    // Show first few models
    googleModels.slice(0, 3).forEach((model) => {
      console.log(`  - ${model.name} (${model.modelId})`);
      if (model.pricing) {
        console.log(
          `    💰 Input: $${model.pricing.input}, Output: $${model.pricing.output}`,
        );
      } else {
        console.log(`    ❓ No pricing data`);
      }
      if (model.maxTokens) {
        console.log(`    📏 Max tokens: ${model.maxTokens.toLocaleString()}`);
      }
    });
  } catch (error) {
    results.google.error =
      error instanceof Error ? error.message : String(error);
    console.error("❌ Google adapter failed:", error);
  }

  console.log("\n📡 Testing Anthropic Adapter...");
  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      throw new Error("ANTHROPIC_API_KEY not found in environment");
    }

    const anthropicAdapter = new AnthropicAdapter(anthropicKey);
    const anthropicModels = await anthropicAdapter.fetchModels();

    results.anthropic.success = true;
    results.anthropic.models = anthropicModels.length;

    console.log(`✅ Anthropic: Found ${anthropicModels.length} models`);

    // Count models with and without pricing
    const anthropicWithPricing = anthropicModels.filter(
      (m) => m.pricing,
    ).length;
    const anthropicWithoutPricing =
      anthropicModels.length - anthropicWithPricing;

    console.log(`    💰 With pricing: ${anthropicWithPricing}`);
    console.log(`    ❓ Without pricing: ${anthropicWithoutPricing}`);

    // Show first few models
    anthropicModels.slice(0, 3).forEach((model) => {
      console.log(`  - ${model.name} (${model.modelId})`);
      if (model.pricing) {
        console.log(
          `    💰 Input: $${model.pricing.input}, Output: $${model.pricing.output}`,
        );
      } else {
        console.log(`    ❓ No pricing data`);
      }
      if (model.maxTokens) {
        console.log(`    📏 Max tokens: ${model.maxTokens.toLocaleString()}`);
      }
    });
  } catch (error) {
    results.anthropic.error =
      error instanceof Error ? error.message : String(error);
    console.error("❌ Anthropic adapter failed:", error);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60));

  const totalModels =
    results.openai.models + results.google.models + results.anthropic.models;
  const successfulProviders = [
    results.openai.success,
    results.google.success,
    results.anthropic.success,
  ].filter(Boolean).length;

  console.log(`✅ Successful providers: ${successfulProviders}/3`);
  console.log(`📦 Total models found: ${totalModels}`);

  Object.entries(results).forEach(([provider, result]) => {
    const status = result.success ? "✅" : "❌";
    const details = result.success
      ? `${result.models} models`
      : `Error: ${result.error}`;
    console.log(`${status} ${provider.toUpperCase()}: ${details}`);
  });

  if (successfulProviders === 3) {
    console.log("\n🎉 All tests passed! Model Sync feature is ready to use.");
    console.log("\n📋 Next steps:");
    console.log(
      "1. Start the database: cd packages/db-dev && docker-compose up -d",
    );
    console.log("2. Access the AI Studio in your Kodix app");
    console.log("3. Use the 'Sync Models' feature to import these models");
    console.log("4. Configure which models are enabled for your team");
  } else {
    console.log(
      "\n⚠️  Some tests failed. Please check your API keys and network connection.",
    );
  }

  console.log("=".repeat(60));
}

// Run the test
testModelSyncAdapters().catch(console.error);
