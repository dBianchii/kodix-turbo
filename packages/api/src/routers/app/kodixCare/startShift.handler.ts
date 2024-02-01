import { TRPCError } from "@trpc/server";

import type { Session } from "@kdx/auth";
import type { Prisma, PrismaClient } from "@kdx/db";
import dayjs from "@kdx/dayjs";
import WarnPreviousShiftNotEnded from "@kdx/react-email/warn-previous-shift-not-ended";
import { kodixCareAppId } from "@kdx/shared";

import { sendEmail } from "../../../internal/email/email";
import { getAllHandler } from "../../event/getAll.handler";
import { getConfigHandler } from "../getConfig.handler";
import { getCurrentCareShiftHandler } from "./getCurrentCareShift.handler";

interface StartShiftOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
}

export const startShiftHandler = async ({ ctx }: StartShiftOptions) => {
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

    return await ctx.prisma.$transaction(async (tx) => {
      const careShift = await tx.careShift.create({
        data: {
          caregiverId: ctx.session.user.id,
          teamId: ctx.session.user.activeTeamId,
          checkIn: new Date(),
        },
      });
      return await cloneCalendarTasksToCareTasks({
        careShiftId: careShift.id,
        start: yesterdayStartOfDay,
        end: tomorrowEndOfDay,
        tx,
      });
    });
  }

  //2. Verify if there is a previous shift that has not ended yet
  const lastCareShift = await getCurrentCareShiftHandler({
    ctx,
  });
  if (!lastCareShift)
    //Needed for typesafety
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        "No previous careshift found even though clonedCalendarTasks exists. This should only happen if we allow users to delete careshifts.",
    });

  if (!lastCareShift.shiftEndedAt) {
    await ctx.prisma.$transaction(async (tx) => {
      await tx.careShift.update({
        where: {
          id: lastCareShift.id,
        },
        data: {
          shiftEndedAt: new Date(),
        },
      });
      await tx.careShift.create({
        data: {
          teamId: ctx.session.user.activeTeamId,
          checkIn: new Date(),
          caregiverId: ctx.session.user.id,
        },
      });
      await cloneCalendarTasksToCareTasks({
        careShiftId: lastCareShift.id,
        start: clonedCareTasksUntil,
        end: tomorrowEndOfDay,
        tx,
      });
    });
    if (lastCareShift.Caregiver.email)
      await sendEmail({
        from: "Kodix <notification@kodix.com.br>",
        to: lastCareShift.Caregiver.email,
        subject: `Your last shift was ended by ${ctx.session.user.name}`,
        react: WarnPreviousShiftNotEnded(),
      });
  }

  //3. Create a new shift, since the previous one has ended
  await ctx.prisma.$transaction(async (tx) => {
    const newCareShift = await tx.careShift.create({
      data: {
        teamId: ctx.session.user.activeTeamId,
        checkIn: new Date(),
        caregiverId: ctx.session.user.id,
      },
    });
    await cloneCalendarTasksToCareTasks({
      careShiftId: newCareShift.id,
      start: clonedCareTasksUntil,
      end: tomorrowEndOfDay,
      tx,
    });
  });

  async function cloneCalendarTasksToCareTasks({
    start,
    end,
    tx,
    careShiftId,
  }: {
    start: Date;
    end: Date;
    careShiftId: string;
    tx: Prisma.TransactionClient; //Function must be used with a transaction
  }) {
    const calendarTasks = await getAllHandler({
      ctx,
      input: {
        dateStart: start,
        dateEnd: end,
      },
    });

    await tx.careTask.createMany({
      data: calendarTasks.map((calendarTask) => ({
        idCareShift: careShiftId,
        teamId: ctx.session.user.activeTeamId,
        title: calendarTask.title,
        description: calendarTask.description,
        eventDate: calendarTask.date,
        eventMasterId: calendarTask.eventMasterId,
        doneByUserId: null,
        doneAt: new Date(),
      })),
    });

    // await saveAppConfig({
    //   appId: kodixCareAppId,
    //   config: {
    //     clonedCareTasksUntil: end,
    //   },
    //   prisma: tx,
    //   activeTeamId: ctx.session.user.activeTeamId,
    // });
  }
};
