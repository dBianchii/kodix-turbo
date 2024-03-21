import { TRPCError } from "@trpc/server";

import type { TPublicProcedureContext } from "../../trpc";

interface GetAllOptions {
  ctx: TPublicProcedureContext;
}

export const getAllHandler = async ({ ctx }: GetAllOptions) => {
  // const user = await ctx.prisma.user.findMany();
  const user = await ctx.db.query.users.findMany();
  if (!user)
    throw new TRPCError({
      message: "No User Found",
      code: "INTERNAL_SERVER_ERROR",
    });

  return user;
};
