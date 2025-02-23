import type { TChangeNameInputSchema } from "@kdx/validators/trpc/user";

import type { TProtectedProcedureContext } from "../../procedures";

interface ChangeNameOptions {
  ctx: TProtectedProcedureContext;
  input: TChangeNameInputSchema;
}

export const changeNameHandler = async ({ ctx, input }: ChangeNameOptions) => {
  const { publicUserRepository } = ctx.publicRepositories;
  await publicUserRepository.updateUser({
    id: ctx.auth.user.id,
    input: { name: input.name },
  });
};
