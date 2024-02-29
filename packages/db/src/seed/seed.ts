import {
  calendarAdminRoleDefaultId,
  calendarAppId,
  getAppRole_defaultRoleName,
  kdxPartnerId,
  kdxProductionURL,
  kodixCareAdminRoleDefaultId,
  kodixCareAppId,
  kodixCareCareGiverRoleDefaultId,
  kodixCarePatientRoleDefaultId,
  PKodixCare_CanToggleShiftId,
  todoAdminRoleDefaultId,
  todoAppId,
} from "@kdx/shared";

import type { Prisma } from "..";
import { prisma } from "..";

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

//TODO: definir abstracao de roles default em uma arvore como essa
//TODO: Cada app deve ter um numero de permissoes definidas. E ao definir a arvore de roles com as suas permissoes, deve-se garantir que todas as permissoes estejam definidas.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const estrutura = {
  apps: {
    [kodixCareAppId]: {
      Roles: {
        name: "Admin",
        description: "Admin do KodixCare",
        permissions: [PKodixCare_CanToggleShiftId],
      },
    },
  },
};

const appRole_defaults: Prisma.AppRole_defaultUpsertArgs["create"][] = [
  {
    id: todoAdminRoleDefaultId,
    name: getAppRole_defaultRoleName(todoAdminRoleDefaultId),
    minUsers: 1,
    maxUsers: 0,
    appId: todoAppId,
  },
  {
    id: calendarAdminRoleDefaultId,
    name: getAppRole_defaultRoleName(calendarAdminRoleDefaultId),
    minUsers: 1,
    maxUsers: 0,
    appId: calendarAppId,
  },
  {
    id: kodixCarePatientRoleDefaultId,
    name: getAppRole_defaultRoleName(kodixCarePatientRoleDefaultId),
    minUsers: 1,
    maxUsers: 1,
    appId: kodixCareAppId,
  },
  {
    id: kodixCareCareGiverRoleDefaultId,
    name: getAppRole_defaultRoleName(kodixCareCareGiverRoleDefaultId),
    minUsers: 1,
    maxUsers: 0,
    appId: kodixCareAppId,
  },
  {
    id: kodixCareAdminRoleDefaultId,
    name: getAppRole_defaultRoleName(kodixCareAdminRoleDefaultId),
    minUsers: 1,
    maxUsers: 0,
    appId: kodixCareAppId,
  },
];

const appPermissions: Prisma.AppPermissionUpsertArgs["create"][] = [
  {
    id: PKodixCare_CanToggleShiftId,
    name: "CanToggleShift",
    appId: kodixCareAppId,
    AppRole_defaults: {
      connect: {
        id: kodixCareAdminRoleDefaultId,
      },
    },
  },
];

async function main() {
  console.log("🌱 Seeding...");

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

      for (const role of appRole_defaults)
        await tx.appRole_default.upsert({
          where: {
            id: role.id,
          },
          update: role,
          create: role,
        });

      for (const appPermission of appPermissions)
        await tx.appPermission.upsert({
          where: {
            id: appPermission.id,
          },
          update: appPermission,
          create: {
            ...appPermission,
            AppRole_defaults: {
              connect: [
                { id: kodixCareAdminRoleDefaultId },
                { id: kodixCareCareGiverRoleDefaultId },
              ],
            },
          },
        });
    },
    { maxWait: 1000000000 },
  );
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
