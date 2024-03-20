import { TRPCError } from "@trpc/server";

import type { DrizzleTransaction } from "@kdx/db";
import dayjs from "@kdx/dayjs";
import { eq, schema } from "@kdx/db";
import { kodixNotificationFromEmail } from "@kdx/react-email/constants";
import WarnPreviousShiftNotEnded from "@kdx/react-email/warn-previous-shift-not-ended";
import { kodixCareAppId } from "@kdx/shared";

import type { TProtectedProcedureContext } from "../../../trpc";
import { sendEmail } from "../../../utils/email/email";
import { getAllHandler } from "../calendar/getAll.handler";
import { getConfigHandler } from "../getConfig.handler";
import { saveConfigHandler } from "../saveConfig.handler";
import { getCurrentCareShiftHandler } from "./getCurrentCareShift.handler";

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

    // return await ctx.prisma.$transaction(async (tx) => {
    //   const careShift = await tx.careShift.create({
    //     data: {
    //       caregiverId: ctx.session.user.id,
    //       teamId: ctx.session.user.activeTeamId,
    //       checkIn: new Date(),
    //     },
    //   });
    //   return await cloneCalendarTasksToCareTasks({
    //     careShiftId: careShift.id,
    //     start: yesterdayStartOfDay,
    //     end: tomorrowEndOfDay,
    //     tx,
    //   });
    // });
    return await ctx.db.transaction(async (tx) => {
      const careShiftId = crypto.randomUUID();
      await ctx.db.insert(schema.careShifts).values({
        id: careShiftId,
        caregiverId: ctx.session.user.id,
        teamId: ctx.session.user.activeTeamId,
      });

      return await cloneCalendarTasksToCareTasks({
        careShiftId: careShiftId,
        start: yesterdayStartOfDay,
        end: tomorrowEndOfDay,
        tx,
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
    // await tx.careShift.update({
    //   where: {
    //     id: lastCareShift.id,
    //   },
    //   data: {
    //     checkOut: loggedUserIsCaregiverForCurrentShift ? new Date() : undefined, //Also checkOut if user is the caregiver
    //     shiftEndedAt: new Date(),
    //   },
    // });
    await tx
      .update(schema.careShifts)
      .set({
        checkOut: loggedUserIsCaregiverForCurrentShift ? new Date() : undefined, //Also checkOut if user is the caregiver
        shiftEndedAt: new Date(),
      })
      .where(eq(schema.careShifts.id, lastCareShift.id));
    // await tx.careShift.create({
    //   data: {
    //     teamId: ctx.session.user.activeTeamId,
    //     checkIn: new Date(),
    //     caregiverId: ctx.session.user.id,
    //   },
    // });

    await tx.insert(schema.careShifts).values({
      id: crypto.randomUUID(),
      teamId: ctx.session.user.activeTeamId,
      checkIn: new Date(),
      caregiverId: ctx.session.user.id,
    });

    await cloneCalendarTasksToCareTasks({
      careShiftId: lastCareShift.id,
      start: clonedCareTasksUntil,
      end: tomorrowEndOfDay,
      tx,
    });

    if (!lastCareShift.checkOut && !loggedUserIsCaregiverForCurrentShift)
      //Send email to caregiver if the previous shift was not ended by the caregiver
      await sendEmail({
        from: kodixNotificationFromEmail,
        to: lastCareShift.Caregiver.email,
        subject: `Your last shift was ended by ${ctx.session.user.name}`,
        react: WarnPreviousShiftNotEnded(),
      });
  });

  // //3. Create a new shift, since the previous one has ended
  // await ctx.prisma.$transaction(async (tx) => {
  //   const newCareShift = await tx.careShift.create({
  //     data: {
  //       teamId: ctx.session.user.activeTeamId,
  //       checkIn: new Date(),
  //       caregiverId: ctx.session.user.id,
  //     },
  //   });
  //   await cloneCalendarTasksToCareTasks({
  //     careShiftId: newCareShift.id,
  //     start: clonedCareTasksUntil,
  //     end: tomorrowEndOfDay,
  //     tx,
  //   });
  // });

  async function cloneCalendarTasksToCareTasks({
    start,
    end,
    tx,
    careShiftId,
  }: {
    start: Date;
    end: Date;
    careShiftId: string;
    tx: DrizzleTransaction; //Function must be used with a transaction
  }) {
    const calendarTasks = await getAllHandler({
      ctx,
      input: {
        dateStart: start,
        dateEnd: end,
      },
    });
    // await tx.careTask.createMany({
    //   data: calendarTasks.map((calendarTask) => ({
    //     idCareShift: careShiftId,
    //     teamId: ctx.session.user.activeTeamId,
    //     title: calendarTask.title,
    //     description: calendarTask.description,
    //     eventDate: calendarTask.date,
    //     eventMasterId: calendarTask.eventMasterId,
    //     doneByUserId: null,
    //     doneAt: new Date(),
    //   })),
    // });

    if (calendarTasks.length > 0)
      await tx.insert(schema.careTasks).values(
        calendarTasks.map((calendarTask) => ({
          id: crypto.randomUUID(),
          idCareShift: careShiftId,
          teamId: ctx.session.user.activeTeamId,
          title: calendarTask.title,
          description: calendarTask.description,
          eventDate: calendarTask.date,
          eventMasterId: calendarTask.eventMasterId,
          doneByUserId: null,
          doneAt: new Date(),
        })),
      );

    await saveConfigHandler({
      ctx,
      input: {
        appId: kodixCareAppId,
        config: {
          clonedCareTasksUntil: end,
        },
      },
    });
  }
};
