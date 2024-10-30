import { TRPCError } from "@trpc/server";
import { getTranslations } from "next-intl/server";

import type { TUnlockMoreTasksInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";
import { kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../../procedures";
import { getConfigHandler } from "../../getConfig.handler";
import { getCurrentShiftHandler } from "../getCurrentShift.handler";
import { cloneCalendarTasksToCareTasks } from "../utils";

interface UnlockMoreTasksInputOptions {
  ctx: TProtectedProcedureContext;
  input: TUnlockMoreTasksInputSchema;
}

export const unlockMoreTasksHandler = async ({
  ctx,
  input,
}: UnlockMoreTasksInputOptions) => {
  const clonedCareTasksUntil = (
    await getConfigHandler({
      ctx,
      input: {
        appId: kodixCareAppId,
      },
    })
  ).clonedCareTasksUntil;

  const isFirstShiftEver = !clonedCareTasksUntil;

  const t = await getTranslations({ locale: ctx.locale });
  if (isFirstShiftEver)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: t("api.No active shift"),
    });

  if (clonedCareTasksUntil >= input.selectedTimestamp)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: t(
        `api.No tasks to unlock We have already unlocked all tasks up until TIME`,
        {
          time: clonedCareTasksUntil.toISOString(),
        },
      ),
    });

  const careShift = await getCurrentShiftHandler({ ctx });
  if (!careShift)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: t("api.No active shift"),
    });

  await cloneCalendarTasksToCareTasks({
    careShiftId: careShift.id,
    start: clonedCareTasksUntil,
    end: input.selectedTimestamp,
    ctx,
  });
};
