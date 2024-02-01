import { TRPCError } from "@trpc/server";

import type { PrismaClient } from "@kdx/db";

interface GetAllOptions {
  ctx: {
    prisma: PrismaClient;
  };
}

export const getAllHandler = async ({ ctx }: GetAllOptions) => {
  const user = await ctx.prisma.user.findMany();
  if (!user)
    throw new TRPCError({
      message: "No User Found",
      code: "INTERNAL_SERVER_ERROR",
    });

  return user;
};
