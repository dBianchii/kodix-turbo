import type { TCreateCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";
import { careTasks } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../../../procedures";

interface CreateCareTaskOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateCareTaskInputSchema;
}

export const createCareTaskHandler = async ({
  ctx,
  input,
}: CreateCareTaskOptions) => {
  await ctx.db.insert(careTasks).values({
    ...input,
    teamId: ctx.auth.user.activeTeamId,
    createdBy: ctx.auth.user.id,
  });
};
