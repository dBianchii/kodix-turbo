import type { inferProcedureBuilderResolverOptions } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { eq, schema } from "@kdx/db";

import { protectedProcedure } from "./trpc";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 h"), //5 Requests per 1 hour
  analytics: true,
});

/**
 * Protected (authed) procedure that limits by id and current active team
 *
 * This is the same as protectedProcedure, but it also rate limits per user and
 * current active teamId. This is using a shared cache, so it will rate
 * limit across all instances that use this same procedure.
 */
export const userAndTeamLimitedProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const { success, reset } = await ratelimit.limit(
      `userId:${ctx.session.user.id} teamId:${ctx.session.user.activeTeamId}`,
    );
    if (!success)
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Too many requests. Please try again at ${new Date(
          reset,
        ).toString()}`,
      });

    return next({
      ctx,
    });
  },
);
export type TUserAndTeamLimitedProcedureContext =
  inferProcedureBuilderResolverOptions<
    typeof userAndTeamLimitedProcedure
  >["ctx"];

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
