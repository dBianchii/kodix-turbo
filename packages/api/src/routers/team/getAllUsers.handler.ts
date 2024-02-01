import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";

interface GetAllUsersOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
}

export const getAllUsersHandler = async ({ ctx }: GetAllUsersOptions) => {
  return await ctx.prisma.user.findMany({
    where: {
      Teams: {
        some: {
          id: ctx.session.user.activeTeamId,
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
    },
  });
};
