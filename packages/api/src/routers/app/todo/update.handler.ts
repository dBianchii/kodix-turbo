import type { TUpdateInputSchema } from "@kdx/validators/trpc/app/todo";

import type { TProtectedProcedureContext } from "../../../trpc";

interface UpdateOptions {
  ctx: TProtectedProcedureContext;
  input: TUpdateInputSchema;
}

export const updateHandler = async ({ ctx, input }: UpdateOptions) => {
  const todo = await ctx.prisma.todo.update({
    where: {
      id: input.id,
    },
    data: {
      title: input.title,
      assignedToUserId: input.assignedToUserId,
      description: input.description,
      dueDate: input.dueDate,
      priority: input.priority,
      status: input.status,
    },
  });

  return todo;
};
