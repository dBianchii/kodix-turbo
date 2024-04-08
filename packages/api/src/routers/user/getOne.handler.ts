import { TRPCError } from "@trpc/server";

import type { TGetOneInputSchema } from "@kdx/validators/trpc/user";
import { eq, schema } from "@kdx/db";

import type { TProtectedProcedureContext } from "../../procedures";

interface GetOneOptions {
  ctx: TProtectedProcedureContext;
  input: TGetOneInputSchema;
}

export const getOneHandler = async ({ ctx, input }: GetOneOptions) => {
  const user = await ctx.db.query.users.findFirst({
    where: eq(schema.users.id, input.userId),
  });
  if (!user)
    throw new TRPCError({
      message: "No User Found",
      code: "INTERNAL_SERVER_ERROR",
    });

  return user;
};
