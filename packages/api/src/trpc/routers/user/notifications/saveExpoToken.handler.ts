import type { TSaveExpoTokenInputSchema } from "@kdx/validators/trpc/user/notifications";
import { expoTokens } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../../procedures";

interface SaveExpoTokenOptions {
  ctx: TProtectedProcedureContext;
  input: TSaveExpoTokenInputSchema;
}

export const saveExpoTokenHandler = async ({
  ctx,
  input,
}: SaveExpoTokenOptions) => {
  await ctx.db.insert(expoTokens).values({
    token: input.expoToken,
    userId: ctx.auth.user.id,
  });
};
