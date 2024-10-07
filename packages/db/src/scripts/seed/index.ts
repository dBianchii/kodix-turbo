import {
  calendarAppId,
  KDX_PRODUCTION_URL,
  kdxPartnerId,
  kodixCareAppId,
  todoAppId,
} from "@kdx/shared";

import { buildConflictUpdateColumns } from "../../";
import { db } from "../../client";
import { appPermissions, apps, devPartners } from "../../schema";
import { appRoles_defaultTree } from "./appRolesDefault_tree";

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
  validateSeedInput();

  const toInsertAppPermissions: (typeof appPermissions.$inferInsert)[] = [];
  for (const [appId, { appPermissions }] of Object.entries(
    appRoles_defaultTree,
  )) {
    if (appPermissions) {
      toInsertAppPermissions.push(
        ...appPermissions.map((appPermission) => ({
          ...appPermission,
          appId,
          name: "appPermission.id",
        })),
      );
    }
  }

  await db.transaction(async (tx) => {
    if (!toInsertAppPermissions[0]) throw new Error("No appPermissions!"); //? Stuff to make TS happy
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
    await tx
      .insert(appPermissions)
      .values(toInsertAppPermissions)
      .onDuplicateKeyUpdate({
        set: buildConflictUpdateColumns(
          appPermissions,
          typedObjectKeys(toInsertAppPermissions[0]),
        ),
      });
  });
}

const typedObjectKeys = <T extends Record<string, unknown>>(obj: T) =>
  Object.keys(obj) as (keyof T)[];

function validateSeedInput() {
  //? 1. Validate that all appPermissions are assigned to at least one role in their designated app
  for (const [appId, { appRoleDefaults, appPermissions }] of Object.entries(
    appRoles_defaultTree,
  )) {
    const allPermissionsInRoles = appRoleDefaults.flatMap(
      (role) => role.AppPermissions,
    );
    for (const appPermission of appPermissions ?? []) {
      if (!allPermissionsInRoles.includes(appPermission.id)) {
        throw new Error(
          `🌱 - ❌ Seed input validation failed! Permission ${appPermission.id} is not assigned to any role in app ${appId}`,
        );
      }
    }
  }
  console.log("🌱 ✅ Seed input validation passed!");
}

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
