import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "./trpc/root";
import { appRouter } from "./trpc/root";
import { createCallerFactory, createTRPCContext } from "./trpc/trpc";

/**
 * Create a server-side caller for the tRPC API
 * @example
 * const trpc = createCaller(await createContext());
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller: any = (
  ctx: Awaited<ReturnType<typeof createTRPCContext>>,
) => {
  return createCallerFactory(appRouter)(ctx);
};

/**
 * Inference helpers for input types
 * @example
 * type PostByIdInput = RouterInputs['post']['byId']
 *      ^? { id: number }
 **/
type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example
 * type AllPostsOutput = RouterOutputs['post']['all']
 *      ^? Post[]
 **/
type RouterOutputs = inferRouterOutputs<AppRouter>;

export { createTRPCContext, appRouter };
export type { AppRouter, RouterInputs, RouterOutputs };

// 📊 Exportações do sistema de monitoramento
export { VercelAIMetrics } from "./internal/monitoring/vercel-ai-metrics";
export { AlertSystem } from "./internal/monitoring/alerts";
export type {
  ChatMetrics,
  MetricsSummary,
} from "./internal/monitoring/vercel-ai-metrics";
export type { Alert, AlertRule } from "./internal/monitoring/alerts";
