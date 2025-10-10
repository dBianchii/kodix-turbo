import type { TUpdateInputSchema } from "@kdx/validators/trpc/app/todo";
import { and, eq } from "@kdx/db";
import { db } from "@kdx/db/client";
import { todos } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../../procedures";

interface UpdateOptions {
  ctx: TProtectedProcedureContext;
  input: TUpdateInputSchema;
}

export const updateHandler = async ({ ctx, input }: UpdateOptions) => {
  await db
    .update(todos)
    .set({
      assignedToUserId: input.assignedToUserId,
      description: input.description,
      dueDate: input.dueDate,
      priority: input.priority,
      status: input.status,
      title: input.title,
    })
    .where(
      and(eq(todos.id, input.id), eq(todos.teamId, ctx.auth.user.activeTeamId)),
    );
};
