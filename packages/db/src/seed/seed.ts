import { prisma } from "..";

const kdxPartnerId = "clh9tiqsj000835711pg3sskn";

export const kodixCareAdminRoleId = "clq5yvcvu000008ia3yppfnou";

const apps = [
  {
    id: "clj2117860007skypdpzj0k1u", //As const so it can be used as a type
    name: "Todo" as const,
    description: "Todo app" as const,
    subscriptionCost: 0 as const,
    devPartnerId: kdxPartnerId,
    url: "/todo" as const, //! Used as appIcon import (e.g.: /appIcons/todo.png)
  },
  {
    id: "clohjphbm000008ju6oywfy4i",
    name: "Calendar" as const,
    description: "Calendar app" as const,
    subscriptionCost: 0 as const,
    devPartnerId: kdxPartnerId,
    url: "/calendar" as const,
  },
  {
    id: "clj2117860009skyp5e613fih",
    name: "Kodix Care" as const,
    description: "Kodix Care app" as const,
    subscriptionCost: 0 as const,
    devPartnerId: kdxPartnerId,
    url: "/kodixCare" as const,
    appRoles: {
      create: [
        {
          id: kodixCareAdminRoleId,
          name: "Admin",
          minUsers: 1,
          maxUsers: 0,
        },
        {
          id: "clq5yvhuz000108ia55qk06ts",
          name: "Patient",
          minUsers: 1,
          maxUsers: 1,
        },
        {
          id: "clq5yvqdg000208ia3861eyow",
          name: "CareGiver",
          minUsers: 1,
          maxUsers: 0,
        },
      ],
    },
  },
];

export type KodixApp = Omit<(typeof apps)[number], "appRoles">;

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
