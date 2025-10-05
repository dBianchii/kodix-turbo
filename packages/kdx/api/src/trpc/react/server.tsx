/** biome-ignore-all lint/performance/noBarrelFile: tree-shakeable barrel file */
import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { getQueryClient } from "@kodix/trpc/react/server";
import { experimental_nextAppDirCaller as nextAppDirCaller } from "@trpc/server/adapters/next-app-dir";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

import type { KdxTRPCRouter } from "@kdx/api";
import { createTRPCContext, kdxTRPCRouter } from "@kdx/api";

import { publicProcedure } from "../procedures";
import { createCallerFactory } from "../trpc";

const createCaller = createCallerFactory(kdxTRPCRouter);

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
});

export const trpcCaller = createCaller(createContext);

export const trpc = createTRPCOptionsProxy<KdxTRPCRouter>({
  ctx: createContext,
  queryClient: getQueryClient,
  router: kdxTRPCRouter,
});

export {
  batchPrefetch,
  getQueryClient,
  HydrateClient,
  prefetch,
} from "@kodix/trpc/react/server";

/* Server Actions */
const nextCaller = nextAppDirCaller({
  createContext: async () => createTRPCContext({ headers: await headers() }),
});

export const publicAction = publicProcedure.experimental_caller(nextCaller);
