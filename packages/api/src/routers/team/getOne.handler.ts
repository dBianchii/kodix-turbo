import { TRPCError } from "@trpc/server";

import type { TGetOneInputSchema } from "@kdx/validators/trpc/team";

import type { TProtectedProcedureContext } from "~/procedures";

interface GetOneOptions {
  ctx: TProtectedProcedureContext;
  input: TGetOneInputSchema;
}

export const getOneHandler = async ({ ctx, input }: GetOneOptions) => {
  const team = await ctx.db.query.teams.findFirst({
    where: (team, { eq }) => eq(team.id, input.teamId),
  });

  if (!team)
    throw new TRPCError({
      message: "No Team Found",
      code: "NOT_FOUND",
    });

  return team;
};
