import { TRPCError } from "@trpc/server";

import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";
import { authorizedEmails } from "@kdx/shared";

interface NukeOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
}

export const nukeHandler = async ({ ctx }: NukeOptions) => {
  if (
    ctx.session.user.email &&
    !authorizedEmails.includes(ctx.session.user.email)
  )
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not authorized to do this",
    });

  await ctx.prisma.$transaction([
    ctx.prisma.eventMaster.deleteMany({
      where: { teamId: ctx.session.user.activeTeamId },
    }),
  ]);
};
