import { appRouter as _appRouter } from "./routers/app/_router"; //sad that I had to alias it lol
import { authRouter } from "./routers/auth/_router";
import { teamRouter } from "./routers/team/_router";
import { userRouter } from "./routers/user/_router";
import { router } from "./trpc";

export const appRouter = router({
  app: _appRouter,
  auth: authRouter,
  team: teamRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
