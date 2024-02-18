import { TRPCError } from "@trpc/server";

import type { TGetOneInputSchema } from "@kdx/validators/trpc/team";

import type { TProtectedProcedureContext } from "../../trpc";

interface GetOneOptions {
  ctx: TProtectedProcedureContext;
  input: TGetOneInputSchema;
}

export const getOneHandler = async ({ ctx, input }: GetOneOptions) => {
  const team = await ctx.prisma.team.findUnique({
    where: {
      id: input.teamId,
    },
  });

  if (!team)
    throw new TRPCError({
      message: "No Team Found",
      code: "NOT_FOUND",
    });

  return team;
};
