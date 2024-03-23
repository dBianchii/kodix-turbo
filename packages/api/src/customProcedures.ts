import type { inferProcedureBuilderResolverOptions } from "@trpc/server";
import { TRPCError } from "@trpc/server";

import { eq, schema } from "@kdx/db";

import { protectedProcedure } from "./trpc";

export const isTeamOwnerProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    // const team = await ctx.prisma.team.findUnique({
    //   where: {
    //     id: ctx.session.user.activeTeamId,
    //   },
    // });
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
  },
);
export type TIsTeamOwnerProcedureContext = inferProcedureBuilderResolverOptions<
  typeof isTeamOwnerProcedure
>["ctx"];
