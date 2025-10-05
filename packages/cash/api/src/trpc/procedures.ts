import type { inferProcedureBuilderResolverOptions } from "@trpc/server";
import { auth } from "@cash/auth";
import { TRPCError } from "@trpc/server";

import { commonProcedures } from "./trpc";

//? This file should ONLY EXPORT procedures and their context types. Do not export anything else from this file because they are read by @kdx/trpc-cli
//? Also, please export them as constants inline, exactly like the others <3

const { baseProcedure } = commonProcedures;

export const publicProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const authResponse = await auth();

  return next({
    ctx: {
      ...ctx,
      auth: authResponse,
    },
  });
});
export type TPublicProcedureContext = inferProcedureBuilderResolverOptions<
  typeof publicProcedure
>["ctx"];

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
