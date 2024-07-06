import { TRPCError } from "@trpc/server";

import { serverActionProcedure } from "@kdx/api";
import { eq } from "@kdx/db";
import { schema } from "@kdx/db/schema";

export const publicAction = serverActionProcedure;

export const protectedAction = serverActionProcedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const isTeamOwnerAction = protectedAction.use(async ({ ctx, next }) => {
  const team = await ctx.db.query.teams.findFirst({
    where: eq(schema.teams.id, ctx.session.user.activeTeamId),
    columns: {
      id: true,
      ownerId: true,
    },
  });

  if (!team)
    throw new TRPCError({
      message: "No Team Found",
      code: "NOT_FOUND",
    });

  if (team.ownerId !== ctx.session.user.id)
    throw new TRPCError({
      message: "Only the team's owner can do this",
      code: "FORBIDDEN",
    });

  return next({
    ctx: {
      ...ctx,
      team,
    },
  });
});
