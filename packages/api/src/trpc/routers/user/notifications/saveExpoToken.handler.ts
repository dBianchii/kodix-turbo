import type { TSaveExpoTokenInputSchema } from "@kdx/validators/trpc/user/notifications";

import type { TProtectedProcedureContext } from "../../../procedures";

interface SaveExpoTokenOptions {
  ctx: TProtectedProcedureContext;
  input: TSaveExpoTokenInputSchema;
}

export const saveExpoTokenHandler = async ({
  ctx,
  input,
}: SaveExpoTokenOptions) => {
  const { publicNotificationsRepository } = ctx.publicRepositories;
  await publicNotificationsRepository.createExpoToken({
    token: input.expoToken,
    userId: ctx.auth.user.id,
  });
};
