import type { NextRequest } from "next/server";
import { cashTRPCRouter, createTRPCContext } from "@cash/api";
import { nextTRPCHandler } from "@kodix/trpc/server";

const handler = async (req: NextRequest) => {
  const response = await nextTRPCHandler(req, {
    router: cashTRPCRouter,
    createContext: ({ headers }) => createTRPCContext({ headers }),
  });

  return response;
};

export { handler as GET, handler as POST };
