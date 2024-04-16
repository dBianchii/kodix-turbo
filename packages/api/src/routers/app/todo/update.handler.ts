import type { TUpdateInputSchema } from "@kdx/validators/trpc/app/todo";
import { eq } from "@kdx/db";
import { schema } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../../procedures";

interface UpdateOptions {
  ctx: TProtectedProcedureContext;
  input: TUpdateInputSchema;
}

export const updateHandler = async ({ ctx, input }: UpdateOptions) => {
  const todo = await ctx.db
    .update(schema.todos)
    .set({
      title: input.title,
      assignedToUserId: input.assignedToUserId,
      description: input.description,
      dueDate: input.dueDate,
      priority: input.priority,
      status: input.status,
    })
    .where(eq(schema.todos.id, input.id));

  return todo;
};
