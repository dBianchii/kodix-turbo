import { TRPCError } from "@trpc/server";

import dayjs from "@kdx/dayjs";
import { eq, schema } from "@kdx/db";
import WarnPreviousShiftNotEnded from "@kdx/react-email/warn-previous-shift-not-ended";
import {
  kodixCareAppId,
  kodixNotificationFromEmail,
  nanoid,
} from "@kdx/shared";

import type { TProtectedProcedureContext } from "~/procedures";
import { resend } from "../../../utils/email/email";
import { getConfigHandler } from "../getConfig.handler";
import { getCurrentCareShiftHandler } from "./getCurrentCareShift.handler";
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

    return await ctx.db.transaction(async (tx) => {
      const careShiftId = nanoid();
      await ctx.db.insert(schema.careShifts).values({
        id: careShiftId,
        caregiverId: ctx.session.user.id,
        teamId: ctx.session.user.activeTeamId,
      });

      return await cloneCalendarTasksToCareTasks({
        careShiftId: careShiftId,
        start: yesterdayStartOfDay,
        end: tomorrowEndOfDay,
        ctx: {
          ...ctx,
          db: tx,
        },
      });
    });
  }

  const lastCareShift = await getCurrentCareShiftHandler({
    ctx,
  });
  if (!lastCareShift)
    //Needed for typesafety
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        "No previous careshift found even though clonedCalendarTasks exists. This should only happen if we allow users to past careshifts.",
    });

  //2. Verify if previous shift that has not ended yet
  const loggedUserIsCaregiverForCurrentShift =
    ctx.session.user.id === lastCareShift.Caregiver.id;

  return await ctx.db.transaction(async (tx) => {
    await tx
      .update(schema.careShifts)
      .set({
        checkOut: loggedUserIsCaregiverForCurrentShift ? new Date() : undefined, //Also checkOut if user is the caregiver
        shiftEndedAt: new Date(),
      })
      .where(eq(schema.careShifts.id, lastCareShift.id));

    await tx.insert(schema.careShifts).values({
      id: nanoid(),
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
        from: kodixNotificationFromEmail,
        to: lastCareShift.Caregiver.email,
        subject: `Your last shift was ended by ${ctx.session.user.name}`,
        react: WarnPreviousShiftNotEnded(),
      });
  });
};
