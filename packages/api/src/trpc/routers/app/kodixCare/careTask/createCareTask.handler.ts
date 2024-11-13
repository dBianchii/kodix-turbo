import type { TCreateCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";

import type { TProtectedProcedureContext } from "../../../../procedures";
import { getCareTaskRepository } from "../../../../../../../db/src/repositories/app/kodixCare/careTaskRepository";
import { getTeamDbFromCtx } from "../../../../getTeamDbFromCtx";

interface CreateCareTaskOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateCareTaskInputSchema;
}

export const createCareTaskHandler = async ({
  ctx,
  input,
}: CreateCareTaskOptions) => {
  const teamDb = getTeamDbFromCtx(ctx);
  const careTaskRepository = getCareTaskRepository(teamDb);
  await careTaskRepository.createCareTask(
    {
      ...input,
      teamId: ctx.auth.user.activeTeamId,
      createdBy: ctx.auth.user.id,
      createdFromCalendar: false,
    },
    teamDb,
  );
};
