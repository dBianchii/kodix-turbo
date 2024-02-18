import type { TProtectedProcedureContext } from "../../trpc";

interface GetAllForLoggedUserOptions {
  ctx: TProtectedProcedureContext;
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
