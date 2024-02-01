import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";
import type { TCreateInputSchema } from "@kdx/validators/trpc/app/todo";

interface CreateOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
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
