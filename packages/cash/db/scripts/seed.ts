import { reset } from "drizzle-seed";
import ora from "ora";

import { db } from "../src/client";
import * as schema from "../src/schema";

async function main() {
  const dbResetSpinner = ora("🧨 Resetting Cash database...").start();

  try {
    await reset(db, schema);
  } catch (error: unknown) {
    dbResetSpinner.fail(
      `Failed to reset database: ${(error as Error).message}`
    );
    throw error;
  }

  dbResetSpinner.succeed("💥 Cash database reset! All data has been deleted.");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
