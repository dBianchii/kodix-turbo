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
    });
    await tx.userAppRole.create({
      data: {
        App: {
          connect: {
            id: input.appId,
          },
        },
        User: {
          connect: {
            id: ctx.session.user.id,
          },
        },
        Team: {
          connect: {
            id: ctx.session.user.activeTeamId,
          },
        },
        AppRole: {
          connect: {
            id: appIdToAdminIdMap[input.appId],
          },
        },
      },
    });

    return updatedApp;
  });

  revalidateTag("getAllForLoggedUser");

  return appUpdated;
};
