import type { TProtectedProcedureContext } from "../../procedures";
import { protectedMutation } from "../../protectedFetchAndMutations";
import { assertCanUserDeleteAccount } from "./_user.permissions";

interface DeleteAccountOptions {
  ctx: TProtectedProcedureContext;
}

export const deleteAccountHandler = async ({ ctx }: DeleteAccountOptions) => {
  const { publicAuthRepository } = ctx.publicRepositories;
  await protectedMutation({
    permissions: () => assertCanUserDeleteAccount(ctx),
    operation: () =>
      publicAuthRepository.deleteKodixAccountAndUserDataByUserId(
        ctx.auth.user.id,
      ),
  });
};
