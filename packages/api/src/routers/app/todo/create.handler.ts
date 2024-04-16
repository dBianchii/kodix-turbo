import type { TCreateInputSchema } from "@kdx/validators/trpc/app/todo";
import { schema } from "@kdx/db/schema";
import { nanoid } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../procedures";

interface CreateOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateInputSchema;
}

export const createHandler = async ({ ctx, input }: CreateOptions) => {
  await ctx.db.insert(schema.todos).values({
    id: nanoid(),
    assignedToUserId: input.assignedToUserId,
    teamId: ctx.session.user.activeTeamId,
    title: input.title,
    description: input.description,
    dueDate: input.dueDate,
    priority: input.priority,
    status: input.status,
  });
};
