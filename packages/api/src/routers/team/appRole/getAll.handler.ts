import type { TGetAllInputSchema } from "@kdx/validators/trpc/team/appRole";

import type { TIsTeamOwnerProcedureContext } from "../../../customProcedures";

interface GetAllOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TGetAllInputSchema;
}

export const getAllHandler = async ({ ctx, input }: GetAllOptions) => {
  return await ctx.prisma.teamAppRole.findMany({
    where: {
      teamId: ctx.session.user.activeTeamId,
      appId: input.appId,
    },
    select: {
      id: true,
      name: true,
    },
  });
};
