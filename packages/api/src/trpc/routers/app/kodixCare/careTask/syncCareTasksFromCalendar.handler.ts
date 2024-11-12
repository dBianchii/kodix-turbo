import { TRPCError } from "@trpc/server";

import { getKodixCareRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../../procedures";
import { getCareTaskRepository } from "../../../../../../../db/src/repositories/app/kodixCare/careTaskRepository";
import { services } from "../../../../../services";
import { getTeamDbFromCtx } from "../../../../getTeamDbFromCtx";

interface SyncCareTasksFromCalendarOptions {
  ctx: TProtectedProcedureContext;
}

export const syncCareTasksFromCalendarHandler = async ({
  ctx,
}: SyncCareTasksFromCalendarOptions) => {
  const teamDb = getTeamDbFromCtx(ctx);

  const kodixCareRepository = getKodixCareRepository(teamDb);
  const careTaskRepository = getCareTaskRepository(teamDb);

  const currentShift = await kodixCareRepository.getCurrentCareShift();

  if (!currentShift || currentShift.shiftEndedAt) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ctx.t("api.The current shift must be ongoing for this action"),
    });
  }

  if (currentShift.Caregiver.id !== ctx.auth.user.id)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ctx.t(
        "api.You are not the caregiver of the current shift so you cannot sync tasks",
      ),
    });

  const syncFromDate = currentShift.checkIn;
  await teamDb.transaction(async (tx) => {
    await careTaskRepository.deleteManyCareTasksThatCameFromCalendarWithDateHigherOrEqualThan(
      syncFromDate,
      tx,
    );

    await services.calendarAndCareTask.cloneCalendarTasksToCareTasks({
      start: syncFromDate,
      careShiftId: currentShift.id,
      teamDb: tx,
    });
  });
};
