import type { TRPCRouterRecord } from "@trpc/server";

import { clientRouter } from "./client/_router";
import { voucherRouter } from "./voucher/_router";

export const adminRouter = {
  client: clientRouter,
  voucher: voucherRouter,
} satisfies TRPCRouterRecord;
