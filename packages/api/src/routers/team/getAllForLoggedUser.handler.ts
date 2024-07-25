import { eq, sql } from "@kdx/db";
import { db } from "@kdx/db/client";
import { teams, usersToTeams } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../procedures";

interface GetAllForLoggedUserOptions {
  ctx: TProtectedProcedureContext;
}

const prepared = db
  .select({ teams: teams })
  .from(teams)
  .where(eq(usersToTeams.userId, sql.placeholder("userId")))
  .innerJoin(usersToTeams, eq(usersToTeams.teamId, teams.id))
  .prepare();

export const getAllForLoggedUserHandler = async ({
  ctx,
}: GetAllForLoggedUserOptions) => {
  const teams = await prepared.execute({
    userId: ctx.session.user.id,
  });

  return teams.map((x) => x.teams);
};
