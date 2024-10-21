import { eq } from "@kdx/db";
import { users, usersToTeams } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../procedures";

interface GetAllUsersOptions {
  ctx: TProtectedProcedureContext;
}

export const getAllUsersHandler = async ({ ctx }: GetAllUsersOptions) => {
  return await ctx.db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      image: users.image,
    })
    .from(users)
    .where(eq(usersToTeams.teamId, ctx.auth.user.activeTeamId))
    .innerJoin(usersToTeams, eq(usersToTeams.userId, users.id));
};
