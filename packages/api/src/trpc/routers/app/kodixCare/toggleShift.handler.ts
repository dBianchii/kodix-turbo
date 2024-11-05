import { TRPCError } from "@trpc/server";

import dayjs from "@kdx/dayjs";
import { nanoid } from "@kdx/db/nanoid";
import { careTaskRepository, kodixCareRepository } from "@kdx/db/repositories";
import WarnPreviousShiftNotEnded from "@kdx/react-email/warn-previous-shift-not-ended";
import { KODIX_NOTIFICATION_FROM_EMAIL, kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../procedures";
import { resend } from "../../../../sdks/email";
import { getConfigHandler } from "../getConfig.handler";
import { cloneCalendarTasksToCareTasks } from "./utils";

interface ToggleShiftOptions {
  ctx: TProtectedProcedureContext;
}

/**Starts a new shift and ends the previous one */
export const toggleShiftHandler = async ({ ctx }: ToggleShiftOptions) => {
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

    await ctx.db.transaction(async (tx) => {
      const careShiftId = nanoid();
      await kodixCareRepository.createCareShift(tx, {
        id: careShiftId,
        caregiverId: ctx.auth.user.id,
        teamId: ctx.auth.user.activeTeamId,
      });

      await cloneCalendarTasksToCareTasks({
        careShiftId,
        start: yesterdayStartOfDay,
        end: tomorrowEndOfDay,
        ctx: {
          ...ctx,
          db: tx,
        },
      });
    });
    return;
  }

  const currentShift = await kodixCareRepository.getCurrentCareShiftByTeamId(
    ctx.auth.user.activeTeamId,
  );
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

  await ctx.db.transaction(async (tx) => {
    //*End the current shift
    await kodixCareRepository.updateCareShift(tx, {
      id: currentShift.id,
      input: {
        checkOut: loggedUserIsCaregiverForCurrentShift ? new Date() : undefined, //Also checkOut if user is the caregiver
        shiftEndedAt: new Date(),
      },
    });

    const now = new Date();
    //*Start a new shift
    const [newCareShift] = await kodixCareRepository.createCareShift(tx, {
      teamId: ctx.auth.user.activeTeamId,
      checkIn: now,
      caregiverId: ctx.auth.user.id,
    });

    //* Move all tasks from previous shift to current shift
    const previousShift = await kodixCareRepository.getPreviousShiftByTeamId(
      ctx.auth.user.activeTeamId,
    );
    if (previousShift) {
      await careTaskRepository.reassignCareTasksFromDateToShift(tx, {
        previousCareShiftId: previousShift.id,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        newCareShiftId: newCareShift!.id,
        date: now,
      });
    }

    await cloneCalendarTasksToCareTasks({
      careShiftId: currentShift.id,
      start: clonedCareTasksUntil,
      end: tomorrowEndOfDay,
      ctx: {
        ...ctx,
        db: tx,
      },
    });

    if (!currentShift.checkOut && !loggedUserIsCaregiverForCurrentShift)
      //Send email to caregiver if the previous shift was not ended by the caregiver
      await resend.emails.send({
        from: KODIX_NOTIFICATION_FROM_EMAIL, //TODO: go through kodix notification center!
        to: currentShift.Caregiver.email,
        subject: ctx.t(`api.Your last shift was ended by NAME`, {
          name: ctx.auth.user.name,
        }),
        react: WarnPreviousShiftNotEnded(),
      });
  });
  return;
};
