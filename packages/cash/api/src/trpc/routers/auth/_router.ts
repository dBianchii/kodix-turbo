import type { TRPCRouterRecord } from "@trpc/server";

import { publicProcedure } from "../../procedures";
import { ZVerifyMagicLinkInputSchema } from "../../schemas/auth";
import { verifyMagicLinkHandler } from "./verifyMagicLink.handler";

export const authRouter = {
  verifyMagicLink: publicProcedure
    .input(ZVerifyMagicLinkInputSchema)
    .mutation(verifyMagicLinkHandler),
} satisfies TRPCRouterRecord;
