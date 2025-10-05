"use client";

import type { ComponentProps } from "react";
import type { CashTRPCRouter } from "@cash/api";
import { TRPCReactProvider } from "@kodix/trpc/react/trpc-react-provider";
import { createTRPCContext } from "@trpc/tanstack-react-query";

const trpcContext = createTRPCContext<CashTRPCRouter>();
export const { useTRPC, useTRPCClient } = trpcContext;

export const CashTRPCReactProvider = (
  props: Omit<
    ComponentProps<typeof TRPCReactProvider<CashTRPCRouter>>,
    "TRPCProvider"
  >
) => <TRPCReactProvider TRPCProvider={trpcContext.TRPCProvider} {...props} />;
