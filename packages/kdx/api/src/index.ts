import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import type { KdxTRPCRouter } from "./trpc/root";
import { kdxTRPCRouter } from "./trpc/root";
import { createCallerFactory, createTRPCContext } from "./trpc/trpc";

const createCaller = createCallerFactory(kdxTRPCRouter);

type RouterInputs = inferRouterInputs<KdxTRPCRouter>;

type RouterOutputs = inferRouterOutputs<KdxTRPCRouter>;

export { createTRPCContext, kdxTRPCRouter, createCaller };
export type { KdxTRPCRouter, RouterInputs, RouterOutputs };
