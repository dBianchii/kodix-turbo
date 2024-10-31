import type { TGetCareTasksInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";

import type { TProtectedProcedureContext } from "../../../../procedures";
import { getCareTasks } from "../../../../../internal/calendarAndCareTaskCentral";

interface GetCareTasksOptions {
  ctx: TProtectedProcedureContext;
  input: TGetCareTasksInputSchema;
}

export const getCareTasksHandler = async ({
  ctx,
  input,
}: GetCareTasksOptions) => {
  const careTasks = await getCareTasks({
    ctx,
    dateStart: input.dateStart,
    dateEnd: input.dateEnd,
    teamIds: [ctx.auth.user.activeTeamId],
  });

  return careTasks;
};
