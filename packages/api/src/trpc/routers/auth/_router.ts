import type { TRPCRouterRecord } from "@trpc/server";

import { ZSignOutInputSchema } from "@kdx/validators/trpc/auth";

import { protectedProcedure, publicProcedure } from "../../procedures";
import { getSessionHandler } from "./getSession.handler";
import { signOutHandler } from "./signOut.handler";

export const authRouter = {
  getSession: publicProcedure.query(getSessionHandler),
  signOut: protectedProcedure
    .input(ZSignOutInputSchema)
    .mutation(signOutHandler),
} satisfies TRPCRouterRecord;
