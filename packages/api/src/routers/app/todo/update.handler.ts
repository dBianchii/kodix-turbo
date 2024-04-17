import type { TUpdateInputSchema } from "@kdx/validators/trpc/app/todo";
import { and, eq } from "@kdx/db";
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
    .where(
      and(
        eq(schema.todos.id, input.id),
        eq(schema.todos.teamId, ctx.session.user.activeTeamId),
      ),
    );

  return todo;
};

// type TUpdateInputSchema = {
//   id: string;
//   title?: string | undefined;
//   description?: string | undefined;
//   dueDate?: Date | null | undefined;
//   reminder?: boolean | undefined;
//   priority?: number | undefined;
//   status?: "TODO" | ... 5 more ... | undefined;
//   assignedToUserId?: string | ... 1 more ... | undefined;
// }

// type TUpdateInputSchema = {
//   id: string;
//   teamId: string;
//   title: string;
//   description?: string | null | undefined;
//   dueDate?: Date | null | undefined;
//   priority?: number | null | undefined;
//   status?: "TODO" | ... 5 more ... | undefined;
//   reminder?: number | ... 1 more ... | undefined;
//   assignedToUserId?: string | ... 1 more ... | undefined;
// }
