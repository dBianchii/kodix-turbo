import { salesRouter } from "./routers/sales/_router";
import { router } from "./trpc";

export const cashTRPCRouter = router({
  sales: salesRouter,
});

export type CashTRPCRouter = typeof cashTRPCRouter;
