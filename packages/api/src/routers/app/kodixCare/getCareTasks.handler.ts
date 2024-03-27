import type { TGetCareTasksInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import dayjs from "@kdx/dayjs";
import { schema } from "@kdx/db";
import { kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../trpc";
import { getAllHandler } from "../calendar/getAll.handler";
import { getConfigHandler } from "../getConfig.handler";

interface GetCareTasksOptions {
  ctx: TProtectedProcedureContext;
  input: TGetCareTasksInputSchema;
}

export const getCareTasksHandler = async ({
  ctx,
  input,
}: GetCareTasksOptions) => {
  const calendarTasks = await getAllHandler({ ctx, input });

  const careTasks = (
    await ctx.db.query.careTasks.findMany({
      where: (careTask, { gte, lte, eq, and }) =>
        and(
          eq(schema.eventMasters.teamId, ctx.session.user.activeTeamId),
          gte(careTask.eventDate, input.dateStart),
          lte(careTask.eventDate, input.dateEnd),
        ),
      with: {
        EventMaster: {
          columns: {
            teamId: true,
          },
        },
      },
      columns: {
        doneAt: true,
        id: true,
        title: true,
        description: true,
        eventDate: true,
        updatedAt: true,
        doneByUserId: true,
        details: true,
      },
    })
  ).map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    date: task.eventDate,
    doneAt: task.doneAt,
    updatedAt: task.updatedAt,
    doneByUserId: task.doneByUserId,
    details: task.details,
  }));

  const config = await getConfigHandler({
    ctx,
    input: { appId: kodixCareAppId },
  });

  const union = [
    ...careTasks,
    ...calendarTasks.filter(
      (ct) =>
        !config.clonedCareTasksUntil ||
        dayjs(ct.date).isAfter(config.clonedCareTasksUntil),
    ),
  ].map((task) => {
    const data = {
      id: "",
      title: task.title,
      description: task.description,
      date: task.date,
      doneAt: null,
      updatedAt: null,
      doneByUserId: null,
      details: null,
    };
    if ("doneAt" in task) {
      return {
        ...data,
        id: task.id,
        doneAt: task.doneAt,
        updatedAt: task.updatedAt,
        doneByUserId: task.doneByUserId,
        details: task.details,
      };
    }

    return data;
  });

  return union;
};
