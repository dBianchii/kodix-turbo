import { TRPCError } from "@trpc/server";
import { getTranslations } from "next-intl/server";

import dayjs from "@kdx/dayjs";
import { eq } from "@kdx/db";
import { nanoid } from "@kdx/db/nanoid";
import { careShifts } from "@kdx/db/schema";
import WarnPreviousShiftNotEnded from "@kdx/react-email/warn-previous-shift-not-ended";
import { KODIX_NOTIFICATION_FROM_EMAIL, kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../procedures";
import { resend } from "../../../utils/email";
import { getConfigHandler } from "../getConfig.handler";
import { getCurrentCareShiftHandler } from "./getCurrentCareShift.handler";
import { cloneCalendarTasksToCareTasks } from "./utils";

interface ToggleShiftOptions {
  ctx: TProtectedProcedureContext;
}

/**Starts a new shift and ends the previous one */
export const toggleShiftHandler = async ({ ctx }: ToggleShiftOptions) => {
  const t = await getTranslations({ locale: ctx.locale });
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
      await ctx.db.insert(careShifts).values({
        id: careShiftId,
        caregiverId: ctx.session.user.id,
        teamId: ctx.session.user.activeTeamId,
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

  const lastCareShift = await getCurrentCareShiftHandler({
    ctx,
  });
  if (!lastCareShift)
    //Needed for typesafety
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: t(
        "api.No previous careshift found even though clonedCalendarTasks exists This should only happen if we allow users to delete careshifts",
      ),
    });

  //2. Verify if previous shift that has not ended yet
  const loggedUserIsCaregiverForCurrentShift =
    ctx.session.user.id === lastCareShift.Caregiver.id;

  await ctx.db.transaction(async (tx) => {
    await tx
      .update(careShifts)
      .set({
        checkOut: loggedUserIsCaregiverForCurrentShift ? new Date() : undefined, //Also checkOut if user is the caregiver
        shiftEndedAt: new Date(),
      })
      .where(eq(careShifts.id, lastCareShift.id));

    await tx.insert(careShifts).values({
      teamId: ctx.session.user.activeTeamId,
      checkIn: new Date(),
      caregiverId: ctx.session.user.id,
    });

    await cloneCalendarTasksToCareTasks({
      careShiftId: lastCareShift.id,
      start: clonedCareTasksUntil,
      end: tomorrowEndOfDay,
      ctx: {
        ...ctx,
        db: tx,
      },
    });

    if (!lastCareShift.checkOut && !loggedUserIsCaregiverForCurrentShift)
      //Send email to caregiver if the previous shift was not ended by the caregiver
      await resend.emails.send({
        from: KODIX_NOTIFICATION_FROM_EMAIL,
        to: lastCareShift.Caregiver.email,
        subject: t(`api.Your last shift was ended by NAME`, {
          name: ctx.session.user.name,
        }),
        react: WarnPreviousShiftNotEnded(),
      });
  });
  return;
};
