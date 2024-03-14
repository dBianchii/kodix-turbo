import { revalidateTag } from "next/cache";

import type { TUpdateInputSchema } from "@kdx/validators/trpc/team";
import { eq, schema } from "@kdx/db";

import type { TUserAndTeamLimitedProcedureContext } from "../../customProcedures";

interface CreateHandler {
  ctx: TUserAndTeamLimitedProcedureContext;
  input: TUpdateInputSchema;
}

export const updateHandler = async ({ ctx, input }: CreateHandler) => {
  // const team = await ctx.prisma.team.update({
  //   where: {
  //     id: input.teamId,
  //   },
  //   data: {
  //     name: input.teamName,
  //   },
  // });
  const team = await ctx.db
    .update(schema.teams)
    .set({
      name: input.teamName,
    })
    .where(eq(schema.teams.id, input.teamId));
  revalidateTag("getAllForLoggedUser");
  return team;
};
