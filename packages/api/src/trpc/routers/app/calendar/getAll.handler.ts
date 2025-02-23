import type { TGetAllInputSchema } from "@kdx/validators/trpc/app/calendar";

import type { TProtectedProcedureContext } from "../../../procedures";

interface GetAllCalendarTasksOptions {
  ctx: TProtectedProcedureContext;
  input: TGetAllInputSchema;
}

export const getAllHandler = async ({
  ctx,
  input,
}: GetAllCalendarTasksOptions) => {
  const { calendarAndCareTaskService: calendarAndCareTaskServiceFactory } =
    ctx.services;

  const calendarTasks =
    await calendarAndCareTaskServiceFactory.getCalendarTasks({
      dateStart: input.dateStart,
      dateEnd: input.dateEnd,
      teamIds: [ctx.auth.user.activeTeamId],
    });
  return calendarTasks;
};
