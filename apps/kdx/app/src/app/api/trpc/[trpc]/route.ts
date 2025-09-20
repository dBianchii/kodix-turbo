import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter, createTRPCContext } from "@kdx/api";
import { auth } from "@kdx/auth";
import { env } from "@kdx/env";

import { OPTIONS, setCorsHeaders } from "../../_enableCors";

export const runtime = "nodejs";

const handler = async (req: Request) => {
  const authResponse = await auth();

  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: () =>
      createTRPCContext({
        auth: authResponse,
        headers: req.headers,
      }),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
          }
        : undefined,
  });

  setCorsHeaders(response);
  return response;
};

export { handler as GET, handler as POST, OPTIONS };
