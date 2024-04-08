import { TRPCError } from "@trpc/server";

import type { TProtectedProcedureContext } from "~/procedures";

interface GetAllOptions {
  ctx: TProtectedProcedureContext;
}

export const getAllHandler = async ({ ctx }: GetAllOptions) => {
  const todos = await ctx.db.query.todos.findMany({
    where: (todos, { eq }) => eq(todos.teamId, ctx.session.user.activeTeamId),
    with: {
      AssignedToUser: {
        columns: {
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
