import type { TCreateCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";
import { db } from "@kdx/db/client";
import { careTaskRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../../procedures";

interface CreateCareTaskOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateCareTaskInputSchema;
}

export const createCareTaskHandler = async ({
  ctx,
  input,
}: CreateCareTaskOptions) => {
  await careTaskRepository.createCareTask(db, {
    ...input,
    teamId: ctx.auth.user.activeTeamId,
    createdBy: ctx.auth.user.id,
    createdFromCalendar: false,
  });
};
