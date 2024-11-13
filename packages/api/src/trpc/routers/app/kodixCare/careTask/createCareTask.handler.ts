import type { TCreateCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";
import { db } from "@kdx/db/client";

import type { TProtectedProcedureContext } from "../../../../procedures";

interface CreateCareTaskOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateCareTaskInputSchema;
}

export const createCareTaskHandler = async ({
  ctx,
  input,
}: CreateCareTaskOptions) => {
  await ctx.repositories.careTask.createCareTask(db, {
    ...input,
    teamId: ctx.auth.user.activeTeamId,
    createdBy: ctx.auth.user.id,
    createdFromCalendar: false,
  });
};
