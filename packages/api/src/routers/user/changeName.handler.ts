import type { TChangeNameInputSchema } from "@kdx/validators/trpc/user";
import { eq, schema } from "@kdx/db";

import type { TProtectedProcedureContext } from "../../trpc";

interface ChangeNameOptions {
  ctx: TProtectedProcedureContext;
  input: TChangeNameInputSchema;
}

export const changeNameHandler = async ({ ctx, input }: ChangeNameOptions) => {
  // return await ctx.prisma.user.update({
  //   where: {
  //     id: ctx.session.user.id,
  //   },
  //   data: {
  //     name: input.name,
  //   },
  // });
  return await ctx.db
    .update(schema.users)
    .set({ name: input.name })
    .where(eq(schema.users.id, ctx.session.user.id));
};
