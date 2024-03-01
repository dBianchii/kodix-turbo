import {
  calendarAppId,
  kdxPartnerId,
  kdxProductionURL,
  kodixCareAppId,
  todoAppId,
} from "@kdx/shared";

import type { Prisma } from "..";
import { prisma } from "..";
import { appRoles_defaultTree } from "./appRoles_defaultTree";

const devPartners: Prisma.DevPartnerUpsertArgs["create"][] = [
  {
    id: kdxPartnerId,
    name: "Kodix",
    partnerUrl: kdxProductionURL,
  },
];

export const apps: Prisma.AppUpsertArgs["create"][] = [
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

  await prisma.$transaction(
    async (tx) => {
      for (const devPartner of devPartners)
        await tx.devPartner.upsert({
          where: {
            id: devPartner.id,
          },
          update: devPartner,
          create: devPartner,
        });

      for (const app of apps)
        await tx.app.upsert({
          where: {
            id: app.id,
          },
          update: app,
          create: app,
        });

      for (const [
        appId,
        { appRole_defaults, appPermissions },
      ] of Object.entries(appRoles_defaultTree)) {
        for (const { id, AppPermissions: _, ...role } of appRole_defaults) {
          const updateOrCreate: Prisma.AppPermissionUpsertArgs["create"] = {
            ...role,
            appId,
          };
          await tx.appRole_default.upsert({
            where: { id },
            update: updateOrCreate,
            create: updateOrCreate,
          });
        }

        for (const appPermission of appPermissions ?? []) {
          const rolesToAdd = appRole_defaults
            .filter((role) => role.AppPermissions.includes(appPermission.id))
            .map((role) => ({ id: role.id }));

          const create: Prisma.AppPermissionUpsertArgs["create"] = {
            appId,
            ...appPermission,
            AppRole_defaults: {
              connect: rolesToAdd,
            },
          };

          await tx.appPermission.upsert({
            where: { id: appPermission.id },
            update: {
              ...create,
              AppRole_defaults: {
                set: [], //Disconnect all roles and reconnect them
                connect: rolesToAdd,
              },
            },
            create: create,
          });
        }
      }
    },
    { maxWait: 1000000000 },
  );
}

function validateSeedInput() {
  //? 1. Validate that all appPermissions are assigned to at least one role in their designated app
  for (const [appId, { appRole_defaults, appPermissions }] of Object.entries(
    appRoles_defaultTree,
  )) {
    const allPermissionsInRoles = appRole_defaults.flatMap(
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
  console.log("🌱 - ✅ Seed input validation passed!");
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
    void prisma.$disconnect();
  });
