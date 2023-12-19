/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */
import { initTRPC, TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import superjson from "superjson";
import { ZodError } from "zod";

import type { Session } from "@kdx/auth";
import { auth } from "@kdx/auth";
import { prisma } from "@kdx/db";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: {
  headers: Headers;
  session: Session | null;
}) => {
  const session = opts.session ?? (await auth());
  const source = opts.headers.get("x-trpc-source") ?? "unknown";

  console.log(">>> tRPC Request from", source, "by", session?.user);

  return {
    session,
    prisma,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure;

/**
 * Reusable middleware that enforces users are logged in before running the
 * procedure
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Protected (authed) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use
 * this. It verifies the session is valid and guarantees ctx.session.user is not
 * null
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 h"), //5 Requests per 1 hour
  analytics: true,
});
/**
 * Reusable middleware that limits by id
 */
export const rateLimitByUserIdAndWs = enforceUserIsAuthed.unstable_pipe(
  async ({ ctx, next }) => {
    const { success, reset } = await ratelimit.limit(
      `userId:${ctx.session.user.id} wsId:${ctx.session.user.activeTeamId}`,
    );
    if (!success)
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Too many requests. Please try again at ${new Date(
          reset,
        ).toString()}`,
      });

    return next({
      ctx,
    });
  },
);

/**
 * Protected (authed) procedure that limits by id and current active team
 *
 * This is the same as protectedProcedure, but it also rate limits per user and
 * current active teamId. This is using a shared cache, so it will rate
 * limit across all instances that use this same procedure.
 */
export const userAndWsLimitedProcedure = t.procedure.use(
  rateLimitByUserIdAndWs,
);
