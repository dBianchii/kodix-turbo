import { and, eq } from "@kdx/db";
import { usersToTeams } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../procedures";

interface GetAllOptions {
  ctx: TProtectedProcedureContext;
}

export const getAllHandler = async ({ ctx }: GetAllOptions) => {
  const _teams = await ctx.db.query.teams.findMany({
    with: {
      UsersToTeams: {
        columns: {
          userId: true,
        },
      },
    },
    where: (teams, { exists }) =>
      exists(
        ctx.db
          .select()
          .from(usersToTeams)
          .where(
            and(
              eq(usersToTeams.teamId, teams.id),
              eq(usersToTeams.userId, ctx.session.user.id),
            ),
          ),
      ),
  });

  return _teams;
};
