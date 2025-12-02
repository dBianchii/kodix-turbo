/** biome-ignore-all lint/performance/noBarrelFile: tree-shakeable barrel file */
import "server-only";

import type { CashTRPCRouter } from "@cash/api";
import { cache } from "react";
import { headers } from "next/headers";
import { cashTRPCRouter, createTRPCContext } from "@cash/api";
import { getQueryClient } from "@kodix/trpc/react/server";
import { experimental_nextAppDirCaller as nextAppDirCaller } from "@trpc/server/adapters/next-app-dir";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

import { adminProcedure, publicProcedure } from "../procedures";
import { createCallerFactory } from "../trpc";

const createCaller = createCallerFactory(cashTRPCRouter);

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

export const trpc = createTRPCOptionsProxy<CashTRPCRouter>({
  ctx: createContext,
  queryClient: getQueryClient,
  router: cashTRPCRouter,
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

export const adminAction = adminProcedure.experimental_caller(nextCaller);
