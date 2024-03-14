import { eq, schema } from "@kdx/db";

import type { TProtectedProcedureContext } from "../../trpc";

interface GetAllUsersOptions {
  ctx: TProtectedProcedureContext;
}

export const getAllUsersHandler = async ({ ctx }: GetAllUsersOptions) => {
  // return await ctx.prisma.user.findMany({
  //   where: {
  //     Teams: {
  //       some: {
  //         id: ctx.session.user.activeTeamId,
  //       },
  //     },
  //   },
  //   select: {
  //     id: true,
  //     email: true,
  //     name: true,
  //     image: true,
  //   },
  // });
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
