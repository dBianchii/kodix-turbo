import type { TGetAllInputSchema } from "@kdx/validators/trpc/team/appRole";

import type { TIsTeamOwnerProcedureContext } from "../../../procedures";

interface GetAllOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TGetAllInputSchema;
}

export const getAllHandler = async ({ ctx, input }: GetAllOptions) => {
  return await ctx.db.query.teamAppRoles.findMany({
    where: (role, { and, eq }) =>
      and(
        eq(role.teamId, ctx.session.user.activeTeamId),
        eq(role.appId, input.appId),
      ),
    columns: {
      id: true,
      appRoleDefaultId: true,
    },
  });
};
