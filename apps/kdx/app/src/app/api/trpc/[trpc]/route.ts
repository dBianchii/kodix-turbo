import type { NextRequest } from "next/server";
import { nextTRPCHandler } from "@kodix/trpc/server";

import { createTRPCContext, kdxTRPCRouter } from "@kdx/api";

import { OPTIONS, setCorsHeaders } from "../../_enableCors";

const handler = async (req: NextRequest) => {
  const response = await nextTRPCHandler(req, {
    router: kdxTRPCRouter,
    createContext: ({ headers }) => createTRPCContext({ headers }),
  });

  setCorsHeaders(response);
  return response;
};

export { handler as GET, OPTIONS, handler as POST };
