/** biome-ignore-all lint/style/noExportedImports: Should I remove this rule? */
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import type { KdxTRPCRouter } from "./trpc/root";
import { kdxTRPCRouter } from "./trpc/root";
import { createTRPCContext } from "./trpc/trpc";

export type RouterInputs = inferRouterInputs<KdxTRPCRouter>;

export type RouterOutputs = inferRouterOutputs<KdxTRPCRouter>;

export { kdxTRPCRouter, createTRPCContext };
export type { KdxTRPCRouter };
