#!/usr/bin/env tsx

/**
 * Validate Migration 006: Verify ai_provider table removal
 */

import { db } from "../src/client";

async function validateMigration006() {
  console.log("🔍 Database Validation After Migration 006");
  console.log("==========================================");

  try {
    // Test 1: Verify ai_provider table was dropped
    console.log("\n1. Testing ai_provider table removal...");
    try {
      await db.execute("SELECT COUNT(*) FROM ai_provider");
      console.log("❌ FAIL: ai_provider table still exists");
      return false;
    } catch (error: any) {
      if (error.message.includes("doesn't exist")) {
        console.log("✅ PASS: ai_provider table successfully removed");
      } else {
        console.log("❌ UNEXPECTED ERROR:", error.message);
        return false;
      }
    }

    // Test 2: Verify ai_model table still exists
    console.log("\n2. Testing ai_model table preservation...");
    const [models] = await db.execute("SELECT COUNT(*) as count FROM ai_model") as any;
    console.log(`✅ PASS: ai_model table exists with ${models[0]?.count || 0} records`);

    // Test 3: Verify ai_team_provider_token table still exists
    console.log("\n3. Testing ai_team_provider_token table preservation...");
    const [tokens] = await db.execute("SELECT COUNT(*) as count FROM ai_team_provider_token") as any;
    console.log(`✅ PASS: ai_team_provider_token table exists with ${tokens[0]?.count || 0} records`);

    // Test 4: Check for any remaining foreign key constraints to ai_provider
    console.log("\n4. Testing foreign key constraints removal...");
    const [fks] = await db.execute(`
      SELECT 
          TABLE_NAME,
          COLUMN_NAME,
          CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND REFERENCED_TABLE_NAME = 'ai_provider'
    `) as any;
    
    if (fks.length === 0) {
      console.log("✅ PASS: No foreign key constraints to ai_provider found");
    } else {
      console.log("❌ FAIL: Found remaining foreign key constraints:", fks);
      return false;
    }

    // Test 5: Verify models still have providerId values
    console.log("\n5. Testing model providerId preservation...");
    const [modelProviders] = await db.execute(`
      SELECT DISTINCT providerId, COUNT(*) as count 
      FROM ai_model 
      WHERE providerId IS NOT NULL 
      GROUP BY providerId
    `) as any;
    
    if (modelProviders.length > 0) {
      console.log("✅ PASS: Models have preserved providerId values:");
      modelProviders.forEach((mp: any) => {
        console.log(`   - ${mp.providerId}: ${mp.count} models`);
      });
    } else {
      console.log("⚠️  WARNING: No models found with providerId values");
    }

    // Test 6: Verify tokens still have providerId values
    console.log("\n6. Testing token providerId preservation...");
    const [tokenProviders] = await db.execute(`
      SELECT DISTINCT providerId, COUNT(*) as count 
      FROM ai_team_provider_token 
      WHERE providerId IS NOT NULL 
      GROUP BY providerId
    `) as any;
    
    if (tokenProviders.length > 0) {
      console.log("✅ PASS: Tokens have preserved providerId values:");
      tokenProviders.forEach((tp: any) => {
        console.log(`   - ${tp.providerId}: ${tp.count} tokens`);
      });
    } else {
      console.log("⚠️  WARNING: No tokens found with providerId values");
    }

    console.log("\n✅ Migration 006 validation completed successfully!");
    console.log("\n📝 Summary:");
    console.log("   - ai_provider table removed ✅");
    console.log("   - Foreign key constraints removed ✅");
    console.log("   - Data integrity preserved ✅");
    console.log("   - Provider information now managed via JSON configuration");
    
    return true;
    
  } catch (error) {
    console.error("❌ Validation failed:", error);
    return false;
  }
}

// Execute validation
if (import.meta.url === `file://${process.argv[1]}`) {
  validateMigration006()
    .then((success) => {
      if (success) {
        console.log("\n🎉 Validation script completed successfully!");
        process.exit(0);
      } else {
        console.error("\n💥 Validation script failed!");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("\n💥 Validation script error:", error);
      process.exit(1);
    });
}

export { validateMigration006 };