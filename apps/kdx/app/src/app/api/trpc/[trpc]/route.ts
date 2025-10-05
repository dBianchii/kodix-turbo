import type { NextRequest } from "next/server";

import { createTRPCContext, kdxTRPCRouter, nextTRPCHandler } from "@kdx/api";

import { OPTIONS, setCorsHeaders } from "../../_enableCors";

const handler = async (req: NextRequest) => {
  const response = await nextTRPCHandler(req, {
    createContext: ({ headers }) => createTRPCContext({ headers }),
    router: kdxTRPCRouter,
  });

  setCorsHeaders(response);
  return response;
};

export { handler as GET, OPTIONS, handler as POST };
