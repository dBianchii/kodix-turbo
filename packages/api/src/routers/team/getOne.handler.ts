import { TRPCError } from "@trpc/server";

import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";
import type { TGetOneInputSchema } from "@kdx/validators/trpc/team";

interface GetOneOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
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
