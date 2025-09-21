import type { inferProcedureBuilderResolverOptions } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { getFormatter, getTranslations } from "next-intl/server";

import { auth } from "@kdx/auth";
import { teamRepository } from "@kdx/db/repositories";

import { initializeServices } from "../services";
import { getLocaleBasedOnCookie } from "../utils/locales";
import { commonProcedures } from "./trpc";

//? This file should ONLY EXPORT procedures and their context types. Do not export anything else from this file because they are read by @kdx/trpc-cli
//? Also, please export them as constants inline, exactly like the others <3

const { baseProcedure } = commonProcedures;

export const publicProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const authToken = ctx.headers.get("Authorization") ?? null;

  const authResponse = await auth();

  const source = ctx.headers.get("x-trpc-source") ?? "unknown";
  console.log(">>> tRPC Request from", source, "by", authResponse?.user);
  const locale = await getLocaleBasedOnCookie();
  const t = await getTranslations({ locale });
  const format = await getFormatter({ locale });
  const services = initializeServices({ t });

  return next({
    ctx: {
      ...ctx,
      format,
      services,
      t,
      auth: authResponse,
      token: authToken,
    },
  });
});
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
    },
  });
});
export type TProtectedProcedureContext = inferProcedureBuilderResolverOptions<
  typeof protectedProcedure
>["ctx"];

export const isTeamOwnerProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const team = await teamRepository.findTeamById(ctx.auth.user.activeTeamId);

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
