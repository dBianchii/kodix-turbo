"use client";

import type { QueryClient } from "@tanstack/react-query";
import type { AnyRouter } from "@trpc/server";
import type { createTRPCContext } from "@trpc/tanstack-react-query";
import { type PropsWithChildren, useState } from "react";
import { getBaseUrl } from "@kodix/shared/utils";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createTRPCClient,
  httpBatchStreamLink,
  loggerLink,
} from "@trpc/client";
import SuperJSON from "superjson";

import { createQueryClient } from "./query-client";

let clientQueryClientSingleton: QueryClient | undefined;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  if (!clientQueryClientSingleton) {
    clientQueryClientSingleton = createQueryClient();
  }
  return clientQueryClientSingleton;
};

interface TRPCReactProviderProps<TRouter extends AnyRouter>
  extends PropsWithChildren {
  readonly TRPCProvider: ReturnType<
    typeof createTRPCContext<TRouter>
  >["TRPCProvider"];
}

export function getTRPCClient<TRouter extends AnyRouter>(
  apiSource = "nextjs-react"
) {
  return createTRPCClient<TRouter>({
    links: [
      loggerLink({
        // biome-ignore lint/suspicious/noConsole: Just setting the console.log. not really calling it.
        console: { ...console, error: console.log },
        enabled: (op) =>
          process.env.NODE_ENV === "development" ||
          (op.direction === "down" && op.result instanceof Error),
      }),
      httpBatchStreamLink({
        headers() {
          const headers = new Headers();
          headers.set("x-trpc-source", apiSource);
          return headers;
        },
        transformer:
          SuperJSON as TRouter["_def"]["_config"]["$types"]["transformer"],
        url: `${getBaseUrl()}/api/trpc`,
      }),
    ],
  });
}

export function TRPCReactProvider<TRouter extends AnyRouter>({
  TRPCProvider,
  children,
}: TRPCReactProviderProps<TRouter>) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() => getTRPCClient<TRouter>());

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider queryClient={queryClient} trpcClient={trpcClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
