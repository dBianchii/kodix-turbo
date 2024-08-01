import { appRouter as _appRouter } from "./routers/app/_router"; //sad that I had to alias it lol
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  app: _appRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
