import type { PgDatabase } from "drizzle-orm/pg-core";
import {
  confirm,
  fetchDatabaseUrlFromVercel,
  tryGetEnvironmentFromArguments,
} from "@kodix/shared/cli-utils";
import { reset } from "drizzle-seed";
import ora from "ora";

type AppName = "Cash";

export const runSeed = async ({
  appRoot,
  createDb,
  schemaToReset,
  seedFn,
  name,
}: {
  appRoot: string;
  // biome-ignore lint/suspicious/noExplicitAny: Intentional any
  createDb: () => Promise<PgDatabase<any, any>>;
  schemaToReset: Parameters<typeof reset>[1];
  // biome-ignore lint/suspicious/noExplicitAny: Intentional any
  seedFn: (db: PgDatabase<any, any>) => Promise<void>;
  name: AppName;
}) => {
  const liveEnvironment = tryGetEnvironmentFromArguments();

  if (liveEnvironment) {
    const databaseUrl = await fetchDatabaseUrlFromVercel({
      appRoot,
      environment: liveEnvironment,
    });
    process.env.DATABASE_URL = databaseUrl;
  }

  const db = await createDb();

  // biome-ignore lint/style/noNonNullAssertion: DATABASE_URL is set
  const databaseUrl = new URL(process.env.DATABASE_URL!);
  const isLiveEnvironment = databaseUrl.hostname !== "localhost";

  if (isLiveEnvironment && !liveEnvironment) {
    throw new Error(
      "Running seed on a live environment requires --environment flag",
    );
  }

  if (isLiveEnvironment) {
    // biome-ignore lint/suspicious/noConsole: user confirmation
    console.warn(
      `⚠️  WARNING: You are about to RESET and SEED a live ${liveEnvironment} database!\n   Database: ${databaseUrl}\n   This will DELETE ALL DATA and cannot be undone.\n`,
    );

    const confirmed = await confirm("Do you want to proceed?");
    if (!confirmed) {
      throw new Error("Database seed aborted by user");
    }
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
    await seedFn(db);
  } catch (error) {
    seedSpinner.fail(`Failed to seed ${name}: ${(error as Error)?.message}`);
    throw error;
  }
  seedSpinner.succeed(`🌱 ${name} database seeded!`);
};
