import { createTRPCRouter } from "../trpc";
import { appRouter as _appRouter } from "./app/_app.router"; //sad that I had to alias it lol
import { authRouter } from "./auth/_auth.router";
import { teamRouter } from "./team/_team.router";
import { userRouter } from "./user/_user.router";

export const appRouter = createTRPCRouter({
  app: _appRouter,
  auth: authRouter,
  team: teamRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
