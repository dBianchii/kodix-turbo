import { eq, isNotNull } from "drizzle-orm";

import { db } from "../src/client";
import { aiModel } from "../src/schema";

async function backfill() {
  console.log("🚀 Starting backfill for universalModelId...");

  try {
    const modelsToUpdate = await db
      .select({
        id: aiModel.id,
        config: aiModel.config,
      })
      .from(aiModel)
      .where(isNotNull(aiModel.config));

    if (modelsToUpdate.length === 0) {
      console.log("✅ No models to update.");
      return;
    }

    console.log(`Found ${modelsToUpdate.length} models to process.`);

    for (const model of modelsToUpdate) {
      const universalId = (model.config as any)?.modelId;

      if (universalId && typeof universalId === "string") {
        await db
          .update(aiModel)
          .set({ universalModelId: universalId })
          .where(eq(aiModel.id, model.id));
        console.log(
          `Updated model ${model.id} with universalModelId: ${universalId}`,
        );
      } else {
        console.warn(
          `⚠️ Skipping model ${model.id}: universalModelId not found or invalid in config.`,
        );
      }
    }

    console.log("✅ Backfill completed successfully!");
  } catch (error) {
    console.error("❌ Error during backfill:", error);
    process.exit(1);
  }
}

backfill();
