import { caRouter } from "./routers/ca/_router";
import { router } from "./trpc";

export const cashTRPCRouter = router({
  ca: caRouter,
});

export type CashTRPCRouter = typeof cashTRPCRouter;
