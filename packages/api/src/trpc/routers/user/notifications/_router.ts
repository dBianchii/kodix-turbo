import type { TRPCRouterRecord } from "@trpc/server";

import { ZSaveExpoTokenInputSchema } from "@kdx/validators/trpc/user/notifications";

import { protectedProcedure } from "../../../procedures";
import { saveExpoTokenHandler } from "./saveExpoToken.handler";

export const notificationsRouter = {
  saveExpoToken: protectedProcedure
    .input(ZSaveExpoTokenInputSchema)
    .mutation(saveExpoTokenHandler),
} satisfies TRPCRouterRecord;
