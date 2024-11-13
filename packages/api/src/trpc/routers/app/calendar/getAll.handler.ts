import type { TGetAllInputSchema } from "@kdx/validators/trpc/app/calendar";

import type { TProtectedProcedureContext } from "../../../procedures";
import { services } from "../../../../services";
import { getTeamDbFromCtx } from "../../../getTeamDbFromCtx";

interface GetAllCalendarTasksOptions {
  ctx: TProtectedProcedureContext;
  input: TGetAllInputSchema;
}

export const getAllHandler = async ({
  ctx,
  input,
}: GetAllCalendarTasksOptions) => {
  const teamDb = getTeamDbFromCtx(ctx);
  const calendarTasks = await services.calendarAndCareTask.getCalendarTasks({
    dateStart: input.dateStart,
    dateEnd: input.dateEnd,
    teamDb,
  });

  return calendarTasks;
};
