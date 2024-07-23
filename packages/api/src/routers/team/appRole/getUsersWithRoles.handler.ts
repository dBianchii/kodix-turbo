import type { TGetUsersWithRolesInputSchema } from "@kdx/validators/trpc/team/appRole";
import { and, eq } from "@kdx/db";
import * as schema from "@kdx/db/schema";

import type { TIsTeamOwnerProcedureContext } from "../../../procedures";

interface GetUsersWithRolesOptions {
  ctx: TIsTeamOwnerProcedureContext;
  input: TGetUsersWithRolesInputSchema;
}

export const getUsersWithRolesHandler = async ({
  ctx,
  input,
}: GetUsersWithRolesOptions) => {
  const users = await ctx.db.query.users.findMany({
    where: (users, { eq, inArray }) =>
      inArray(
        users.id,
        ctx.db
          .select({ id: schema.usersToTeams.userId })
          .from(schema.usersToTeams)
          .where(eq(schema.usersToTeams.teamId, ctx.session.user.activeTeamId)),
      ),
    with: {
      TeamAppRolesToUsers: {
        where: (teamAppRolesToUsers, { inArray }) =>
          inArray(
            teamAppRolesToUsers.teamAppRoleId,
            ctx.db
              .select({ id: schema.teamAppRoles.id })
              .from(schema.teamAppRoles)
              .where(
                and(
                  eq(schema.teamAppRoles.teamId, ctx.session.user.activeTeamId),
                  eq(schema.teamAppRoles.appId, input.appId),
                ),
              ),
          ),
        with: {
          TeamAppRole: {
            columns: {
              id: true,
            },
          },
        },
        columns: {
          teamAppRoleId: true,
          userId: true,
        },
      },
    },
    columns: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  return users;
};
