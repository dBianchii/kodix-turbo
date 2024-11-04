import type { TChangeNameInputSchema } from "@kdx/validators/trpc/user";
import { userRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../procedures";

interface ChangeNameOptions {
  ctx: TProtectedProcedureContext;
  input: TChangeNameInputSchema;
}

export const changeNameHandler = async ({ ctx, input }: ChangeNameOptions) => {
  await userRepository.updateUser(ctx.db, {
    id: ctx.auth.user.id,
    name: input.name,
  });
};
