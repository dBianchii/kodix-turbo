import { TRPCError } from "@trpc/server";
import { RRule, rrulestr } from "rrule";

import type { TCancelInputSchema } from "@kdx/validators/trpc/app/calendar";
import { getCalendarRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../procedures";
import { getTeamDbFromCtx } from "../../../getTeamDbFromCtx";

interface CancelOptions {
  ctx: TProtectedProcedureContext;
  input: TCancelInputSchema;
}

export const cancelHandler = async ({ ctx, input }: CancelOptions) => {
  const teamDb = getTeamDbFromCtx(ctx);
  const calendarRepository = getCalendarRepository(teamDb);

  if (input.exclusionDefinition === "single") {
    if (input.eventExceptionId) {
      await teamDb.transaction(async (tx) => {
        const toDeleteException =
          await calendarRepository.findEventExceptionById(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            input.eventExceptionId!,
            tx,
          );
        if (!toDeleteException) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: ctx.t("api.Exception not found"),
          });
        }

        await calendarRepository.deleteEventExceptionById(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          input.eventExceptionId!,
          tx,
        );

        await calendarRepository.createEventCancellation(
          {
            eventMasterId: toDeleteException.eventMasterId,
            originalDate: toDeleteException.originalDate,
            teamId: ctx.auth.user.activeTeamId,
          },
          tx,
        );
      });
      return;
    }

    await calendarRepository.createEventCancellation({
      eventMasterId: input.eventMasterId,
      originalDate: input.date,
      teamId: ctx.auth.user.activeTeamId,
    });

    return;
  } else if (input.exclusionDefinition === "thisAndFuture") {
    await teamDb.transaction(async (tx) => {
      if (input.eventExceptionId) {
        await calendarRepository.deleteEventExceptionsHigherThanDate(
          {
            date: input.date,
            eventExceptionId: input.eventExceptionId,
          },
          tx,
        );
      }

      const eventMaster = await calendarRepository.findEventMasterById(
        input.eventMasterId,
        tx,
      );
      if (!eventMaster)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: ctx.t("api.Event master not found"),
        });

      const rule = rrulestr(eventMaster.rule);
      const occurences = rule.between(eventMaster.dateStart, input.date, true);
      const penultimateOccurence = occurences[occurences.length - 2];
      if (!penultimateOccurence)
        await calendarRepository.deleteEventMasterById(input.eventMasterId, tx);

      const options = RRule.parseString(eventMaster.rule);
      options.until = penultimateOccurence;

      return await calendarRepository.updateEventMasterById(
        {
          id: input.eventMasterId,
          input: {
            dateUntil: penultimateOccurence,
            rule: new RRule(options).toString(),
          },
        },
        tx,
      );
    });
    return;
  } else {
    await calendarRepository.deleteEventMasterById(input.eventMasterId);

    return;
  }
};
