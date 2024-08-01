import type { inferProcedureBuilderResolverOptions } from "@trpc/server";


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
export const publicProcedure = t.procedure;
export type TPublicProcedureContext = inferProcedureBuilderResolverOptions<
  typeof publicProcedure
>["ctx"];

