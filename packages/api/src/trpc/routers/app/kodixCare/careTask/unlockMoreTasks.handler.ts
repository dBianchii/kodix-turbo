import { TRPCError } from "@trpc/server";

import type { TUnlockMoreTasksInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";
import { getKodixCareRepository } from "@kdx/db/repositories";
import { kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../../procedures";
import { services } from "../../../../../services";
import { getTeamDbFromCtx } from "../../../../getTeamDbFromCtx";
import { getConfigHandler } from "../../getConfig.handler";

interface UnlockMoreTasksInputOptions {
  ctx: TProtectedProcedureContext;
  input: TUnlockMoreTasksInputSchema;
}

export const unlockMoreTasksHandler = async ({
  ctx,
  input,
}: UnlockMoreTasksInputOptions) => {
  const teamDb = getTeamDbFromCtx(ctx);

  const kodixCareRepository = getKodixCareRepository(teamDb);
  const clonedCareTasksUntil = (
    await getConfigHandler({
      ctx,
      input: {
        appId: kodixCareAppId,
      },
    })
  ).clonedCareTasksUntil;

  const isFirstShiftEver = !clonedCareTasksUntil;

  if (isFirstShiftEver)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ctx.t("api.No active shift"),
    });

  if (clonedCareTasksUntil >= input.selectedTimestamp)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ctx.t(
        `api.No tasks to unlock We have already unlocked all tasks up until TIME`,
        {
          time: clonedCareTasksUntil.toISOString(),
        },
      ),
    });

  const careShift = await kodixCareRepository.getCurrentCareShift();
  if (!careShift)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ctx.t("api.No active shift"),
    });

  await services.calendarAndCareTask.cloneCalendarTasksToCareTasks({
    teamDb,
    careShiftId: careShift.id,
    start: clonedCareTasksUntil,
    end: input.selectedTimestamp,
  });
};
