"use client";

import type { ComponentProps } from "react";
import { TRPCReactProvider } from "@kodix/trpc/react/trpc-react-provider";
import { createTRPCContext } from "@trpc/tanstack-react-query";

import type { AppRouter } from "@kdx/api";

const trpcContext = createTRPCContext<AppRouter>();
export const { useTRPC, useTRPCClient } = trpcContext;

export const KdxTRPCReactProvider = (
  props: Omit<
    ComponentProps<typeof TRPCReactProvider<AppRouter>>,
    "TRPCProvider"
  >,
) => <TRPCReactProvider TRPCProvider={trpcContext.TRPCProvider} {...props} />;
