import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";

interface GetAllForLoggedUserOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
}

export const getAllForLoggedUserHandler = async ({
  ctx,
}: GetAllForLoggedUserOptions) => {
  const teams = await ctx.prisma.team.findMany({
    where: {
      Users: {
        some: {
          id: ctx.session.user.id,
        },
      },
    },
    select: {
      id: true,
      name: true,
      ownerId: true,
    },
  });

  return teams;
};
