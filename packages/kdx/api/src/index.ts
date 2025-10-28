/** biome-ignore-all lint/style/noExportedImports: Should I remove this rule? */
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import type { KdxTRPCRouter } from "./trpc/root";
import { kdxTRPCRouter } from "./trpc/root";
import { createTRPCContext } from "./trpc/trpc";

export type RouterInputs = inferRouterInputs<KdxTRPCRouter>;

export type RouterOutputs = inferRouterOutputs<KdxTRPCRouter>;

// biome-ignore lint/performance/noBarrelFile: Tree-shakeable barrel file
export { nextTRPCHandler } from "@kodix/trpc/server";
export { kdxTRPCRouter, createTRPCContext };
export type { KdxTRPCRouter };
