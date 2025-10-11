import type { TRPCRouterRecord } from "@trpc/server";

import { salesRouter } from "./sales/_router";

export const caRouter = {
  sales: salesRouter,
} satisfies TRPCRouterRecord;
