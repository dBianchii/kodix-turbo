#!/usr/bin/env tsx

/**
 * Debug script to see ALL models available from each provider
 * This bypasses our pricing filter to show what we're missing
 */

import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment FIRST
config({ path: resolve(__dirname, "../../.env") });

async function debugAllModels() {
  console.log("🔍 Debugging ALL available models from providers...\n");

  // Test OpenAI - get ALL models
  console.log("📡 OpenAI - ALL available models:");
  try {
    const openaiResponse = await fetch("https://api.openai.com/v1/models", {
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    
    if (openaiResponse.ok) {
      const openaiData = await openaiResponse.json();
      console.log(`✅ OpenAI: Found ${openaiData.data.length} total models`);
      
      openaiData.data
        .sort((a: any, b: any) => a.id.localeCompare(b.id))
        .forEach((model: any, index: number) => {
          console.log(`  ${index + 1}. ${model.id} (owned by: ${model.owned_by})`);
        });
    }
  } catch (error) {
    console.error("❌ OpenAI failed:", error);
  }

  console.log("\n" + "=".repeat(60) + "\n");

  // Test Google - get ALL models  
  console.log("📡 Google - ALL available models:");
  try {
    const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${process.env.GOOGLE_API_KEY}`);
    
    if (googleResponse.ok) {
      const googleData = await googleResponse.json();
      console.log(`✅ Google: Found ${googleData.models?.length || 0} total models`);
      
      if (googleData.models) {
        googleData.models
          .sort((a: any, b: any) => a.name.localeCompare(b.name))
          .forEach((model: any, index: number) => {
            const modelId = model.name.replace('models/', '');
            console.log(`  ${index + 1}. ${modelId}`);
          });
      }
    }
  } catch (error) {
    console.error("❌ Google failed:", error);
  }

  console.log("\n" + "=".repeat(60) + "\n");

  // Test Anthropic - get ALL models
  console.log("📡 Anthropic - ALL available models:");
  try {
    const anthropicResponse = await fetch("https://api.anthropic.com/v1/models", {
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
    });
    
    if (anthropicResponse.ok) {
      const anthropicData = await anthropicResponse.json();
      console.log(`✅ Anthropic: Found ${anthropicData.data?.length || 0} total models`);
      
      if (anthropicData.data) {
        anthropicData.data
          .sort((a: any, b: any) => a.id.localeCompare(b.id))
          .forEach((model: any, index: number) => {
            console.log(`  ${index + 1}. ${model.id}`);
          });
      }
    }
  } catch (error) {
    console.error("❌ Anthropic failed:", error);
  }

  console.log("\n" + "=".repeat(60));
  console.log("�� ANALYSIS:");
  console.log("=".repeat(60));
  console.log("Our current implementation only returns models that have");
  console.log("pricing data in our local JSON files. To get ALL models,");
  console.log("we need to either:");
  console.log("1. Add pricing data for more models");
  console.log("2. Return models without pricing (with null/undefined pricing)");
  console.log("3. Use estimated/default pricing for unknown models");
}

debugAllModels().catch(console.error);
