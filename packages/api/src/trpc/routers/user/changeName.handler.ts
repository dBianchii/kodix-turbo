import type { TChangeNameInputSchema } from "@kdx/validators/trpc/user";
import { db } from "@kdx/db/client";
import { userRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../procedures";

interface ChangeNameOptions {
  ctx: TProtectedProcedureContext;
  input: TChangeNameInputSchema;
}

export const changeNameHandler = async ({ ctx, input }: ChangeNameOptions) => {
  await userRepository.updateUser(
    {
      id: ctx.auth.user.id,
      input: { name: input.name },
    },
    db,
  );
};
