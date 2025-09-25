import "server-only";

import type { PropsWithChildren } from "react";
import type { TRPCQueryOptions } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { createQueryClient } from "./query-client";

export const getQueryClient = cache(createQueryClient);

export function HydrateClient({ children }: PropsWithChildren) {
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}

// biome-ignore lint/suspicious/noExplicitAny: <intentionally any>
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T
) {
  const queryClient = getQueryClient();

  if (queryOptions.queryKey[1]?.type === "infinite") {
    // eslint-disable-next-line no-void
    // biome-ignore lint/suspicious/noExplicitAny: <intentionally any>
    void queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    // eslint-disable-next-line no-void
    void queryClient.prefetchQuery(queryOptions);
  }
}

// biome-ignore lint/suspicious/noExplicitAny: <intentionally any>
export function batchPrefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptionsArray: T[]
) {
  const queryClient = getQueryClient();

  for (const queryOptions of queryOptionsArray) {
    if (queryOptions.queryKey[1]?.type === "infinite") {
      // eslint-disable-next-line no-void
      // biome-ignore lint/suspicious/noExplicitAny: <intentionally any>
      void queryClient.prefetchInfiniteQuery(queryOptions as any);
    } else {
      // eslint-disable-next-line no-void
      void queryClient.prefetchQuery(queryOptions);
    }
  }
}
