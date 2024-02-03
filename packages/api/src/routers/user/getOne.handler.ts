import { TRPCError } from "@trpc/server";

import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";
import type { TGetOneInputSchema } from "@kdx/validators/trpc/user";

interface GetOneOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
  input: TGetOneInputSchema;
}

export const getOneHandler = async ({ ctx, input }: GetOneOptions) => {
  const user = await ctx.prisma.user.findUnique({
    where: {
      id: input.userId,
    },
  });
  if (!user)
    throw new TRPCError({
      message: "No User Found",
      code: "INTERNAL_SERVER_ERROR",
    });

  return user;
};
