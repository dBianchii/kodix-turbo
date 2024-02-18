import type { TProtectedProcedureContext } from "../../trpc";

interface GetAllUsersOptions {
  ctx: TProtectedProcedureContext;
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
