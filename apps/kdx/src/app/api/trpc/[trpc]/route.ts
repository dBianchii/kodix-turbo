import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter, createTRPCContext } from "@kdx/api";
import { auth } from "@kdx/auth";

import { OPTIONS, setCorsHeaders } from "../../_enableCors";

export const runtime = "nodejs";

const handler = auth(async (req) => {
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: () =>
      createTRPCContext({
        session: req.auth,
        headers: req.headers,
      }),
    onError({ error, path }) {
      console.error(`>>> tRPC Error on '${path}'`, error);
    },
  });

  setCorsHeaders(response);
  return response;
});

export { handler as GET, handler as POST, OPTIONS };
