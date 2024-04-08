import { TRPCError } from "@trpc/server";
import { RRule, rrulestr } from "rrule";

import type { TEditInputSchema } from "@kdx/validators/trpc/app/calendar";
import dayjs from "@kdx/dayjs";
import { and, eq, gt, gte, schema } from "@kdx/db";
import { nanoid } from "@kdx/shared";

import type { TProtectedProcedureContext } from "~/procedures";

interface EditOptions {
  ctx: TProtectedProcedureContext;
  input: TEditInputSchema;
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

      return await ctx.db
        .update(schema.eventExceptions)
        .set({
          newDate: input.from,
          title: input.title,
          description: input.description,
        })
        .where(
          and(
            //TODO: Needs to link with teamId from the eventMaster!!
            eq(schema.eventExceptions.id, input.eventExceptionId),
            eq(schema.eventExceptions.newDate, input.selectedTimestamp),
          ),
        );

      //! END OF PROCEDURE
    }

    //* Se estamos aqui, o usuário enviou o masterId. Vamos procurar no eventMaster uma ocorrência do RRULE que bate com o selectedTimestamp.
    const eventMaster = await ctx.db.query.eventMasters.findFirst({
      where: (eventMasters, { and, eq }) =>
        and(
          eq(eventMasters.id, input.eventMasterId),
          eq(eventMasters.teamId, ctx.session.user.activeTeamId),
        ),
      columns: {
        id: true,
        rule: true,
      },
    });
    if (!eventMaster)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Event not found",
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
      return await ctx.db.insert(schema.eventExceptions).values({
        id: nanoid(),
        eventMasterId: eventMaster.id,
        originalDate: foundTimestamp,
        newDate: input.from ?? foundTimestamp,
        title: input.title,
        description: input.description,
      });
      //! END OF PROCEDURE
    }
    //* Se não tivermos title nem description, ainda temos o from. Criamos uma exceção sem eventInfo.
    else
      return await ctx.db.insert(schema.eventExceptions).values({
        id: nanoid(),
        eventMasterId: eventMaster.id,
        originalDate: foundTimestamp,
        newDate: input.from ?? foundTimestamp,
      });

    //* Não temos uma exceção nem uma ocorrência que bate com o selectedTimestamp. Vamos gerar um erro.
  } else if (input.editDefinition === "thisAndFuture") {
    await ctx.db.transaction(async (tx) => {
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
        await tx
          .delete(schema.eventExceptions)
          .where(
            and(
              eq(schema.eventExceptions.eventMasterId, input.eventMasterId),
              gte(schema.eventExceptions.newDate, input.selectedTimestamp),
            ),
          );

      //* Aqui, Vamos editar o eventMaster antigo.
      const oldMaster = await tx.query.eventMasters.findFirst({
        where: (eventMasters, { and, eq }) =>
          and(
            eq(eventMasters.id, input.eventMasterId),
            eq(eventMasters.teamId, ctx.session.user.activeTeamId),
          ),
        columns: {
          rule: true,
          title: true,
          description: true,
          id: true,
        },
      });
      if (!oldMaster)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
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
        await tx
          .update(schema.eventMasters)
          .set({
            title: input.title,
            description: input.description,
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
              byweekday:
                input.weekdays ?? oldRule.options.byweekday ?? undefined,
            }).toString(),
          })
          .where(
            and(
              eq(schema.eventMasters.id, input.eventMasterId),
              eq(schema.eventMasters.teamId, ctx.session.user.activeTeamId),
            ),
          );
        if (shouldDeleteFutureExceptions) return;
        if (input.title ?? input.description)
          await tx
            .update(schema.eventExceptions)
            .set({
              title: input.title ? null : undefined,
              description: input.description ? null : undefined,
            })
            .where(
              and(
                eq(schema.eventExceptions.eventMasterId, input.eventMasterId),
                eq(schema.eventMasters.teamId, ctx.session.user.activeTeamId),
              ),
            );
        return;
      }
      await tx
        .update(schema.eventMasters)
        .set({
          dateUntil: previousOccurence,
          rule: new RRule({
            dtstart: oldRule.options.dtstart,
            until: previousOccurence,
            freq: oldRule.options.freq,
            interval: oldRule.options.interval,
            count: oldRule.options.count ?? undefined,
            byweekday: oldRule.options.byweekday ?? undefined,
          }).toString(),
        })
        .where(
          and(
            eq(schema.eventMasters.id, input.eventMasterId),
            eq(schema.eventMasters.teamId, ctx.session.user.activeTeamId),
          ),
        );

      const newMasterId = nanoid();
      await tx.insert(schema.eventMasters).values({
        id: newMasterId,
        teamId: ctx.session.user.activeTeamId,
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
          byweekday: input.weekdays ?? oldRule.options.byweekday ?? undefined,
        }).toString(),
        title: input.title ?? oldMaster.title,
        description: input.description ?? oldMaster.description,
      });

      if (!shouldDeleteFutureExceptions) {
        await tx
          .update(schema.eventExceptions)
          .set({
            title: input.title ? null : undefined,
            description: input.description ? null : undefined,
            eventMasterId: newMasterId,
          })
          .where(
            and(
              eq(schema.eventExceptions.eventMasterId, oldMaster.id),
              //TODO: Needs to link with teamId from the eventMaster!!
              gte(schema.eventExceptions.newDate, input.selectedTimestamp),
            ),
          );
      }

      return;
    });
  } else if (input.editDefinition === "all") {
    //* Se ele alterou o title ou description, Devemos verificar se ele alterou os dois.
    //* Se ele alterou os dois, devemos apagar o eventInfo de todos os eventExceptions associados ao master e criar um novo eventInfo no master (ou atualizar um existente).
    //* Se ele apagou apenas um dos dois, devemos alterar o eventInfo do master e dos eventException associado ao master caso o eventException possua eventInfo.

    //* Se ele alterou o from, devemos alterar o DateStart, rule e DateUntil do master e remover os newDates dos eventExceptions associados ao master.

    //*Temos que pegar a nova regra se alterou o input.frequency ?? input.interval ?? input.count ?? input.until ou se alterou o input.from

    return await ctx.db.transaction(async (tx) => {
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

        const foundEventMasterForPreviousRule =
          await tx.query.eventMasters.findFirst({
            where: (eventMasters, { and, eq }) =>
              and(
                eq(eventMasters.id, input.eventMasterId),
                eq(eventMasters.teamId, ctx.session.user.activeTeamId),
              ),
            columns: {
              rule: true,
            },
          });
        if (!foundEventMasterForPreviousRule)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Event not found",
          });
        const oldRule = rrulestr(foundEventMasterForPreviousRule.rule);

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

      await tx
        .update(schema.eventMasters)
        .set({
          title: input.title,
          description: input.description,
          dateStart: newRule ? rrulestr(newRule).options.dtstart : undefined,
          dateUntil: input.until,
          rule: newRule,
        })
        .where(
          and(
            eq(schema.eventMasters.id, input.eventMasterId),
            eq(schema.eventMasters.teamId, ctx.session.user.activeTeamId),
          ),
        );

      if (input.from ?? input.until) {
        await tx
          .delete(schema.eventExceptions)
          .where(
            and(
              eq(schema.eventExceptions.eventMasterId, input.eventMasterId),
              input.from
                ? undefined
                : input.until
                  ? gt(schema.eventExceptions.newDate, input.until)
                  : undefined,
            ),
          );
      }
    });
  }
};
