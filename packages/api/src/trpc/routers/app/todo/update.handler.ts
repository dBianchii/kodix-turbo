import type { TUpdateInputSchema } from "@kdx/validators/trpc/app/todo";
import { and, eq } from "@kdx/db";
import { todos } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../../procedures";

interface UpdateOptions {
  ctx: TProtectedProcedureContext;
  input: TUpdateInputSchema;
}

export const updateHandler = async ({ ctx, input }: UpdateOptions) => {
  await ctx.db
    .update(todos)
    .set({
      title: input.title,
      assignedToUserId: input.assignedToUserId,
      description: input.description,
      dueDate: input.dueDate,
      priority: input.priority,
      status: input.status,
    })
    .where(
      and(eq(todos.id, input.id), eq(todos.teamId, ctx.auth.user.activeTeamId)),
    );
};
