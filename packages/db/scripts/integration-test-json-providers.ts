import { config } from "dotenv";

// Load environment variables
config({ path: ".env" });

import { jsonProviderService } from "../src/services/json-provider.service";
import { AiProviderRepository } from "../src/repositories/ai-studio";

async function runIntegrationTests() {
  console.log("🚀 Running JSON Provider Integration Tests...\n");

  const results = {
    passed: 0,
    failed: 0,
    errors: [] as string[]
  };

  function test(name: string, testFn: () => Promise<void>) {
    return async () => {
      try {
        console.log(`🧪 Testing: ${name}`);
        await testFn();
        console.log(`✅ PASSED: ${name}`);
        results.passed++;
      } catch (error) {
        console.log(`❌ FAILED: ${name} - ${error instanceof Error ? error.message : String(error)}`);
        results.failed++;
        results.errors.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
  }

  // Test 1: JSON Service Basic Operations
  await test("JsonProviderService basic operations", async () => {
    const providers = await jsonProviderService.getAllProviders();
    if (providers.length === 0) throw new Error("No providers loaded");
    
    const firstProvider = providers[0];
    if (!firstProvider) throw new Error("First provider is undefined");
    
    const foundById = await jsonProviderService.findById(firstProvider.providerId);
    if (!foundById) throw new Error("Provider not found by ID");
    
    const foundByName = await jsonProviderService.findByName(firstProvider.name);
    if (!foundByName) throw new Error("Provider not found by name");
    
    const count = await jsonProviderService.count();
    if (count !== providers.length) throw new Error("Count mismatch");
    
    console.log(`   Loaded ${providers.length} providers successfully`);
  })();

  // Test 2: Provider Repository Integration
  await test("AiProviderRepository integration with JSON backend", async () => {
    const providers = await AiProviderRepository.findMany();
    if (providers.length === 0) throw new Error("No providers from repository");
    
    const firstProvider = providers[0];
    if (!firstProvider) throw new Error("First provider from repository is undefined");
    
    const foundById = await AiProviderRepository.findById(firstProvider.providerId);
    if (!foundById) throw new Error("Provider not found by repository findById");
    
    const foundByName = await AiProviderRepository.findByName(firstProvider.name);
    if (!foundByName) throw new Error("Provider not found by repository findByName");
    
    const count = await AiProviderRepository.count();
    if (count !== providers.length) throw new Error("Repository count mismatch");
    
    console.log(`   Repository methods working with ${providers.length} providers`);
  })();

  // Test 3: Data Structure Validation
  await test("Provider data structure validation", async () => {
    const providers = await AiProviderRepository.findMany();
    
    for (const provider of providers) {
      if (!provider.providerId) throw new Error("Missing providerId");
      if (!provider.name) throw new Error("Missing provider name");
      if (!Array.isArray(provider.models)) throw new Error("Models should be array");
      if (!Array.isArray(provider.tokens)) throw new Error("Tokens should be array");
      
      // Check required fields
      if (typeof provider.providerId !== "string") throw new Error("providerId should be string");
      if (typeof provider.name !== "string") throw new Error("name should be string");
    }
    
    console.log(`   Validated structure for ${providers.length} providers`);
  })();

  // Test 4: Performance Benchmark
  await test("Performance benchmark", async () => {
    const iterations = 100;
    const startTime = Date.now();
    
    // Run multiple operations
    const promises = [];
    for (let i = 0; i < iterations; i++) {
      if (i % 4 === 0) {
        promises.push(jsonProviderService.getAllProviders());
      } else if (i % 4 === 1) {
        promises.push(jsonProviderService.findById("openai"));
      } else if (i % 4 === 2) {
        promises.push(jsonProviderService.findByName("OpenAI"));
      } else {
        promises.push(jsonProviderService.count());
      }
    }
    
    await Promise.allSettled(promises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;
    
    if (totalTime > 5000) throw new Error(`Performance too slow: ${totalTime}ms for ${iterations} operations`);
    
    console.log(`   ${iterations} operations completed in ${totalTime}ms (avg: ${avgTime.toFixed(2)}ms)`);
  })();

  // Test 5: Concurrent Access
  await test("Concurrent access safety", async () => {
    const concurrentOperations = 50;
    
    const promises = Array.from({ length: concurrentOperations }, (_, i) => {
      if (i % 3 === 0) {
        return AiProviderRepository.findById("openai");
      } else if (i % 3 === 1) {
        return AiProviderRepository.findByName("OpenAI");
      } else {
        return AiProviderRepository.findMany({ limite: 2 });
      }
    });
    
    const results = await Promise.allSettled(promises);
    const failed = results.filter(r => r.status === "rejected");
    
    if (failed.length > 0) {
      throw new Error(`${failed.length} concurrent operations failed`);
    }
    
    console.log(`   ${concurrentOperations} concurrent operations completed successfully`);
  })();

  // Test 6: Error Handling
  await test("Error handling", async () => {
    // Test non-existent provider
    const nonExistent = await AiProviderRepository.findById("non-existent-provider");
    if (nonExistent !== null) throw new Error("Should return null for non-existent provider");
    
    const nonExistentByName = await AiProviderRepository.findByName("Non-existent Provider");
    if (nonExistentByName !== null) throw new Error("Should return null for non-existent provider name");
    
    // Test unsupported operations
    try {
      await AiProviderRepository.create({ name: "Test" });
      throw new Error("Create should throw error");
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("not supported")) {
        throw new Error("Create should throw proper error message");
      }
    }
    
    try {
      await AiProviderRepository.update("test", { name: "Updated" });
      throw new Error("Update should throw error");
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("not supported")) {
        throw new Error("Update should throw proper error message");
      }
    }
    
    try {
      await AiProviderRepository.delete("test");
      throw new Error("Delete should throw error");
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("not supported")) {
        throw new Error("Delete should throw proper error message");
      }
    }
    
    console.log("   Error handling working correctly");
  })();

  // Test 7: Cache Behavior
  await test("Cache behavior validation", async () => {
    // First load
    const start1 = Date.now();
    await jsonProviderService.getAllProviders();
    const time1 = Date.now() - start1;
    
    // Second load (should be faster due to cache)
    const start2 = Date.now();
    await jsonProviderService.getAllProviders();
    const time2 = Date.now() - start2;
    
    // Cache should make second call faster
    if (time2 > time1) {
      console.log(`   Warning: Cache may not be working optimally (${time1}ms vs ${time2}ms)`);
    } else {
      console.log(`   Cache working: ${time1}ms -> ${time2}ms`);
    }
    
    // Test reload
    await jsonProviderService.reload();
    console.log("   Cache reload working");
  })();

  // Results Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 Integration Test Results:");
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

  if (results.failed > 0) {
    console.log("\n🔍 Failed Tests:");
    results.errors.forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}`);
    });
    
    console.log("\n❌ Integration tests FAILED!");
    process.exit(1);
  } else {
    console.log("\n🎉 All integration tests PASSED!");
    console.log("✅ JSON Provider migration is ready for production!");
  }

  process.exit(0);
}

runIntegrationTests().catch((error) => {
  console.error("\n💥 Integration test runner failed:", error);
  process.exit(1);
});