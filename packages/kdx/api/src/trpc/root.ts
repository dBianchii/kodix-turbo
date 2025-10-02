import { appRouter } from "./routers/app/_router";
import { authRouter } from "./routers/auth/_router";
import { teamRouter } from "./routers/team/_router";
import { userRouter } from "./routers/user/_router";
import { router } from "./trpc";

export const kdxTRPCRouter = router({
  app: appRouter,
  auth: authRouter,
  team: teamRouter,
  user: userRouter,
});

export type KdxTRPCRouter = typeof kdxTRPCRouter;
