import { appRouter as _appRouter } from "./routers/app/_router"; //sad that I had to alias it lol
import { teamRouter } from "./routers/team/_router";
import { userRouter } from "./routers/user/_router";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  app: _appRouter,
  team: teamRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
