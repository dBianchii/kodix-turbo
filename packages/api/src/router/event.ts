import { TRPCError } from "@trpc/server";
import moment from "moment";
import { Frequency, RRule, rrulestr } from "rrule";
import { z } from "zod";

import type { Session } from "@kdx/auth";
import type { Prisma, PrismaClient } from "@kdx/db";
import { authorizedEmails } from "@kdx/shared";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const eventRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        dateStart: z.date(),
        dateEnd: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await getAllCalendarTasksHandler({
        prisma: ctx.prisma,
        session: ctx.session,
        dateStart: input.dateStart,
        dateEnd: input.dateEnd,
      });
    }),
  create: protectedProcedure
    .input(
      z
        .object({
          title: z.string(),
          description: z.string().optional(),
          from: z.date(),
          until: z
            .date()
            .transform((date) => moment(date).endOf("day").toDate())
            .optional(),
          interval: z.number().optional(),
          count: z.number().optional(),
          frequency: z.nativeEnum(Frequency),
          weekdays: z.number().array().optional(),
        })
        .refine((data) => {
          if (data.weekdays && data.frequency !== Frequency.WEEKLY)
            return false;
          return true;
        }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.eventMaster.create({
        data: {
          title: input.title,
          description: input.description,
          rule: new RRule({
            dtstart: input.from,
            until: input.until,
            freq: input.frequency,
            interval: input.interval,
            count: input.count,
            byweekday: input.weekdays,
          }).toString(),
          teamId: ctx.session.user.activeTeamId,
          DateStart: input.from,
          DateUntil: input.until,
        },
      });
    }),

  cancel: protectedProcedure
    .input(
      z
        .object({
          eventMasterId: z.string(),
          eventExceptionId: z.string().optional(),
        })
        .and(
          z.union([
            z.object({
              exclusionDefinition: z.literal("all"),
            }),
            z.object({
              date: z.date(),
              exclusionDefinition: z.union([
                z.literal("thisAndFuture"),
                z.literal("single"),
              ]),
            }),
          ]),
        ),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.exclusionDefinition === "single") {
        if (input.eventExceptionId)
          return await ctx.prisma.$transaction(async (tx) => {
            const deletedException = await tx.eventException.delete({
              where: {
                id: input.eventExceptionId,
              },
            });
            return await tx.eventCancellation.create({
              data: {
                eventMasterId: deletedException.eventMasterId,
                originalDate: deletedException.originalDate,
              },
            });
          });

        return await ctx.prisma.eventCancellation.create({
          data: {
            EventMaster: {
              connect: {
                id: input.eventMasterId,
              },
            },
            originalDate: input.date,
          },
        });
      } else if (input.exclusionDefinition === "thisAndFuture") {
        return await ctx.prisma.$transaction(async (tx) => {
          if (input.eventExceptionId) {
            const result = await tx.eventException.deleteMany({
              where: {
                id: input.eventExceptionId,
                newDate: {
                  gte: input.date,
                },
              },
            });
            if (!result.count)
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Exception not found",
              });
          }

          const eventMaster = await tx.eventMaster.findUniqueOrThrow({
            where: {
              id: input.eventMasterId,
            },
            select: {
              rule: true,
              DateStart: true,
            },
          });

          const rule = rrulestr(eventMaster.rule);
          const occurences = rule.between(
            eventMaster.DateStart,
            input.date,
            true,
          );
          const penultimateOccurence = occurences[occurences.length - 2];

          //Here we should delete the eventMaster
          if (!penultimateOccurence)
            return await tx.eventMaster.delete({
              where: {
                id: input.eventMasterId,
              },
            });

          const options = RRule.parseString(eventMaster.rule);
          options.until = penultimateOccurence;

          return await tx.eventMaster.update({
            where: {
              id: input.eventMasterId,
            },
            data: {
              DateUntil: penultimateOccurence,
              rule: new RRule(options).toString(),
            },
          });
        });
      } else if (input.exclusionDefinition === "all") {
        //We should delete the event master. It should automatically cascade down to all other tables
        return await ctx.prisma.eventMaster.delete({
          where: {
            id: input.eventMasterId,
          },
        });
      }
    }),
  edit: protectedProcedure
    //* I cannot send count with single
    //* I cannot send interval with single
    //* I cannot send until with single
    //* I cannot send frequency with single
    //* I cannot send weekdays with single
    //* I CAN send from with all, but from cannot be at a different date (day, year, or month) from the selected timestamp event's master/exception. Only hour.
    .input(
      z
        .object({
          eventMasterId: z.string(),
          eventExceptionId: z.string().optional(),
          selectedTimestamp: z.date(),
          title: z.string().optional(),
          description: z.string().optional(),
        })
        .and(
          z.union([
            z.object({
              frequency: z.nativeEnum(Frequency).optional(),
              until: z
                .date()
                .transform((date) => moment(date).endOf("day").toDate())
                .optional(),
              interval: z.number().optional(),
              count: z.number().nullish().optional(),
              from: z.date().optional(),
              weekdays: z.number().array().optional(),

              editDefinition: z.enum(["thisAndFuture"]),
            }),
            z.object({
              frequency: z.nativeEnum(Frequency).optional(),
              until: z
                .date()
                .transform((date) => moment(date).endOf("day").toDate())
                .optional(),
              interval: z.number().optional(),
              count: z.number().nullish().optional(),
              weekdays: z.number().array().optional(),

              from: z
                .string()
                .refine(
                  (value) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value),
                  "Invalid time format. Should be HH:MM",
                )
                .optional(),

              editDefinition: z.literal("all"),
            }),
            z.object({
              from: z.date().optional(),

              editDefinition: z.literal("single"),
            }),
          ]),
        ),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.editDefinition === "single") {
        //* Havemos description, title, from e selectedTimestamp.
        //* Havemos um selectedTimestamp.
        //* Temos que procurar se temos uma ocorrencia advinda do RRULE do master que bate com o selectedTimestamp, ou se temos uma exceção que bate com o selectedTimestamp.
        //* Se não tivermos nenhum, temos que gerar um erro.

        if (input.eventExceptionId) {
          //* Temos uma exceção.  Isso significa que o usuário quer editar a exceção.
          //* Aqui, o usuário pode alterar o title e o description ou o from da exceção.
          return await ctx.prisma.eventException.update({
            where: {
              id: input.eventExceptionId,
              newDate: input.selectedTimestamp,
              EventMaster: {
                teamId: ctx.session.user.activeTeamId,
              },
            },
            data: {
              newDate: input.from,
              title: input.title,
              description: input.description,
            },
          });
          //! END OF PROCEDURE
        }

        //* Se estamos aqui, o usuário enviou o masterId. Vamos procurar no eventMaster uma ocorrência do RRULE que bate com o selectedTimestamp.
        const eventMaster = await ctx.prisma.eventMaster.findUniqueOrThrow({
          where: {
            id: input.eventMasterId,
            teamId: ctx.session.user.activeTeamId,
          },
          select: {
            id: true,
            rule: true,
          },
        });

        const evtMasterRule = rrulestr(eventMaster.rule);
        const foundTimestamp = evtMasterRule.between(
          input.selectedTimestamp,
          input.selectedTimestamp,
          true,
        )[0];

        if (!foundTimestamp)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Event not found",
          }); //! END OF PROCEDURE

        //* Temos uma ocorrência. Isso significa que o usuário quer editar a ocorrência que veio do master.
        //* Para fazer isso, temos que criar uma NOVA EXCEÇÃO.
        if (input.title !== undefined || input.description !== undefined) {
          //* Se tivermos title ou description, criamos um eventInfo e também uma exceção.
          return await ctx.prisma.eventException.create({
            data: {
              EventMaster: {
                connect: {
                  id: eventMaster.id,
                },
              },
              description: input.description,
              title: input.title,
              originalDate: foundTimestamp,
              newDate: input.from ?? foundTimestamp,
            },
          });
          //! END OF PROCEDURE
        } else
          return await ctx.prisma.eventException.create({
            //* Se não tivermos title nem description, ainda temos o from. Criamos uma exceção sem eventInfo.
            data: {
              eventMasterId: eventMaster.id,
              originalDate: foundTimestamp,
              newDate: input.from ?? foundTimestamp,
            },
          }); //! END OF PROCEDURE

        //* Não temos uma exceção nem uma ocorrência que bate com o selectedTimestamp. Vamos gerar um erro.
      } else if (input.editDefinition === "thisAndFuture") {
        await ctx.prisma.$transaction(
          async (tx) => {
            //* Havemos description, title, from, until, frequency, inteval, count e selectedTimestamp.
            //* Havemos um selectedTimestamp.
            //* Temos que procurar se temos uma exceção que bate com o selectedTimestamp.
            //* Se tivermos, temos que alterá-la.

            //*Deletamos as exceções seguintes, se tiver mudanã em timely info.
            const shouldDeleteFutureExceptions = Boolean(
              input.from ??
                input.until ??
                input.count ??
                input.frequency ??
                input.interval ??
                input.weekdays,
            );
            if (shouldDeleteFutureExceptions)
              await tx.eventException.deleteMany({
                where: {
                  EventMaster: {
                    teamId: ctx.session.user.activeTeamId,
                    id: input.eventMasterId,
                  },
                  newDate: {
                    gte: input.selectedTimestamp,
                  },
                },
              });

            //* Aqui, Vamos editar o eventMaster antigo.
            const oldMaster = await tx.eventMaster.findUniqueOrThrow({
              where: {
                id: input.eventMasterId,
                teamId: ctx.session.user.activeTeamId,
              },
              select: {
                rule: true,
                title: true,
                description: true,
                id: true,
              },
            });
            const oldRule = rrulestr(oldMaster.rule);
            const previousOccurence = oldRule.before(
              moment(input.selectedTimestamp).startOf("day").toDate(),
              false,
            );
            if (!previousOccurence) {
              //* It means that the selectedTimestamp
              //* is either the first occurence of the event or it is before the first occurence.
              //* If it is before the first occurence, we should have an exception.
              //* If it is the first occurence, we should just edit the eventMaster.
              if (input.selectedTimestamp < oldRule.options.dtstart)
                throw new TRPCError({
                  code: "NOT_FOUND",
                  message: "Event not found",
                });

              //! NO SPLIT REQUIRED !!
              return await tx.eventMaster.update({
                where: {
                  id: input.eventMasterId,
                  teamId: ctx.session.user.activeTeamId,
                },
                data: {
                  EventExceptions: shouldDeleteFutureExceptions
                    ? undefined //if they're deleted, no need for update
                    : {
                        updateMany: {
                          where: {},
                          data: {
                            title: input.title ? null : undefined,
                            description: input.description ? null : undefined,
                          },
                        },
                      },
                  title: input.title,
                  description: input.description,
                  DateStart: input.from ?? input.selectedTimestamp,
                  DateUntil: input.until ?? oldRule.options.until ?? undefined,
                  rule: new RRule({
                    dtstart: input.from ?? input.selectedTimestamp,
                    until: input.until ?? oldRule.options.until ?? undefined,
                    freq: input.frequency ?? oldRule.options.freq,
                    interval: input.interval ?? oldRule.options.interval,
                    count:
                      input.count !== undefined
                        ? input.count
                        : oldRule.options.count ?? undefined,
                    byweekday:
                      input.weekdays ?? oldRule.options.byweekday ?? undefined,
                  }).toString(),
                },
              });
            }

            const updatedOldMaster = await tx.eventMaster.update({
              where: {
                id: input.eventMasterId,
                teamId: ctx.session.user.activeTeamId,
              },
              data: {
                DateUntil: previousOccurence,
                rule: new RRule({
                  dtstart: oldRule.options.dtstart,
                  until: previousOccurence,
                  freq: oldRule.options.freq,
                  interval: oldRule.options.interval,
                  count: oldRule.options.count ?? undefined,
                  byweekday: oldRule.options.byweekday ?? undefined,
                }).toString(),
              },
              select: {
                title: true,
                description: true,
              },
            });
            if (!updatedOldMaster)
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Could not update event master",
              });

            const newMaster = await tx.eventMaster.create({
              data: {
                teamId: ctx.session.user.activeTeamId,
                DateStart: input.from ?? input.selectedTimestamp,
                DateUntil: input.until ?? oldRule.options.until ?? undefined,
                rule: new RRule({
                  dtstart: input.from ?? input.selectedTimestamp,
                  until: input.until ?? oldRule.options.until ?? undefined,
                  freq: input.frequency ?? oldRule.options.freq,
                  interval: input.interval ?? oldRule.options.interval,
                  count:
                    input.count !== undefined
                      ? input.count
                      : oldRule.options.count ?? undefined,
                  byweekday:
                    input.weekdays ?? oldRule.options.byweekday ?? undefined,
                }).toString(),
                title: input.title ?? updatedOldMaster.title,
                description: input.description ?? updatedOldMaster.description,
              },
              select: {
                id: true,
              },
            });

            if (!shouldDeleteFutureExceptions) {
              //We should connect the oldMaster's exceptions to the new one.
              await tx.eventException.updateMany({
                where: {
                  EventMaster: {
                    id: oldMaster.id,
                    teamId: ctx.session.user.activeTeamId,
                  },
                  newDate: {
                    gte: input.selectedTimestamp,
                  },
                },
                data: {
                  title: input.title ? null : undefined,
                  description: input.description ? null : undefined,
                  eventMasterId: newMaster.id,
                },
              });
            }

            return;
          },
          {
            timeout: 99999,
            maxWait: 99999,
          },
        );
      } else if (input.editDefinition === "all") {
        //* Se ele alterou o title ou description, Devemos verificar se ele alterou os dois.
        //* Se ele alterou os dois, devemos apagar o eventInfo de todos os eventExceptions associados ao master e criar um novo eventInfo no master (ou atualizar um existente).
        //* Se ele apagou apenas um dos dois, devemos alterar o eventInfo do master e dos eventException associado ao master caso o eventException possua eventInfo.

        //* Se ele alterou o from, devemos alterar o DateStart, rule e DateUntil do master e remover os newDates dos eventExceptions associados ao master.

        //*Temos que pegar a nova regra se alterou o input.frequency ?? input.interval ?? input.count ?? input.until ou se alterou o input.from

        return await ctx.prisma.$transaction(
          async (tx) => {
            const newRule = await (async () => {
              const shouldUpdateRule = Boolean(
                input.frequency ??
                  input.interval ??
                  input.count !== undefined ??
                  input.until ??
                  input.from ??
                  input.weekdays,
              );
              if (!shouldUpdateRule) return undefined;

              const oldRule = rrulestr(
                (
                  await tx.eventMaster.findUniqueOrThrow({
                    where: {
                      id: input.eventMasterId,
                      teamId: ctx.session.user.activeTeamId,
                    },
                    select: {
                      rule: true,
                    },
                  })
                ).rule,
              );

              const newStartDate = input.from
                ? moment(oldRule.options.dtstart)
                    .hours(moment(input.from, "HH:mm").hours())
                    .minutes(moment(input.from, "HH:mm").minutes())
                    .toDate()
                : oldRule.options.dtstart;

              return new RRule({
                dtstart: newStartDate,
                until: input.until ?? oldRule.options.until ?? undefined,
                freq: input.frequency ?? oldRule.options.freq,
                interval: input.interval ?? oldRule.options.interval,
                count:
                  input.count !== undefined
                    ? input.count
                    : oldRule.options.count ?? undefined,
                byweekday:
                  input.weekdays ?? oldRule.options.byweekday ?? undefined,
              }).toString();
            })();
            return await tx.eventMaster.update({
              where: {
                id: input.eventMasterId,
                teamId: ctx.session.user.activeTeamId,
              },
              data: {
                EventExceptions: {
                  deleteMany:
                    input.from ?? input.until
                      ? input.from
                        ? {} //Delete all exceptions if from is changed.
                        : {
                            newDate: {
                              gt: input.until, //Else, delete only the exceptions that are after or equal to the new until.
                            },
                          }
                      : undefined,

                  updateMany: {
                    where: {},
                    data: {
                      title: input.title !== undefined ? null : undefined,
                      description:
                        input.description !== undefined ? null : undefined,
                    },
                  },
                },

                title: input.title,
                description: input.description,
                DateStart: newRule
                  ? rrulestr(newRule).options.dtstart
                  : undefined,
                DateUntil: input.until,
                rule: newRule,
              },
            });
          },
          {
            timeout: 10000,
            maxWait: 10000,
          },
        );
      }
    }),
  nuke: protectedProcedure.mutation(async ({ ctx }) => {
    if (
      ctx.session.user.email &&
      !authorizedEmails.includes(ctx.session.user.email)
    )
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to do this",
      });

    await ctx.prisma.$transaction([
      ctx.prisma.eventMaster.deleteMany({
        where: { teamId: ctx.session.user.activeTeamId },
      }),
    ]);
  }),
});

