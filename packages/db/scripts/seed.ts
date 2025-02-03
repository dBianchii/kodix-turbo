import {
  calendarAppId,
  KDX_PRODUCTION_URL,
  kdxPartnerId,
  kodixCareAppId,
  todoAppId,
} from "@kdx/shared";

import { buildConflictUpdateColumns } from "../src";
import { db } from "../src/client";
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
];

async function main() {
  console.log("🌱 Seeding...");

  await db.transaction(async (tx) => {
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
}

const typedObjectKeys = <T extends Record<string, unknown>>(obj: T) =>
  Object.keys(obj) as (keyof T)[];

main()
  .then(() => {
    console.log("🌳 Fully seeded!");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    // void db.$disconnect();
  });
