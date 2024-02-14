import { revalidateTag } from "next/cache";
import { TRPCError } from "@trpc/server";
import cuid from "cuid";

import type { Session } from "@kdx/auth";
import type { Prisma, PrismaClient } from "@kdx/db";
import type { TInstallAppInputSchema } from "@kdx/validators/trpc/team";

interface InstallAppOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
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

  const team = await ctx.prisma.team.findUnique({
    where: {
      id: ctx.session.user.activeTeamId,
    },
  });
  if (!team)
    throw new TRPCError({
      message: "No Team Found",
      code: "NOT_FOUND",
    });

  if (team.ownerId !== ctx.session.user.id)
    throw new TRPCError({
      message: "Only the team owner can install apps",
      code: "FORBIDDEN",
    });

  const appUpdated = await ctx.prisma.$transaction(async (tx) => {
    const updatedApp = await tx.app.update({
      where: {
        id: input.appId,
      },
      data: {
        Teams: {
          connect: {
            id: team.id,
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

    const newAppRoles = defaultAppRoles.map(
      (role) =>
        ({
          id: cuid(),
          appId: role.appId,
          name: role.name,
          description: role.description,
          maxUsers: role.maxUsers,
          minUsers: role.minUsers,
          teamId: ctx.session.user.activeTeamId,
          appRole_defaultId: role.id,
        }) satisfies Prisma.TeamAppRoleCreateManyInput,
    );

    await tx.teamAppRole.createMany({
      data: newAppRoles,
    });

    const defaultRolesWithPerms = defaultAppRoles.filter(
      (x) => !!x.AppPermissions,
    );

    for (const defaultRole of defaultRolesWithPerms) {
      await tx.appRole_default.update({
        where: {
          id: defaultRole.id,
        },
        data: {
          AppPermissions: {
            connect: defaultRole.AppPermissions.map((perm) => ({
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
