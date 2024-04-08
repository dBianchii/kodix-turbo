import { sql } from "drizzle-orm/sql";

import {
  calendarAppId,
  kdxPartnerId,
  kdxProductionURL,
  kodixCareAppId,
  todoAppId,
} from "@kdx/shared";

import { db, schema } from "..";
import { appRoles_defaultTree } from "./appRolesDefault_tree";

const devPartners: (typeof schema.devPartners.$inferInsert)[] = [
  {
    id: kdxPartnerId,
    name: "Kodix",
    partnerUrl: kdxProductionURL,
  },
];

export const apps: (typeof schema.apps.$inferInsert)[] = [
  {
    id: todoAppId, //As const so it can be used as a type
    subscriptionCost: 0 as const,
    devPartnerId: kdxPartnerId,
  },
  {
    id: calendarAppId,
    subscriptionCost: 0 as const,
    devPartnerId: kdxPartnerId,
  },
  {
    id: kodixCareAppId,
    subscriptionCost: 0 as const,
    devPartnerId: kdxPartnerId,
  },
];

async function main() {
  console.log("🌱 Seeding...");
  validateSeedInput();

  await db.transaction(async (tx) => {
    const toInsertAppPermissions: (typeof schema.appPermissions.$inferInsert)[] =
      [];
    const toInsertAppRoleDefaults: (typeof schema.appRoleDefaults.$inferInsert)[] =
      [];
    const toInsertAppPermissionsToAppRoleDefaults: (typeof schema.appPermissionsToAppRoleDefaults.$inferInsert)[] =
      [];

    for (const [
      appId,
      { appRoleDefaults: appRole_defaults, appPermissions },
    ] of Object.entries(appRoles_defaultTree)) {
      toInsertAppRoleDefaults.push(
        ...appRole_defaults.map((appRoleDefault) => {
          //Remove relations
          const { AppPermissions: _, ...rest } = appRoleDefault;

          return { ...rest, appId };
        }),
      );

      if (appPermissions) {
        toInsertAppPermissions.push(
          ...appPermissions.map((appPermission) => ({
            ...appPermission,
            appId,
          })),
        );
      }

      appPermissions?.forEach((appPermission) => {
        appRole_defaults.forEach((appRoleDefault) => {
          toInsertAppPermissionsToAppRoleDefaults.push({
            appPermissionId: appPermission.id,
            appRoleDefaultId: appRoleDefault.id,
          });
        });
      });
    }

    await tx
      .insert(schema.devPartners)
      .values(devPartners)
      .onDuplicateKeyUpdate({
        set: allSetValues(devPartners),
      });
    await tx
      .insert(schema.apps)
      .values(apps)
      .onDuplicateKeyUpdate({
        set: allSetValues(apps),
      });
    await tx
      .insert(schema.appRoleDefaults)
      .values(toInsertAppRoleDefaults)
      .onDuplicateKeyUpdate({
        set: allSetValues(toInsertAppRoleDefaults),
      });
    await tx
      .insert(schema.appPermissions)
      .values(toInsertAppPermissions)
      .onDuplicateKeyUpdate({
        set: allSetValues(toInsertAppPermissions),
      });

    await tx.delete(schema.appPermissionsToAppRoleDefaults);
    await tx
      .insert(schema.appPermissionsToAppRoleDefaults)
      .values(toInsertAppPermissionsToAppRoleDefaults);
  });
}

//TODO: Understand how to upsert correctly https://github.com/drizzle-team/drizzle-orm/issues/1728
function allSetValues(values: Record<string, unknown>[]) {
  return Object.assign(
    {},
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
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    // void db.$disconnect();
  });
