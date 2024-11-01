import { TRPCError } from "@trpc/server";

import { sql } from "@kdx/db";
import { db } from "@kdx/db/client";

import type { TProtectedProcedureContext } from "../../procedures";

interface GetActiveTeamOptions {
  ctx: TProtectedProcedureContext;
}

const prepared = db.query.teams
  .findFirst({
    where: (teams, { eq }) => eq(teams.id, sql.placeholder("teamId")),
    with: {
      UsersToTeams: {
        where: (usersToTeams, { eq }) =>
          eq(usersToTeams.userId, sql.placeholder("userId")),
        with: {
          User: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  })
  .prepare();

export const getActiveTeamHandler = async ({ ctx }: GetActiveTeamOptions) => {
  const team = await prepared.execute({
    teamId: ctx.auth.user.activeTeamId,
    userId: ctx.auth.user.id,
  });

  if (!team) {
    throw new TRPCError({
      message: ctx.t("api.No Team Found"),
      code: "NOT_FOUND",
    });
  }

  const teamWithUsers = {
    ...team,
    Users: team.UsersToTeams.map((userToTeam) => userToTeam.User),
  };

  return teamWithUsers;
};
