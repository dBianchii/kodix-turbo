import { db, eq, sql } from "@kdx/db";
import { schema } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../procedures";

interface GetAllForLoggedUserOptions {
  ctx: TProtectedProcedureContext;
}

const prepared = db
  .select({ teams: schema.teams })
  .from(schema.teams)
  .where(eq(schema.usersToTeams.userId, sql.placeholder("userId")))
  .innerJoin(
    schema.usersToTeams,
    eq(schema.usersToTeams.teamId, schema.teams.id),
  )
  .prepare();

export const getAllForLoggedUserHandler = async ({
  ctx,
}: GetAllForLoggedUserOptions) => {
  const teams = await prepared.execute({
    userId: ctx.session.user.id,
  });

  return teams.map((x) => x.teams);
};
