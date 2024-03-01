import type { TGetCareTasksInputSchema } from "@kdx/validators/trpc/app/kodixCare";

import type { TProtectedProcedureContext } from "../../../trpc";

interface GetCareTasksOptions {
  ctx: TProtectedProcedureContext;
  input: TGetCareTasksInputSchema;
}

export const getCareTasksHandler = async ({
  ctx,
  input,
}: GetCareTasksOptions) => {
  //TODO: understand yeah
  const careTasks = await ctx.prisma.careTask.findMany({
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
  });

  return careTasks;
};
