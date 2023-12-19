import { appsRouter } from "./router/apps";
import { authRouter } from "./router/auth";
import { eventRouter } from "./router/event";
import { kodixCareRouter } from "./router/kodixcare";
import { postRouter } from "./router/post";
import { teamRouter } from "./router/team/team";
import { testRouter } from "./router/test";
import { todoRouter } from "./router/todo";
import { userRouter } from "./router/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  app: appsRouter,
  auth: authRouter,
  user: userRouter,
  team: teamRouter,
  todo: todoRouter,
  event: eventRouter,
  post: postRouter,
  test: testRouter,
  kodixCare: kodixCareRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
