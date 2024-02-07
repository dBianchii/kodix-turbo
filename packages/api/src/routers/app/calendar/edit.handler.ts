import { TRPCError } from "@trpc/server";
import { RRule, rrulestr } from "rrule";

import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";
import type { TEditInput } from "@kdx/validators/trpc/app/calendar";
import dayjs from "@kdx/dayjs";

interface EditOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
  input: TEditInput;
}

export const editHandler = async ({ ctx, input }: EditOptions) => {
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
          dayjs(input.selectedTimestamp).startOf("day").toDate(),
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
            ? dayjs(oldRule.options.dtstart)
                .hour(dayjs(input.from, "HH:mm").hour())
                .minute(dayjs(input.from, "HH:mm").minute())
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
            byweekday: input.weekdays ?? oldRule.options.byweekday ?? undefined,
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
            DateStart: newRule ? rrulestr(newRule).options.dtstart : undefined,
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
};
