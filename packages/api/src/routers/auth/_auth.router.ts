import { createTRPCRouter } from "~/trpc";
import { protectedProcedure, publicProcedure } from "../../procedures";
import { getSessionHandler } from "./getSession.handler";
import { signOutHandler } from "./signOut.handler";

export const authRouter = createTRPCRouter({
  getSession: publicProcedure.query(getSessionHandler),
  signOut: protectedProcedure.mutation(signOutHandler),
});
