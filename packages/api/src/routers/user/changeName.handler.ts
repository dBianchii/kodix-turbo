import type { TChangeNameInputSchema } from "@kdx/validators/trpc/user";

import type { TProtectedProcedureContext } from "../../trpc";

interface ChangeNameOptions {
  ctx: TProtectedProcedureContext;
  input: TChangeNameInputSchema;
}

export const changeNameHandler = async ({ ctx, input }: ChangeNameOptions) => {
  return await ctx.prisma.user.update({
    where: {
      id: ctx.session.user.id,
    },
    data: {
      name: input.name,
    },
  });
};
