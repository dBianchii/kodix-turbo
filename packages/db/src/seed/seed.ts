import { prisma } from "..";
import {
  calendarAppId,
  kdxPartnerId,
  kodixCareAdminRoleId,
  kodixCareAppId,
  kodixCareCareGiverRoleId,
  kodixCarePatientRoleId,
  todoAppId,
} from "./constants";

export const apps = [
  {
    id: todoAppId, //As const so it can be used as a type
    name: "Todo" as const,
    description: "Todo app" as const,
    subscriptionCost: 0 as const,
    devPartnerId: kdxPartnerId,
    url: "/todo" as const, //! Used as appIcon import (e.g.: /appIcons/todo.png)
  },
  {
    id: calendarAppId,
    name: "Calendar" as const,
    description: "Calendar app" as const,
    subscriptionCost: 0 as const,
    devPartnerId: kdxPartnerId,
    url: "/calendar" as const,
  },
  {
    id: kodixCareAppId,
    name: "Kodix Care" as const,
    description: "Kodix Care app" as const,
    subscriptionCost: 0 as const,
    devPartnerId: kdxPartnerId,
    url: "/kodixCare" as const,
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

(async () => {
  console.log("Seeding...");

  await prisma.devPartner.upsert({
    where: {
      id: kdxPartnerId,
    },
    update: {},
    create: {
      id: kdxPartnerId,
      name: "Kodix",
      partnerUrl: "kodix.com.br",
    },
  });

  for (const app of apps) {
    await prisma.app.upsert({
      where: {
        id: app.id,
      },
      update: app,
      create: app,
    });
  }
})()
  .then(() => {
    console.log("Done!");
  })
  .catch((e: Error) => {
    console.error(e.message);
  });
