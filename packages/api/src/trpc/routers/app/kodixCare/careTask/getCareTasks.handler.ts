import type { TGetCareTasksInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";

import type { TProtectedProcedureContext } from "../../../../procedures";
import { services } from "../../../../../services";
import { getTeamDbFromCtx } from "../../../../getTeamDbFromCtx";

interface GetCareTasksOptions {
  ctx: TProtectedProcedureContext;
  input: TGetCareTasksInputSchema;
}

export const getCareTasksHandler = async ({
  ctx,
  input,
}: GetCareTasksOptions) => {
  const teamDb = getTeamDbFromCtx(ctx);
  const careTasks = await services.calendarAndCareTask.getCareTasks({
    dateStart: input.dateStart,
    dateEnd: input.dateEnd,
    teamDb,
  });

  return careTasks;
};
