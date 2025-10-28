import type { TGetCareTasksInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";

import type { TProtectedProcedureContext } from "../../../../procedures";
import { getCareTasks } from "../../../../../internal/calendar-and-care-task-central";

interface GetCareTasksOptions {
  ctx: TProtectedProcedureContext;
  input: TGetCareTasksInputSchema;
}

export const getCareTasksHandler = async ({
  ctx,
  input,
}: GetCareTasksOptions) => {
  const careTasks = await getCareTasks({
    dateEnd: input.dateEnd,
    dateStart: input.dateStart,
    teamIds: [ctx.auth.user.activeTeamId],
  });

  return careTasks;
};
