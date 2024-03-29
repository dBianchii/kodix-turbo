import { eq, schema } from "@kdx/db";

import type { TProtectedProcedureContext } from "../../trpc";

interface GetAllForLoggedUserOptions {
  ctx: TProtectedProcedureContext;
}

export const getAllForLoggedUserHandler = async ({
  ctx,
}: GetAllForLoggedUserOptions) => {
  // const teams = await ctx.prisma.team.findMany({
  //   where: {
  //     Users: {
  //       some: {
  //         id: ctx.session.user.id,
  //       },
  //     },
  //   },
  //   select: {
  //     id: true,
  //     name: true,
  //     ownerId: true,
  //   },
  // });
  const teams = await ctx.db
    .select({ teams: schema.teams })
    .from(schema.teams)
    .where(eq(schema.usersToTeams.userId, ctx.session.user.id))
    .innerJoin(
      schema.usersToTeams,
      eq(schema.usersToTeams.teamId, schema.teams.id),
    );
  return teams.map((x) => x.teams);
};
