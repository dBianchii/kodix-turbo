import type { TGetAllInputSchema } from "@kdx/validators/trpc/team/appRole";

import type { TIsTeamOwnerProcedureContext } from "../../../customProcedures";

interface GetAllOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TGetAllInputSchema;
}

export const getAllHandler = async ({ ctx, input }: GetAllOptions) => {
  // return await ctx.prisma.teamAppRole.findMany({
  //   where: {
  //     teamId: ctx.session.user.activeTeamId,
  //     appId: input.appId,
  //   },
  //   select: {
  //     id: true,
  //     name: true,
  //   },
  // });
  return await ctx.db.query.teamAppRoles.findMany({
    where: (role, { and, eq }) =>
      and(
        eq(role.teamId, ctx.session.user.activeTeamId),
        eq(role.appId, input.appId),
      ),
    columns: {
      id: true,
      name: true,
    },
  });
};
