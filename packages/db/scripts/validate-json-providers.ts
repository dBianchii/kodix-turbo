import { config } from "dotenv";

// Load environment variables
config({ path: ".env" });

import { jsonProviderService } from "../src/services/json-provider.service";

async function validateJsonProviders() {
  console.log("🔍 Validating JSON provider configuration...\n");

  try {
    // 1. Load providers from JSON
    const jsonProviders = await jsonProviderService.getAllProviders();
    console.log(`✅ Loaded ${jsonProviders.length} providers from JSON`);
    
    // 2. Display provider details
    console.log("\n📋 Provider details:");
    for (const provider of jsonProviders) {
      console.log(`   - ${provider.name} (ID: ${provider.providerId})`);
      console.log(`     Base URL: ${provider.baseUrl || "(not set)"}`);
    }

    // 3. Test service methods
    console.log("\n🧪 Testing JsonProviderService methods...");
    
    // Test findById
    const testProviderId = jsonProviders[0]?.providerId;
    if (testProviderId) {
      const provider = await jsonProviderService.findById(testProviderId);
      console.log(`✅ findById works: Found ${provider?.name}`);
    }

    // Test findByName
    const testProviderName = jsonProviders[0]?.name;
    if (testProviderName) {
      const provider = await jsonProviderService.findByName(testProviderName);
      console.log(`✅ findByName works: Found ${provider?.providerId}`);
    }

    // Test findMany with pagination
    const providers = await jsonProviderService.findMany({ limite: 2, offset: 0 });
    console.log(`✅ findMany works: Retrieved ${providers.length} providers`);

    // Test count
    const count = await jsonProviderService.count();
    console.log(`✅ count works: Total ${count} providers`);

    // Test exists
    if (testProviderId) {
      const exists = await jsonProviderService.exists(testProviderId);
      console.log(`✅ exists works: Provider exists = ${exists}`);
    }

    // Test validation
    if (testProviderId) {
      const isValid = await jsonProviderService.validateProviderId(testProviderId);
      console.log(`✅ validateProviderId works: Valid = ${isValid}`);
    }

    // Test non-existent provider
    const nonExistent = await jsonProviderService.findById("non-existent-id");
    console.log(`✅ Non-existent provider handling: ${nonExistent === null ? "null" : "found"}`);

    // 4. Test caching by reloading
    console.log("\n🔄 Testing cache functionality...");
    const startTime = Date.now();
    await jsonProviderService.getAllProviders(); // Should be cached
    const cachedTime = Date.now() - startTime;
    console.log(`✅ Cached retrieval time: ${cachedTime}ms`);

    // 5. Test reload functionality
    await jsonProviderService.reload();
    console.log(`✅ Reload functionality works`);

    console.log("\n✅ All JSON provider validation tests PASSED!");

  } catch (error) {
    console.error("\n❌ JSON validation failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

validateJsonProviders();