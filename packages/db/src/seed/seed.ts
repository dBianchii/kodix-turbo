import {
  calendarAdminRoleId,
  calendarAppId,
  kdxPartnerId,
  kdxProductionURL,
  kodixCareAdminRoleId,
  kodixCareAppId,
  kodixCareCareGiverRoleId,
  kodixCarePatientRoleId,
  todoAdminRoleId,
  todoAppId,
} from "@kdx/shared";

import { prisma } from "..";

export const apps = [
  {
    id: todoAppId, //As const so it can be used as a type
    subscriptionCost: 0 as const,
    devPartnerId: kdxPartnerId,
    AppRoles: {
      create: [
        {
          id: todoAdminRoleId,
          name: "Admin",
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
    AppRoles: {
      create: [
        {
          id: calendarAdminRoleId,
          name: "Admin",
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
    AppRoles: {
      create: [
        {
          id: kodixCareAdminRoleId,
          name: "Admin",
          minUsers: 1,
          maxUsers: 0,
        },
        {
          id: kodixCarePatientRoleId,
          name: "Patient",
          minUsers: 1,
          maxUsers: 1,
        },
        {
          id: kodixCareCareGiverRoleId,
          name: "CareGiver",
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
    const appExists = await prisma.app.findUnique({
      where: {
        id: app.id,
      },
    });

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
    console.log("🌳 Done!");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
