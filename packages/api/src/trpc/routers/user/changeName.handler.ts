import type { TChangeNameInputSchema } from "@kdx/validators/trpc/user";
import { updateUser } from "@kdx/db/auth";

import type { TProtectedProcedureContext } from "../../procedures";

interface ChangeNameOptions {
  ctx: TProtectedProcedureContext;
  input: TChangeNameInputSchema;
}

export const changeNameHandler = async ({ ctx, input }: ChangeNameOptions) => {
  await updateUser(ctx.db, {
    id: ctx.auth.user.id,
    name: input.name,
  });
};
