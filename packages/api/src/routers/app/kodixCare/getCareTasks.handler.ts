import type { TGetCareTasksInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import dayjs from "@kdx/dayjs";
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
    await ctx.prisma.careTask.findMany({
      where: {
        EventMaster: {
          teamId: ctx.session.user.activeTeamId,
        },
        eventDate: {
          gte: input.dateStart,
          lte: input.dateEnd,
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        eventDate: true,
      },
    })
  ).map((task) => ({
    title: task.title,
    description: task.description,
    date: task.eventDate,
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
  ].map((tasks) => ({
    title: tasks.title,
    description: tasks.description,
    date: tasks.date,
  }));

  return union;
};
