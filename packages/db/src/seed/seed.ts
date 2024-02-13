import {
  calendarAdminRoleId,
  calendarAppId,
  getRoleName,
  kdxPartnerId,
  kdxProductionURL,
  kodixCareAdminRoleId,
  kodixCareAppId,
  kodixCareCareGiverRoleId,
  kodixCarePatientRoleId,
  PKodixCare_CanToggleShiftId,
  todoAdminRoleId,
  todoAppId,
} from "@kdx/shared";

import type { Prisma } from "..";
import { prisma } from "..";

export const apps: Prisma.AppUpsertArgs["create"][] = [
  {
    id: todoAppId, //As const so it can be used as a type
    subscriptionCost: 0 as const,
    devPartnerId: kdxPartnerId,
    AppRole_defaults: {
      create: [
        {
          id: todoAdminRoleId,
          name: getRoleName(todoAdminRoleId),
          minUsers: 1,
          maxUsers: 0,
        },
      ],
    },
  },
  {
    id: calendarAppId,
    subscriptionCost: 0 as const,
    devPartnerId: kdxPartnerId,
    AppRole_defaults: {
      create: [
        {
          id: calendarAdminRoleId,
          name: getRoleName(calendarAdminRoleId),
          minUsers: 1,
          maxUsers: 0,
        },
      ],
    },
  },
  {
    id: kodixCareAppId,
    subscriptionCost: 0 as const,
    devPartnerId: kdxPartnerId,
    AppRole_defaults: {
      create: [
        {
          id: kodixCareAdminRoleId,
          name: getRoleName(kodixCareAdminRoleId),
          minUsers: 1,
          maxUsers: 0,
          AppPermissions: {
            connectOrCreate: {
              create: {
                id: PKodixCare_CanToggleShiftId,
                name: "Can Toggle Shift",
                appId: kodixCareAppId,
              },
              where: {
                id: PKodixCare_CanToggleShiftId,
              },
            },
          },
        },
        {
          id: kodixCarePatientRoleId,
          name: getRoleName(kodixCarePatientRoleId),
          minUsers: 1,
          maxUsers: 1,
        },
        {
          id: kodixCareCareGiverRoleId,
          name: getRoleName(kodixCareCareGiverRoleId),
          minUsers: 1,
          maxUsers: 0,
        },
      ],
    },
  },
];

async function main() {
  console.log("🌱 Seeding...");

  await prisma.devPartner.upsert({
    where: {
      id: kdxPartnerId,
    },
    update: {},
    create: {
      id: kdxPartnerId,
      name: "Kodix",
      partnerUrl: kdxProductionURL,
    },
  });

  for (const app of apps) {
    const appExists = !!(await prisma.app.findUnique({
      where: {
        id: app.id,
      },
    }));

    if (appExists) {
      console.log(`App ${app.id} already exists, skipping...`);
      continue;
    }
    await prisma.app.upsert({
      where: {
        id: app.id,
      },
      update: {},
      create: app,
    });
  }
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
