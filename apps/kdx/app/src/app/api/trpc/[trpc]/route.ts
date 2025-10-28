import type { NextRequest } from "next/server";

import { createTRPCContext, kdxTRPCRouter, nextTRPCHandler } from "@kdx/api";

import { setCorsHeaders } from "../../enable-cors";

const handler = async (req: NextRequest) => {
  const response = await nextTRPCHandler(req, {
    createContext: ({ headers }) => createTRPCContext({ headers }),
    router: kdxTRPCRouter,
  });

  setCorsHeaders(response);
  return response;
};

export { handler as GET, handler as POST };

// biome-ignore lint/performance/noBarrelFile: Need to export OPTIONS here
export { OPTIONS } from "../../enable-cors";
