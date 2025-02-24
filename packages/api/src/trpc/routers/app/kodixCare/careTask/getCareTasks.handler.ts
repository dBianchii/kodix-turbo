import type { TGetCareTasksInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";

import type { TProtectedProcedureContext } from "../../../../procedures";

interface GetCareTasksOptions {
  ctx: TProtectedProcedureContext;
  input: TGetCareTasksInputSchema;
}

export const getCareTasksHandler = async ({
  ctx,
  input,
}: GetCareTasksOptions) => {
  const careTasks = await ctx.services.calendarAndCareTaskService.getCareTasks({
    dateStart: input.dateStart,
    dateEnd: input.dateEnd,
    teamIds: [ctx.auth.user.activeTeamId],
  });

  return careTasks;
};
