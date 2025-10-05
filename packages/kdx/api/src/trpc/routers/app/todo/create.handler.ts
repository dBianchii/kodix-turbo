import type { TCreateInputSchema } from "@kdx/validators/trpc/app/todo";
import { db } from "@kdx/db/client";
import { todos } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../../procedures";

interface CreateOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateInputSchema;
}

export const createHandler = async ({ ctx, input }: CreateOptions) => {
  await db.insert(todos).values({
    assignedToUserId: input.assignedToUserId,
    description: input.description,
    dueDate: input.dueDate,
    priority: input.priority,
    status: input.status,
    teamId: ctx.auth.user.activeTeamId,
    title: input.title,
  });
};
