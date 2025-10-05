import { db } from "@kdx/db/client";

import type { TProtectedProcedureContext } from "../../../procedures";

interface GetAllOptions {
  ctx: TProtectedProcedureContext;
}

export const getAllHandler = async ({ ctx }: GetAllOptions) => {
  const todos = await db.query.todos.findMany({
    where: (todos, { eq }) => eq(todos.teamId, ctx.auth.user.activeTeamId),
    with: {
      AssignedToUser: {
        columns: {
          id: true,
          image: true,
          name: true,
        },
      },
    },
  });

  return todos;
};
