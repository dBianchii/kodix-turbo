import { authRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../procedures";
import { protectedMutation } from "../../protectedFetchAndMutations";
import { assertCanUserDeleteAccount } from "./_user.permissions";

interface DeleteAccountOptions {
  ctx: TProtectedProcedureContext;
}

export const deleteAccountHandler = async ({ ctx }: DeleteAccountOptions) => {
  await protectedMutation({
    permissions: () => assertCanUserDeleteAccount(ctx),
    operation: () =>
      authRepository.deleteKodixAccountAndUserDataByUserId(ctx.auth.user.id),
  });
};
