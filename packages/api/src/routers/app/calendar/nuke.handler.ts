import { TRPCError } from "@trpc/server";

import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";
import { eq, schema } from "@kdx/db";
import { authorizedEmails } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../trpc";

interface NukeOptions {
  ctx: TProtectedProcedureContext;
}

export const nukeHandler = async ({ ctx }: NukeOptions) => {
  if (!authorizedEmails.includes(ctx.session.user.email))
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not authorized to do this",
    });

  // await ctx.prisma.$transaction([
  //   ctx.prisma.eventMaster.deleteMany({
  //     where: { teamId: ctx.session.user.activeTeamId },
  //   }),
  // ]);
  await ctx.db
    .delete(schema.eventMasters)
    .where(eq(schema.eventMasters.teamId, ctx.session.user.activeTeamId));
};
