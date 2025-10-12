import { sql } from "drizzle-orm";
import ora from "ora";

import { db } from "../src/client";

async function main() {
  const dbResetSpinner = ora("🧨 Resetting Cash database...").start();
  // biome-ignore lint/style/noNonNullAssertion: fix me?
  if (new URL(process.env.DATABASE_URL!).hostname !== "localhost") {
    throw new Error(
      "Uncomment this line to reset the database in a live environment. Proceed with caution."
    );
  }

  try {
    // TODO: Use a better first-class reset mechanism once https://github.com/drizzle-team/drizzle-orm/issues/4171 is resolved
    await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE`);
    await db.execute(sql`CREATE SCHEMA public`);
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
