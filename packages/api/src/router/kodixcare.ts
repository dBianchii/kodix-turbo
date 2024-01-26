import { TRPCError } from "@trpc/server";
import moment from "moment";

import type { Prisma, PrismaClient } from "@kdx/db";
import {
  kodixCareAdminRoleId,
  kodixCareAppId,
  todoAdminRoleId,
} from "@kdx/shared";

import { kodixCareInstalledMiddleware, roleMiddlewareOR } from "../middlewares";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getAppConfig } from "./apps";
import { getAllCalendarTasksHandler } from "./event";

export const kodixCareRouter = createTRPCRouter({
  getCurrentShift: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .query(async ({ ctx }) =>
      getCurrentCareShift({
        teamId: ctx.session.user.activeTeamId,
        prisma: ctx.prisma,
      }),
    ),
  startShift: protectedProcedure
    .use(kodixCareInstalledMiddleware)
    .use(roleMiddlewareOR([kodixCareAdminRoleId, todoAdminRoleId]))
    .mutation(async ({ ctx }) => {
      const clonedCareTasksUntil = (
        await getAppConfig({
          appId: kodixCareAppId,
          prisma: ctx.prisma,
          session: ctx.session,
        })
      ).clonedCareTasksUntil;

      const dayAfterTomorrowEndOfDay = moment
        .utc()
        .add(2, "day")
        .endOf("day")
        .toDate();

      //1. Verify if it is the first shift ever
      //TODO: verificar se a condição abaixo está correta
      const isFirstShiftEver = !clonedCareTasksUntil;
      if (isFirstShiftEver) {
        const yesterdayStartOfDay = moment
          .utc()
          .subtract(1, "day")
          .startOf("day")
          .toDate();

        return await ctx.prisma.$transaction(async (tx) => {
          const careShift = await tx.careShift.create({
            data: {
              caregiverId: ctx.session.user.id,
              teamId: ctx.session.user.activeTeamId,
              checkIn: yesterdayStartOfDay,
            },
          });
          return await cloneCalendarTasksToCareTasks({
            careShiftId: careShift.id,
            start: yesterdayStartOfDay,
            end: dayAfterTomorrowEndOfDay,
            tx,
          });
        });
      }

      //2. Verify if there is a previous shift that has not ended yet
      const lastCareShift = await getCurrentCareShift({
        teamId: ctx.session.user.activeTeamId,
        prisma: ctx.prisma,
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
            end: dayAfterTomorrowEndOfDay,
            tx,
          });
        });
        //TODO: Notificar o [Responsável anterior] de que o [Responsável novo] assumiu o turno no horário X. Deve informar ao [Responsável anterior] que ele deverá atualizar o app com o horário que finalizou o turno.
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
          end: dayAfterTomorrowEndOfDay,
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
        const calendarTasks = await getAllCalendarTasksHandler({
          dateStart: start,
          dateEnd: end,
          prisma: tx,
          session: ctx.session,
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
          })),
        });
      }
    }),
  onboardingCompleted: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.appTeamConfig.findUnique({
      where: {
        appId_teamId: {
          appId: kodixCareAppId,
          teamId: ctx.session.user.activeTeamId,
        },
        config: {
          path: "$.patientName",
          not: {
            equals: null,
          },
        },
      },
      select: { id: true },
    });
    return !!result;
  }),
});

async function getCurrentCareShift({
  teamId,
  prisma,
}: {
  teamId: string;
  prisma: PrismaClient;
}) {
  return await prisma.careShift.findFirst({
    where: {
      teamId: teamId,
      shiftEndedAt: null,
    },
    select: {
      shiftEndedAt: true,
      checkIn: true,
      checkOut: true,
      id: true,
      Caregiver: {
        select: {
          email: true,
          id: true,
          image: true,
          name: true,
        },
      },
    },
  });
}
