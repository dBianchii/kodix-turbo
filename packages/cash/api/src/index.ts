/** biome-ignore-all lint/style/noExportedImports: Should I remove this rule? */
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import type { CashTRPCRouter } from "./trpc/root";
import { cashTRPCRouter } from "./trpc/root";
import { createCallerFactory, createTRPCContext } from "./trpc/trpc";

const createCaller = createCallerFactory(cashTRPCRouter);

type RouterInputs = inferRouterInputs<CashTRPCRouter>;

type RouterOutputs = inferRouterOutputs<CashTRPCRouter>;

export { createTRPCContext, cashTRPCRouter, createCaller };
export type { CashTRPCRouter, RouterInputs, RouterOutputs };
