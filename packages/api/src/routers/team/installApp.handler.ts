import { revalidateTag } from "next/cache";
import { TRPCError } from "@trpc/server";

import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";
import type { TInstallAppInputSchema } from "@kdx/validators/trpc/team";
import { appIdToAdminIdMap } from "@kdx/shared";

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
    },
  });
  if (!app)
    throw new TRPCError({
      message: "No App Found",
      code: "NOT_FOUND",
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

    const allDefaultRolesForApp = await tx.appRole_default.findMany({
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
      },
    });
    await tx.teamAppRole.createMany({
      data: allDefaultRolesForApp.map((role) => ({
        appId: role.appId,
        name: role.name,
        description: role.description,
        maxUsers: role.maxUsers,
        minUsers: role.minUsers,
        teamId: ctx.session.user.activeTeamId,
      })),
    });
    await tx.teamAppRole.update({
      where: {
        id: appIdToAdminIdMap[input.appId],
      },
      data: {
        Users: {
          connect: {
            id: ctx.session.user.id,
          },
        },
      },
    });

    return updatedApp;
  });

  revalidateTag("getAllForLoggedUser");

  return appUpdated;
};
