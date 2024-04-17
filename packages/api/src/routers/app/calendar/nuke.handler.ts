import { TRPCError } from "@trpc/server";

import { eq } from "@kdx/db";
import { schema } from "@kdx/db/schema";
import { authorizedEmails } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../procedures";

interface NukeOptions {
  ctx: TProtectedProcedureContext;
}

export const nukeHandler = async ({ ctx }: NukeOptions) => {
  if (!authorizedEmails.includes(ctx.session.user.email))
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not authorized to do this",
    });

  await ctx.db
    .delete(schema.eventMasters)
    .where(eq(schema.eventMasters.teamId, ctx.session.user.activeTeamId));
};
