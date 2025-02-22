import type { inferProcedureBuilderResolverOptions } from "@trpc/server";
import { TRPCError } from "@trpc/server";

import { initializeRepositoriesForTeams } from "./initializeRepositories";
import { t } from "./trpc";

//? This file should ONLY EXPORT procedures and their context types. Do not export anything else from this file because they are read by @kdx/trpc-cli
//? Also, please export them as constants inline, exactly like the others <3

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure; // t.procedure.use(timingMiddleware);
export type TPublicProcedureContext = inferProcedureBuilderResolverOptions<
  typeof publicProcedure
>["ctx"];

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.auth.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.auth.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      // infers the `user` and `session` as non-nullable
      auth: ctx.auth,
      repositories: initializeRepositoriesForTeams([
        ctx.auth.user.activeTeamId,
      ]),
    },
  });
});
export type TProtectedProcedureContext = inferProcedureBuilderResolverOptions<
  typeof protectedProcedure
>["ctx"];

export const isTeamOwnerProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const { teamRepository } = ctx.repositories;
    const team = await teamRepository.findTeamById();

    if (!team)
      throw new TRPCError({
        message: ctx.t("api.No Team Found"),
        code: "NOT_FOUND",
      });

    if (team.ownerId !== ctx.auth.user.id)
      throw new TRPCError({
        message: ctx.t("api.Only the team owner can perform this action"),
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
