import type { TGetAllInputSchema } from "@kdx/validators/trpc/app/calendar";

import type { TProtectedProcedureContext } from "../../../procedures";
import { getCalendarTasks } from "../../../../internal/calendarAndCareTaskCentral";

interface GetAllCalendarTasksOptions {
  ctx: TProtectedProcedureContext;
  input: TGetAllInputSchema;
}

export const getAllHandler = async ({
  ctx,
  input,
}: GetAllCalendarTasksOptions) => {
  const calendarTasks = await getCalendarTasks({
    dateStart: input.dateStart,
    dateEnd: input.dateEnd,
    teamIds: [ctx.auth.user.activeTeamId],
  });
  return calendarTasks;
};
