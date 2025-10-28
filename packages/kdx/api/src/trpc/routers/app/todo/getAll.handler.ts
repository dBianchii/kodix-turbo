import { eq } from "@kdx/db";
import { db } from "@kdx/db/client";
import { todos } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../../procedures";

interface GetAllOptions {
  ctx: TProtectedProcedureContext;
}

export const getAllHandler = async ({ ctx }: GetAllOptions) =>
  await db.query.todos.findMany({
    where: eq(todos.teamId, ctx.auth.user.activeTeamId),
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
