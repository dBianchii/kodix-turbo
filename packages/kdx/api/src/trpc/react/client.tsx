"use client";

import type { ComponentProps } from "react";
import { TRPCReactProvider } from "@kodix/trpc/react/trpc-react-provider";
import { createTRPCContext } from "@trpc/tanstack-react-query";

import type { KdxTRPCRouter } from "@kdx/api";

const trpcContext = createTRPCContext<KdxTRPCRouter>();
export const { useTRPC, useTRPCClient } = trpcContext;

export const KdxTRPCReactProvider = (
  props: Omit<
    ComponentProps<typeof TRPCReactProvider<KdxTRPCRouter>>,
    "TRPCProvider"
  >,
) => <TRPCReactProvider TRPCProvider={trpcContext.TRPCProvider} {...props} />;
