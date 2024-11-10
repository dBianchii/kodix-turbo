import { TRPCError } from "@trpc/server";
import { RRule, rrulestr } from "rrule";

import type { TEditInputSchema } from "@kdx/validators/trpc/app/calendar";
import dayjs from "@kdx/dayjs";
import { db } from "@kdx/db/client";
import { nanoid } from "@kdx/db/nanoid";
import { calendarRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../procedures";
import { findEventMasterById } from "../../../../../../db/src/repositories/app/calendar/calendarRepository";

interface EditOptions {
  ctx: TProtectedProcedureContext;
  input: TEditInputSchema;
}

export const editHandler = async ({ ctx, input }: EditOptions) => {
  //!! TODO: REVISE SECURITY!!
  if (input.editDefinition === "single") {
    //* Havemos description, title, from e selectedTimestamp.
    //* Havemos um selectedTimestamp.
    //* Temos que procurar se temos uma ocorrencia advinda do RRULE do master que bate com o selectedTimestamp, ou se temos uma exceção que bate com o selectedTimestamp.
    //* Se não tivermos nenhum, temos que gerar um erro.

    if (input.eventExceptionId) {
      //* Temos uma exceção.  Isso significa que o usuário quer editar a exceção.
      //* Aqui, o usuário pode alterar o title e o description ou o from da exceção.

      await calendarRepository.updateEventExceptionById(db, {
        id: input.eventExceptionId,
        teamId: ctx.auth.user.activeTeamId,
        input: {
          newDate: input.from,
          title: input.title,
          description: input.description,
          type: input.type,
        },
      });
      return;

      //! END OF PROCEDURE
    }

    //* Se estamos aqui, o usuário enviou o masterId. Vamos procurar no eventMaster uma ocorrência do RRULE que bate com o selectedTimestamp.
    const eventMaster = await calendarRepository.findEventMasterById(db, {
      id: input.eventMasterId,
      teamId: ctx.auth.user.activeTeamId,
    });

    if (!eventMaster)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: ctx.t("api.Event not found"),
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
        message: ctx.t("api.Event not found"),
      }); //! END OF PROCEDURE

    //* Temos uma ocorrência. Isso significa que o usuário quer editar a ocorrência que veio do master.
    //* Para fazer isso, temos que criar uma NOVA EXCEÇÃO.
    if (
      input.title !== undefined ||
      input.description !== undefined ||
      input.type !== undefined
    ) {
      //* Se tivermos title ou description, criamos um eventInfo e também uma exceção.
      await calendarRepository.createEventException(db, {
        eventMasterId: eventMaster.id,
        originalDate: foundTimestamp,
        newDate: input.from ?? foundTimestamp,
        title: input.title,
        description: input.description,
        type: input.type,
      });

      return;
      //! END OF PROCEDURE
    }
    //* Se não tivermos title nem description nem type, ainda temos o from. Criamos uma exceção sem eventInfo.
    else {
      await calendarRepository.createEventException(db, {
        eventMasterId: eventMaster.id,
        originalDate: foundTimestamp,
        newDate: input.from ?? foundTimestamp,
      });

      return;
    }

    //* Não temos uma exceção nem uma ocorrência que bate com o selectedTimestamp. Vamos gerar um erro.
  } else if (input.editDefinition === "thisAndFuture") {
    await db.transaction(async (tx) => {
      //* Havemos description, title, from, until, frequency, inteval, count e selectedTimestamp.
      //* Havemos um selectedTimestamp.
      //* Temos que procurar se temos uma exceção que bate com o selectedTimestamp.
      //* Se tivermos, temos que alterá-la.

      //*Deletamos as exceções seguintes, se tiver mudança em timely info.
      const shouldDeleteFutureExceptions = Boolean(
        input.from ??
          input.until ??
          input.count ??
          input.frequency ??
          input.interval ??
          input.weekdays,
      );

      if (shouldDeleteFutureExceptions)
        await calendarRepository.deleteEventExceptionsByMasterIdWithNewDateHigherOrEqualThan(
          tx,
          {
            eventMasterId: input.eventMasterId,
            date: input.selectedTimestamp,
          },
        );

      //* Aqui, Vamos editar o eventMaster antigo.

      const oldMaster = await calendarRepository.findEventMasterById(tx, {
        id: input.eventMasterId,
        teamId: ctx.auth.user.activeTeamId,
      });
      if (!oldMaster)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: ctx.t("api.Event not found"),
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
            message: ctx.t("api.Event not found"),
          });

        //! NO SPLIT REQUIRED BECAUSE ITS THE FIRST OCCURANCE! !!
        await calendarRepository.updateEventMasterById(tx, {
          id: input.eventMasterId,
          teamId: ctx.auth.user.activeTeamId,
          input: {
            title: input.title,
            description: input.description,
            type: input.type,
            dateStart: input.from ?? input.selectedTimestamp,
            dateUntil: input.until ?? oldRule.options.until ?? undefined,
            rule: new RRule({
              dtstart: input.from ?? input.selectedTimestamp,
              until: input.until ?? oldRule.options.until ?? undefined,
              freq: input.frequency ?? oldRule.options.freq,
              interval: input.interval ?? oldRule.options.interval,
              count:
                input.count !== undefined
                  ? input.count
                  : oldRule.options.count ?? undefined,
              byweekday: input.weekdays ?? oldRule.options.byweekday,
            }).toString(),
          },
        });

        if (shouldDeleteFutureExceptions) return; //* We don't need to update the exceptions if we are deleting them already.

        if (input.title || input.description || input.type)
          //* Here we are updating all of the future exceptions, because we are not deleting them. If the user has edited non-timely info, we should update the exceptions.
          await calendarRepository.updateManyEventExceptionsByEventMasterId(
            tx,
            {
              eventMasterId: input.eventMasterId,
              input: {
                title: input.title ? null : undefined, //* If these inputs were sent, we have already updated the eventMaster. Just null them out so the values are brought immediately from master.
                description: input.description ? null : undefined,
                type: input.type ? null : undefined,
              },
            },
          );

        return;
      }

      await calendarRepository.updateEventMasterById(tx, {
        id: input.eventMasterId,
        teamId: ctx.auth.user.activeTeamId,
        input: {
          dateUntil: previousOccurence,
          rule: new RRule({
            dtstart: oldRule.options.dtstart,
            until: previousOccurence,
            freq: oldRule.options.freq,
            interval: oldRule.options.interval,
            count: oldRule.options.count ?? undefined,
            byweekday: oldRule.options.byweekday,
          }).toString(),
        },
      });

      const newMasterId = nanoid();
      await calendarRepository.createEventMaster(tx, {
        id: newMasterId,
        teamId: ctx.auth.user.activeTeamId,
        dateStart: input.from ?? input.selectedTimestamp,
        dateUntil: input.until ?? oldRule.options.until ?? undefined,
        rule: new RRule({
          dtstart: input.from ?? input.selectedTimestamp,
          until: input.until ?? oldRule.options.until ?? undefined,
          freq: input.frequency ?? oldRule.options.freq,
          interval: input.interval ?? oldRule.options.interval,
          count:
            input.count !== undefined
              ? input.count
              : oldRule.options.count ?? undefined,
          byweekday: input.weekdays ?? oldRule.options.byweekday,
        }).toString(),
        title: input.title ?? oldMaster.title,
        description: input.description ?? oldMaster.description,
        createdBy: ctx.auth.user.id,
      });

      if (!shouldDeleteFutureExceptions) {
        await calendarRepository.updateEventExceptionsByMasterIdWithNewDateHigherOrEqualThan(
          tx,
          {
            eventMasterId: oldMaster.id,
            date: input.selectedTimestamp,
            teamId: ctx.auth.user.activeTeamId,
            input: {
              title: input.title ? null : undefined,
              description: input.description ? null : undefined,
              eventMasterId: newMasterId,
            },
          },
        );
      }

      return;
    });
  } else {
    //* Se ele alterou o title ou description, Devemos verificar se ele alterou os dois.
    //* Se ele alterou os dois, devemos apagar o eventInfo de todos os eventExceptions associados ao master e criar um novo eventInfo no master (ou atualizar um existente).
    //* Se ele apagou apenas um dos dois, devemos alterar o eventInfo do master e dos eventException associado ao master caso o eventException possua eventInfo.

    //* Se ele alterou o from, devemos alterar o DateStart, rule e DateUntil do master e remover os newDates dos eventExceptions associados ao master.

    //*Temos que pegar a nova regra se alterou o input.frequency ?? input.interval ?? input.count ?? input.until ou se alterou o input.from

    await db.transaction(async (tx) => {
      const newRule = await (async () => {
        const shouldUpdateRule =
          !!input.frequency ||
          !!input.interval ||
          input.count !== undefined ||
          !!input.until ||
          !!input.from ||
          !!input.weekdays;

        if (!shouldUpdateRule) return undefined;

        const foundEventMasterForPreviousRule = await findEventMasterById(tx, {
          id: input.eventMasterId,
          teamId: ctx.auth.user.activeTeamId,
        });

        if (!foundEventMasterForPreviousRule)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: ctx.t("api.Event not found"),
          });
        const oldRule = rrulestr(foundEventMasterForPreviousRule.rule);

        const newStartDate = input.from
          ? dayjs(oldRule.options.dtstart)
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              .hour(Number(input.from.split(":")[0]!))
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              .minute(Number(input.from.split(":")[1]!))
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
          byweekday: input.weekdays ?? oldRule.options.byweekday,
        }).toString();
      })();

      await calendarRepository.updateEventMasterById(tx, {
        id: input.eventMasterId,
        teamId: ctx.auth.user.activeTeamId,
        input: {
          title: input.title,
          type: input.type,
          description: input.description,
          dateStart: newRule ? rrulestr(newRule).options.dtstart : undefined,
          dateUntil: input.until,
          rule: newRule,
        },
      });

      if (input.from || input.until) {
        await calendarRepository.deleteEventExceptionsByMasterIdWithNewDateHigherThan(
          tx,
          {
            eventMasterId: input.eventMasterId,
            date: input.from ? undefined : input.until,
          },
        );
      }
    });
    return;
  }
};
