import { clientRouter } from "./routers/client/_router";
import { salesRouter } from "./routers/sales/_router";
import { router } from "./trpc";

export const cashTRPCRouter = router({
  client: clientRouter,
  sales: salesRouter,
});

export type CashTRPCRouter = typeof cashTRPCRouter;
