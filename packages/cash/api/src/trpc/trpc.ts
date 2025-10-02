import { createTRPC } from "@kodix/trpc/server";

export const {
  router,
  createCallerFactory,
  createTRPCContext,
  commonProcedures,
} = createTRPC();
