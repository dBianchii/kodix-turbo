import { initTRPC } from "@trpc/server";
import SuperJSON from "superjson";
import z, { ZodError } from "zod";

const DEV_DELAY_MS = 400;
const DEV_DELAY_MIN_MS = 100;

/** Shared server-side tRPC creation logic. */
export const createTRPC = <
  // biome-ignore lint/suspicious/noExplicitAny: <intentionally any>
  Meta extends Record<string, any> = Record<string, never>,
>() => {
  /**
   * @see https://trpc.io/docs/server/context
   */
  const createTRPCContext = (opts: { headers: Headers }) => ({
    auth: null,
    ...opts,
  });

  /**
   * This is where the trpc api is initialized, connecting the context and
   * transformer.
   */
  const t = initTRPC
    .context<typeof createTRPCContext>()
    .meta<Meta>()
    .create({
      errorFormatter({ shape, error }) {
        return {
          ...shape,
          data: {
            ...shape.data,
            zodError:
              error.cause instanceof ZodError
                ? z.treeifyError(error.cause)
                : null,
          },
        };
      },
      transformer: SuperJSON,
    });

  /**
   * Middleware for timing procedure. Useful for helping catch unwanted waterfalls
   * by simulating network latency that would occur in production but not in local
   * development.
   */
  const timingMiddleware = t.middleware(async ({ next, ctx, path }) => {
    if (t._config.isDev) {
      // Artificial delay in dev
      // biome-ignore lint/suspicious/noConsole: <Log server-side calls when developing>
      console.log(
        ">>> tRPC Request from",
        ctx.headers.get("x-trpc-source"),
        "for",
        path,
      );

      const waitMs =
        Math.floor(Math.random() * DEV_DELAY_MS) + DEV_DELAY_MIN_MS;
      await new Promise((resolve) => {
        setTimeout(resolve, waitMs);
      });
    }

    const result = await next();

    return result;
  });

  const baseProcedure = t.procedure.use(timingMiddleware);

  return {
    commonProcedures: {
      baseProcedure,
    },
    createCallerFactory: t.createCallerFactory,
    createTRPCContext,
    router: t.router,
  };
};
