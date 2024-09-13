import type { careTasks } from "@kdx/db/schema";
import type { TGetCareTasksInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import dayjs from "@kdx/dayjs";
import { eventMasters } from "@kdx/db/schema";
import { kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../procedures";
import { getAllHandler } from "../calendar/getAll.handler";
import { getConfigHandler } from "../getConfig.handler";

interface GetCareTasksOptions {
  ctx: TProtectedProcedureContext;
  input: TGetCareTasksInputSchema;
}
export interface CareTask {
  id: typeof careTasks.$inferSelect.id;
  title: typeof careTasks.$inferSelect.title;
  description: typeof careTasks.$inferSelect.description;
  date: typeof careTasks.$inferSelect.date;
  doneAt: typeof careTasks.$inferSelect.doneAt;
  updatedAt: typeof careTasks.$inferSelect.updatedAt;
  doneByUserId: typeof careTasks.$inferSelect.doneByUserId;
  details: typeof careTasks.$inferSelect.details;
}
type CareTaskOrCalendarTask = Omit<CareTask, "id"> & { id: string | null }; //? Same as CareTask but id might not exist when it's a calendar task
export const getCareTasksHandler = async ({
  ctx,
  input,
}: GetCareTasksOptions) => {
  const calendarTasks = await getAllHandler({ ctx, input });
  const careTasks = (await ctx.db.query.careTasks.findMany({
    where: (careTask, { gte, lte, eq, and }) =>
      and(
        eq(eventMasters.teamId, ctx.session.user.activeTeamId),
        gte(careTask.date, input.dateStart),
        lte(careTask.date, input.dateEnd),
      ),

    columns: {
      doneAt: true,
      id: true,
      title: true,
      description: true,
      date: true,
      updatedAt: true,
      doneByUserId: true,
      details: true,
    },
  })) satisfies CareTask[];

  const config = await getConfigHandler({
    ctx,
    input: { appId: kodixCareAppId },
  });

  const union: CareTaskOrCalendarTask[] = [
    ...careTasks,
    ...calendarTasks
      .filter(
        (ct) =>
          !config.clonedCareTasksUntil ||
          dayjs(ct.date).isAfter(config.clonedCareTasksUntil),
      )
      .map((x) => ({
        id: null,
        title: x.title ?? null,
        description: x.description ?? null,
        date: x.date,
        doneAt: null,
        updatedAt: null,
        doneByUserId: null,
        details: null,
      })),
  ];

  return union;
};
