import type { TCreateInputSchema } from "@kdx/validators/trpc/app/todo";

import type { TProtectedProcedureContext } from "../../../trpc";

interface CreateOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateInputSchema;
}

export const createHandler = async ({ ctx, input }: CreateOptions) => {
  const todo = await ctx.prisma.todo.create({
    data: {
      assignedToUserId: input.assignedToUserId,
      teamId: ctx.session.user.activeTeamId,

      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
      priority: input.priority,
      status: input.status,
    },
  });

  return todo.id;
};
