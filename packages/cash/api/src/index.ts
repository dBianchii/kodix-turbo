/** biome-ignore-all lint/style/noExportedImports: Should I remove this rule? */
/** biome-ignore-all lint/performance/noBarrelFile: Should I remove this rule? */
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import type { CashTRPCRouter } from "./trpc/root";
import { cashTRPCRouter } from "./trpc/root";
import { createTRPCContext } from "./trpc/trpc";

export type RouterInputs = inferRouterInputs<CashTRPCRouter>;

export type RouterOutputs = inferRouterOutputs<CashTRPCRouter>;

export { nextTRPCHandler } from "@kodix/trpc/server";
export { cashTRPCRouter, createTRPCContext };
export type { CashTRPCRouter };
