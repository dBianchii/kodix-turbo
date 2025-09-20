import type { TSaveExpoTokenInputSchema } from "@kdx/validators/trpc/user/notifications";
import { notificationRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../procedures";

interface SaveExpoTokenOptions {
  ctx: TProtectedProcedureContext;
  input: TSaveExpoTokenInputSchema;
}

export const saveExpoTokenHandler = async ({
  ctx,
  input,
}: SaveExpoTokenOptions) => {
  await notificationRepository.createExpoToken({
    token: input.expoToken,
    userId: ctx.auth.user.id,
  });
};
