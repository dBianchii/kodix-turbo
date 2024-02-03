import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";
import type { TUpdateInputSchema } from "@kdx/validators/trpc/app/todo";

interface UpdateOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
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
