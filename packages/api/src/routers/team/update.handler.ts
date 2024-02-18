import { revalidateTag } from "next/cache";

import type { TUpdateInputSchema } from "@kdx/validators/trpc/team";

import type { TUserAndTeamLimitedProcedureContext } from "../../customProcedures";

interface CreateHandler {
  ctx: TUserAndTeamLimitedProcedureContext;
  input: TUpdateInputSchema;
}

export const updateHandler = async ({ ctx, input }: CreateHandler) => {
  const team = await ctx.prisma.team.update({
    where: {
      id: input.teamId,
    },
    data: {
      name: input.teamName,
    },
  });
  revalidateTag("getAllForLoggedUser");
  return team;
};
