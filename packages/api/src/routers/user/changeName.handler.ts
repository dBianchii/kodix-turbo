import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";
import type { TChangeNameInputSchema } from "@kdx/validators/trpc/user";

interface ChangeNameOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
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
