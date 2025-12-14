import type { PgDatabase } from "drizzle-orm/pg-core";
import { reset } from "drizzle-seed";
import ora from "ora";

type AppName = "Cash";

export const runSeed = async ({
  db,
  schemaToReset,
  seedFn,
  name,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: Intentional any
  db: PgDatabase<any, any>;
  schemaToReset: Parameters<typeof reset>[1];
  seedFn: () => Promise<void>;
  name: AppName;
}) => {
  // biome-ignore lint/style/noNonNullAssertion: fix me?
  if (new URL(process.env.DATABASE_URL!).hostname !== "localhost") {
    throw new Error(
      "Uncomment this line to reset the database in a live environment. Proceed with caution.",
    );
  }

  const spinner = ora(`🧨 Resetting ${name} database...`).start();
  try {
    await reset(db, schemaToReset);
  } catch (error) {
    spinner.fail(`Failed to reset database: ${(error as Error).message}`);
    throw error;
  }

  spinner.succeed(`${name} database reset!`);

  const seedSpinner = ora(`🌱 Seeding ${name} database...`).start();
  try {
    await seedFn();
  } catch (error) {
    seedSpinner.fail(`Failed to seed ${name}: ${(error as Error)?.message}`);
    throw error;
  }
  seedSpinner.succeed(`🌱 ${name} database seeded!`);
};