export async function getAllCalendarTasksHandler({
  prisma,
  session,
  dateStart,
  dateEnd,
}: {
  prisma: PrismaClient | Prisma.TransactionClient;
  session: Session;
  dateStart: Date;
  dateEnd: Date;
}) {
  const eventMasters = await prisma.eventMaster.findMany({
    where: {
      teamId: session.user.activeTeamId,
      AND: [
        {
          DateStart: {
            lte: dateEnd,
          },
        },
        {
          OR: [{ DateUntil: { gte: dateStart } }, { DateUntil: null }],
        },
      ],
    },
  });

  //Handling Exceptions and Cancelations
  const eventExceptions = await prisma.eventException.findMany({
    where: {
      EventMaster: {
        teamId: session.user.activeTeamId,
      },
      OR: [
        {
          originalDate: { gte: dateStart, lte: dateEnd },
        },
        {
          newDate: { gte: dateStart, lte: dateEnd },
        },
      ],
    },
    include: {
      EventMaster: {
        select: {
          rule: true,
          title: true,
          description: true,
        },
      },
    },
  });

  const eventCancelations = await prisma.eventCancellation.findMany({
    where: {
      EventMaster: {
        teamId: session.user.activeTeamId,
      },
      originalDate: {
        gte: dateStart,
        lte: dateEnd,
      },
    },
    include: {
      EventMaster: {
        select: {
          id: true,
        },
      },
    },
  });

  //* We have all needed data. Now, let's add all masters and exceptions to calendarTasks.
  interface CalendarTask {
    title: string | undefined;
    description: string | undefined;
    date: Date;
    eventMasterId: string;
    eventExceptionId: string | undefined;
    originaDate?: Date | undefined;
    rule: string;
  }
  let calendarTasks: CalendarTask[] = [];

  for (const eventMaster of eventMasters) {
    const rrule = rrulestr(eventMaster.rule);
    const allDates = rrule.between(dateStart, dateEnd, true);

    for (const date of allDates)
      calendarTasks.push({
        eventMasterId: eventMaster.id,
        eventExceptionId: undefined,
        title: eventMaster.title ?? undefined,
        description: eventMaster.description ?? undefined,
        date: date,
        rule: eventMaster.rule,
      });
  }

  for (const eventException of eventExceptions)
    calendarTasks.push({
      eventMasterId: eventException.eventMasterId,
      eventExceptionId: eventException.id,
      title:
        eventException.title ?? eventException.EventMaster?.title ?? undefined,
      description:
        eventException?.description ??
        eventException.EventMaster?.description ??
        undefined,
      date: eventException.newDate,
      originaDate: eventException.originalDate,
      rule: eventException.EventMaster.rule,
    });

  //we have exceptions and recurrences from masters in calendarTasks. Some master recurrences must be deleted.
  //because of the exception's change of date.
  calendarTasks = calendarTasks
    .map((calendarTask) => {
      if (calendarTask.eventExceptionId) {
        //handle exclusion of tasks that came from exceptions. (shouldnt appear if are outside selected range)
        if (
          moment(dateStart).isAfter(calendarTask.date) ||
          moment(dateEnd).isBefore(calendarTask.date)
        )
          return null;
        return calendarTask;
      }
      //Cuidar de cancelamentos -> deletar os advindos do master
      const foundCancelation = eventCancelations.some(
        (x) =>
          x.eventMasterId === calendarTask.eventMasterId &&
          moment(x.originalDate).isSame(calendarTask.date),
      );
      if (foundCancelation) return null;

      //For a calendarTask that came from master,
      //Delete it if it has an exception associated with it. (originalDate === calendartask date)
      const foundException = calendarTasks.some(
        (x) =>
          x.eventExceptionId &&
          x.eventMasterId === calendarTask.eventMasterId &&
          moment(calendarTask.date).isSame(x.originaDate, "day"),
      );
      if (foundException) return null;

      return calendarTask;
    })
    .filter((task): task is CalendarTask => !!task)
    .sort((a, b) => {
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      return 0;
    });

  return calendarTasks;
}
