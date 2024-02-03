import { TRPCError } from "@trpc/server";

import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";

interface GetAllOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
}

export const getAllHandler = async ({ ctx }: GetAllOptions) => {
  const todos = await ctx.prisma.todo.findMany({
    where: {
      teamId: ctx.session.user.activeTeamId,
    },
    include: {
      AssignedToUser: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!todos)
    throw new TRPCError({
      message: "No Todos Found",
      code: "NOT_FOUND",
    });

  return todos;
};
