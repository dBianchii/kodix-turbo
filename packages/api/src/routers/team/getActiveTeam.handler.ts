import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";

interface GetActiveTeamOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
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
