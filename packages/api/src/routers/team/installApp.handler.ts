import { revalidateTag } from "next/cache";
import { TRPCError } from "@trpc/server";
import cuid from "cuid";

import type { Session } from "@kdx/auth";
import type { Prisma, PrismaClient } from "@kdx/db";
import type { TInstallAppInputSchema } from "@kdx/validators/trpc/team";
import { appIdToAdminRole_defaultIdMap } from "@kdx/shared";

interface InstallAppOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
    team: {
      //TODO:
      id: string;
    };
  };
  input: TInstallAppInputSchema;
}

export const installAppHandler = async ({ ctx, input }: InstallAppOptions) => {
  const app = await ctx.prisma.app.findUnique({
    where: {
      id: input.appId,
      Teams: {
        some: {
          id: ctx.session.user.activeTeamId,
        },
      },
    },
  });
  if (app)
    throw new TRPCError({
      message: "App already installed",
      code: "BAD_REQUEST",
    });

  const appUpdated = await ctx.prisma.$transaction(async (tx) => {
    const updatedApp = await tx.app.update({
      where: {
        id: input.appId,
      },
      data: {
        Teams: {
          connect: {
            id: ctx.team.id,
          },
        },
      },
      select: {
        id: true,
      },
    });

    const defaultAppRoles = await tx.appRole_default.findMany({
      where: {
        appId: input.appId,
      },
      select: {
        appId: true,
        maxUsers: true,
        minUsers: true,
        description: true,
        id: true,
        name: true,
        AppPermissions: true,
      },
    });

    const toCopyAppRoles = defaultAppRoles.map((role) => ({
      id: cuid(),
      appId: role.appId,
      name: role.name,
      description: role.description,
      maxUsers: role.maxUsers,
      minUsers: role.minUsers,
      teamId: ctx.session.user.activeTeamId,
      appRole_defaultId: role.id,
      AppPermissions: role.AppPermissions,
    }));

    await tx.teamAppRole.createMany({
      data: toCopyAppRoles.map((role) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { AppPermissions, ...rest } = role;

        const roleWithoutAppPermission: Prisma.TeamAppRoleCreateManyInput =
          rest;

        return roleWithoutAppPermission;
      }),
    });

    const copiedRolesWithPerms = toCopyAppRoles.filter(
      (x) => !!x.AppPermissions,
    );

    for (const copiedRole of copiedRolesWithPerms) {
      const adminRoleId = appIdToAdminRole_defaultIdMap[input.appId];
      const shouldGiveCurrentUserThisRole =
        copiedRole.appRole_defaultId === adminRoleId;

      let Users:
        | undefined
        | {
            connect: { id: string };
          };
      if (shouldGiveCurrentUserThisRole)
        Users = {
          connect: { id: ctx.session.user.id },
        };

      await tx.teamAppRole.update({
        where: {
          id: copiedRole.id,
        },
        data: {
          Users,
          AppPermissions: {
            connect: copiedRole.AppPermissions.map((perm) => ({
              id: perm.id,
            })),
          },
        },
      });
    }

    return updatedApp;
  });

  revalidateTag("getAllForLoggedUser");

  return appUpdated;
};
