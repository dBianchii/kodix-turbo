import { TRPCError } from "@trpc/server";

import type { TUnlockMoreTasksInputSchema } from "@kdx/validators/trpc/app/kodixCare/careTask";
import { db } from "@kdx/db/client";
import { kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../../procedures";
import { getConfigHandler } from "../../getConfig.handler";
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

  await cloneCalendarTasksToCareTasks({
    tx: db,
    start: clonedCareTasksUntil,
    end: input.selectedTimestamp,
    ctx,
  });
};
