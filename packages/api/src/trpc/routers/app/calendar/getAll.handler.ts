import type { TGetAllInputSchema } from "@kdx/validators/trpc/app/calendar";

import type { TProtectedProcedureContext } from "../../../procedures";
import { getCalendarTasks } from "../../../../internal/caelndarAndCareTaskCentral";

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
    teamIds: [ctx.session.user.activeTeamId],
    ctx,
  });
  return calendarTasks;
};
