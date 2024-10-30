import type { TCreateCareTaskInputSchema } from "@kdx/validators/trpc/app/kodixCare";
import { careTasks } from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../../procedures";
import { getCurrentShiftHandler } from "./getCurrentShift.handler";

interface CreateCareTaskOptions {
  ctx: TProtectedProcedureContext;
  input: TCreateCareTaskInputSchema;
}

export const createCareTaskHandler = async ({
  ctx,
  input,
}: CreateCareTaskOptions) => {
  const currentCareShift = await getCurrentShiftHandler({ ctx });

  await ctx.db.insert(careTasks).values({
    ...input,
    careShiftId: currentCareShift?.id,
    teamId: ctx.auth.user.activeTeamId,
    createdBy: ctx.auth.user.id,
  });
};
