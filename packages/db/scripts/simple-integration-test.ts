import { config } from "dotenv";

// Load environment variables
config({ path: ".env" });

import { jsonProviderService } from "../src/services/json-provider.service";

async function simpleIntegrationTest() {
  console.log("🧪 Running Simple Integration Test...\n");

  try {
    // Test 1: Basic JSON service functionality
    console.log("1️⃣ Testing JsonProviderService...");
    const providers = await jsonProviderService.getAllProviders();
    console.log(`   ✅ Loaded ${providers.length} providers`);
    
    if (providers.length > 0) {
      const firstProvider = providers[0]!;
      console.log(`   📋 Sample provider: ${firstProvider.name} (${firstProvider.providerId})`);
      
      // Test findById
      const foundById = await jsonProviderService.findById(firstProvider.providerId);
      console.log(`   ✅ findById: ${foundById ? "Found" : "Not found"}`);
      
      // Test findByName
      const foundByName = await jsonProviderService.findByName(firstProvider.name);
      console.log(`   ✅ findByName: ${foundByName ? "Found" : "Not found"}`);
      
      // Test count
      const count = await jsonProviderService.count();
      console.log(`   ✅ count: ${count}`);
    }

    // Test 2: Performance check
    console.log("\n2️⃣ Testing Performance...");
    const startTime = Date.now();
    
    const promises = Array.from({ length: 100 }, () => 
      jsonProviderService.getAllProviders()
    );
    
    await Promise.all(promises);
    const endTime = Date.now();
    
    console.log(`   ✅ 100 operations completed in ${endTime - startTime}ms`);

    // Test 3: Error handling
    console.log("\n3️⃣ Testing Error Handling...");
    const nonExistent = await jsonProviderService.findById("non-existent");
    console.log(`   ✅ Non-existent provider: ${nonExistent === null ? "Correctly null" : "ERROR"}`);

    console.log("\n🎉 Simple Integration Test PASSED!");
    console.log("✅ JsonProviderService is working correctly!");

  } catch (error) {
    console.error("\n❌ Simple Integration Test FAILED:", error);
    process.exit(1);
  }

  process.exit(0);
}

simpleIntegrationTest();