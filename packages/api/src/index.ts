import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "./routers/root";
import { appRouter } from "./routers/root";
import { createCallerFactory, createTRPCContext } from "./trpc";

export { createappRouterCaller } from "~/generated/trpc/app";

export { createTRPCContext, appRouter };
export type { AppRouter };
