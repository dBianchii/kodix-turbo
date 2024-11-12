import { TRPCError } from "@trpc/server";

import dayjs from "@kdx/dayjs";
import { nanoid } from "@kdx/db/nanoid";
import {
  getCareTaskRepository,
  getKodixCareRepository,
} from "@kdx/db/repositories";
import WarnPreviousShiftNotEnded from "@kdx/react-email/warn-previous-shift-not-ended";
import { KODIX_NOTIFICATION_FROM_EMAIL, kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../procedures";
import { resend } from "../../../../sdks/email";
import { services } from "../../../../services";
import { getTeamDbFromCtx } from "../../../getTeamDbFromCtx";
import { getConfigHandler } from "../getConfig.handler";

interface ToggleShiftOptions {
  ctx: TProtectedProcedureContext;
}

/**Starts a new shift and ends the previous one */
export const toggleShiftHandler = async ({ ctx }: ToggleShiftOptions) => {
  const teamDb = getTeamDbFromCtx(ctx);

  const kodixCareRepository = getKodixCareRepository(teamDb);
  const careTaskRepository = getCareTaskRepository(teamDb);

  const clonedCareTasksUntil = (
    await getConfigHandler({
      ctx,
      input: {
        appId: kodixCareAppId,
      },
    })
  ).clonedCareTasksUntil;

  const tomorrowEndOfDay = dayjs.utc().add(1, "day").endOf("day").toDate();

  //1. Verify if it is the first shift ever
  //TODO: verificar se a condição abaixo está correta
  const isFirstShiftEver = !clonedCareTasksUntil;
  if (isFirstShiftEver) {
    const yesterdayStartOfDay = dayjs
      .utc()
      .subtract(1, "day")
      .startOf("day")
      .toDate();

    await teamDb.transaction(async (tx) => {
      const careShiftId = nanoid();
      await kodixCareRepository.createCareShift(
        {
          id: careShiftId,
          caregiverId: ctx.auth.user.id,
          teamId: ctx.auth.user.activeTeamId,
        },
        tx,
      );

      await services.calendarAndCareTask.cloneCalendarTasksToCareTasks({
        careShiftId,
        start: yesterdayStartOfDay,
        end: tomorrowEndOfDay,
        teamDb: tx,
      });
    });
    return;
  }

  const currentShift = await kodixCareRepository.getCurrentCareShift();
  if (!currentShift)
    //Needed for typesafety
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: ctx.t(
        "api.No previous careshift found even though clonedCalendarTasks exists This should only happen if we allow users to delete careshifts",
      ),
    });

  const loggedUserIsCaregiverForCurrentShift =
    ctx.auth.user.id === currentShift.Caregiver.id;

  await teamDb.transaction(async (tx) => {
    //*End the current shift
    await kodixCareRepository.updateCareShift(
      {
        id: currentShift.id,
        input: {
          checkOut: loggedUserIsCaregiverForCurrentShift
            ? new Date()
            : undefined, //Also checkOut if user is the caregiver
          shiftEndedAt: new Date(),
        },
      },
      tx,
    );

    const now = new Date();
    //*Start a new shift
    const [newCareShift] = await kodixCareRepository.createCareShift(
      {
        teamId: ctx.auth.user.activeTeamId,
        checkIn: now,
        caregiverId: ctx.auth.user.id,
      },
      tx,
    );

    //* Move all tasks from previous shift to current shift
    const previousShift = await kodixCareRepository.getPreviousShift(tx);
    if (previousShift) {
      await careTaskRepository.reassignCareTasksFromDateToShift(
        {
          previousCareShiftId: previousShift.id,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          newCareShiftId: newCareShift!.id,
          date: now,
        },
        tx,
      );
    }

    await services.calendarAndCareTask.cloneCalendarTasksToCareTasks({
      careShiftId: currentShift.id,
      start: clonedCareTasksUntil,
      end: tomorrowEndOfDay,
      teamDb: tx,
    });

    if (!currentShift.checkOut && !loggedUserIsCaregiverForCurrentShift)
      //Send email to caregiver if the previous shift was not ended by the caregiver
      await resend.emails.send({
        from: KODIX_NOTIFICATION_FROM_EMAIL, //TODO: go through kodix notification center!
        to: currentShift.Caregiver.email,
        subject: ctx.t(`api.Your last shift was ended by NAME`, {
          name: ctx.auth.user.name,
        }),
        react: WarnPreviousShiftNotEnded({
          t: ctx.t,
          personWhoEndedShiftName: ctx.auth.user.name,
        }),
      });
  });
  return;
};
