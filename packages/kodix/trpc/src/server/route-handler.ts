import type { NextRequest } from "next/server";
import type { AnyRouter } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

type CreateContextFn<TRouter extends AnyRouter> = (opts: {
  headers: Headers;
}) => TRouter["_def"]["_config"]["$types"]["ctx"];

export interface NextTRPCHandlerOptions<TRouter extends AnyRouter> {
  router: TRouter;
  createContext: CreateContextFn<TRouter>;
}

export function nextTRPCHandler<TRouter extends AnyRouter>(
  req: NextRequest,
  { router, createContext }: NextTRPCHandlerOptions<TRouter>
) {
  return fetchRequestHandler({
    createContext: () => createContext({ headers: req.headers }),
    endpoint: "/api/trpc",
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            // biome-ignore lint/suspicious/noConsole: <intentionally logging>
            console.error(`❌ tRPC failed on ${path ?? "<no-path>"}:`, error);
          }
        : undefined,
    req,
    router,
  });
}
