import { eq } from "@kdx/db";
import * as schema from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../procedures";

interface GetAllUsersOptions {
  ctx: TProtectedProcedureContext;
}

export const getAllUsersHandler = async ({ ctx }: GetAllUsersOptions) => {
  return await ctx.db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      image: schema.users.image,
    })
    .from(schema.users)
    .where(eq(schema.usersToTeams.teamId, ctx.session.user.activeTeamId))
    .innerJoin(
      schema.usersToTeams,
      eq(schema.usersToTeams.userId, schema.users.id),
    );
};
