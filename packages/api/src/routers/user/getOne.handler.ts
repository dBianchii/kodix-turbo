import { TRPCError } from "@trpc/server";

import type { TGetOneInputSchema } from "@kdx/validators/trpc/user";

import type { TProtectedProcedureContext } from "../../trpc";

interface GetOneOptions {
  ctx: TProtectedProcedureContext;
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
