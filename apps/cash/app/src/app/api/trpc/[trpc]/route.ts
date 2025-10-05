import type { NextRequest } from "next/server";
import { cashTRPCRouter, createTRPCContext, nextTRPCHandler } from "@cash/api";

const handler = async (req: NextRequest) => {
  const response = await nextTRPCHandler(req, {
    createContext: ({ headers }) => createTRPCContext({ headers }),
    router: cashTRPCRouter,
  });

  return response;
};

export { handler as GET, handler as POST };
