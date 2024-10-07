import type { TGetMyRolesInputSchema } from "@kdx/validators/trpc/team/appRole";
import { teamAppRolesToUsers } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../../procedures";

interface GetMyRolesOptions {
  ctx: TProtectedProcedureContext;
  input: TGetMyRolesInputSchema;
}

export const getMyRolesHandler = async ({ ctx, input }: GetMyRolesOptions) => {
  const roles = await ctx.db.query.teamAppRoles.findMany({
    where: (teamAppRole, { eq, and, inArray }) =>
      and(
        eq(teamAppRole.teamId, ctx.session.user.activeTeamId),
        eq(teamAppRole.appId, input.appId),
        inArray(
          teamAppRole.id,
          ctx.db
            .select({ id: teamAppRolesToUsers.teamAppRoleId })
            .from(teamAppRolesToUsers)
            .where(eq(teamAppRolesToUsers.userId, ctx.session.user.id)),
        ),
      ),
    columns: {
      appRoleDefaultId: true,
    },
  });
  return roles;
};
