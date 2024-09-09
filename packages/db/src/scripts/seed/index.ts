import {
  calendarAppId,
  KDX_PRODUCTION_URL,
  kdxPartnerId,
  kodixCareAppId,
  todoAppId,
} from "@kdx/shared";

import { sql } from "../..";
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

  await db.transaction(async (tx) => {
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

    await tx
      .insert(devPartners)
      .values(_devPartners)
      .onDuplicateKeyUpdate({
        set: allSetValues(_devPartners),
      });
    await tx
      .insert(apps)
      .values(_apps)
      .onDuplicateKeyUpdate({
        set: allSetValues(_apps),
      });
    await tx
      .insert(appPermissions)
      .values(toInsertAppPermissions)
      .onDuplicateKeyUpdate({
        set: allSetValues(toInsertAppPermissions),
      });
  });
}

//TODO: Understand how to upsert correctly https://github.com/drizzle-team/drizzle-orm/issues/1728
function allSetValues(values: Record<string, unknown>[]) {
  return Object.assign(
    {},
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ...Object.keys(values[0]!).map(
      (k) => ({ [k]: sql.raw(`values(${k})`) }), //Needs to be raw!
    ),
  ) as Record<string, unknown>;
}

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
