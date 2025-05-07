import { reset } from "drizzle-seed";
import ora from "ora";

import {
  agentAppId,
  calendarAppId,
  KDX_PRODUCTION_URL,
  kdxPartnerId,
  kodixCareAppId,
  todoAppId,
  typedObjectKeys,
} from "@kdx/shared";

import { buildConflictUpdateColumns } from "../src";
import { db } from "../src/client";
import * as schema from "../src/schema";
import { apps, devPartners } from "../src/schema";

const _devPartners: (typeof devPartners.$inferInsert)[] = [
  {
    id: kdxPartnerId,
    name: "Kodix",
    partnerUrl: KDX_PRODUCTION_URL,
  },
];

export const _apps: (typeof apps.$inferInsert)[] = [
  {
    id: todoAppId, //As const so it can be used as a type
    devPartnerId: kdxPartnerId,
  },
  {
    id: calendarAppId,
    devPartnerId: kdxPartnerId,
  },
  {
    id: kodixCareAppId,
    devPartnerId: kdxPartnerId,
  },
  {
    id: agentAppId,
    devPartnerId: kdxPartnerId,
  },
];

const runSeed = () =>
  db.transaction(async (tx) => {
    if (!_devPartners[0]) throw new Error("No devPartners!");
    if (!_apps[0]) throw new Error("No apps!");

    await tx
      .insert(devPartners)
      .values(_devPartners)
      .onDuplicateKeyUpdate({
        set: buildConflictUpdateColumns(
          devPartners,
          typedObjectKeys(_devPartners[0]),
        ),
      });
    await tx
      .insert(apps)
      .values(_apps)
      .onDuplicateKeyUpdate({
        set: buildConflictUpdateColumns(apps, typedObjectKeys(_apps[0])),
      });
  });

async function main() {
  const dbResetSpinner = ora(`🧨 Resetting database...`).start();
  try {
    await reset(db, schema);
  } catch (error: unknown) {
    dbResetSpinner.fail(
      `Failed to reset database: ${(error as Error).message}`,
    );
    throw error;
  }
  dbResetSpinner.succeed("💥 Database reset!");

  const seedingSpinner = ora("🌱 Seeding...").start();

  try {
    await runSeed();
  } catch (error: unknown) {
    seedingSpinner.fail(`Failed to seed: ${(error as Error).message}`);
    throw error;
  }

  seedingSpinner.succeed(`🌲 Fully seeded!`);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

export const appIdToPathname = {
  [kodixCareAppId]: "kodixCare",
  [calendarAppId]: "calendar",
  [todoAppId]: "todo",
  [agentAppId]: "agent",
} as const;

export const appPathnameToAppId = {
  kodixCare: kodixCareAppId,
  calendar: calendarAppId,
  todo: todoAppId,
  agent: agentAppId,
} as const;
