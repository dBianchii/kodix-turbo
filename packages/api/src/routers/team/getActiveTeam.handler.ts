import { TRPCError } from "@trpc/server";

import type { TProtectedProcedureContext } from "../../trpc";

interface GetActiveTeamOptions {
  ctx: TProtectedProcedureContext;
}

export const getActiveTeamHandler = async ({ ctx }: GetActiveTeamOptions) => {
  // const team = await ctx.prisma.team.findUniqueOrThrow({
  //   where: {
  //     id: ctx.session.user.activeTeamId,
  //   },
  //   include: {
  //     Users: true,
  //   },
  // });
  const team = await ctx.db.query.teams.findFirst({
    where: (teams, { eq }) => eq(teams.id, ctx.session.user.activeTeamId),
    with: {
      UsersToTeams: {
        where: (usersToTeams, { eq }) =>
          eq(usersToTeams.userId, ctx.session.user.id),
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
  });
  if (!team)
    throw new TRPCError({
      message: "Team not found",
      code: "NOT_FOUND",
    });

  const teamWithUsers = {
    ...team,
    Users: team.UsersToTeams.map((userToTeam) => userToTeam.User),
  };

  return teamWithUsers;
};
