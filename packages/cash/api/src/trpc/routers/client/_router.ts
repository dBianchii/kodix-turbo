import type { TRPCRouterRecord } from "@trpc/server";

import { publicProcedure } from "../../procedures";
import { ZRegisterInterestInputSchema } from "../../schemas/client";
import { registerInterestHandler } from "./registerInterest.handler";

export const clientRouter = {
  registerInterest: publicProcedure
    .input(ZRegisterInterestInputSchema)
    .mutation(registerInterestHandler),
} satisfies TRPCRouterRecord;
