import type { TProtectedProcedureContext } from "../../trpc";

interface GetActiveTeamOptions {
  ctx: TProtectedProcedureContext;
}

export const getActiveTeamHandler = async ({ ctx }: GetActiveTeamOptions) => {
  const team = await ctx.prisma.team.findUniqueOrThrow({
    where: {
      id: ctx.session.user.activeTeamId,
    },
    include: {
      Users: true,
    },
  });

  return team;
};
