import { TRPCError } from "@trpc/server";
import { RRule, rrulestr } from "rrule";

import type { TCancelInputSchema } from "@kdx/validators/trpc/app/calendar";
import { db } from "@kdx/db/client";
import { calendarRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../procedures";
import { deleteEventMasterById } from "../../../../../../db/src/repositories/app/calendar/calendarRepository";

interface CancelOptions {
  ctx: TProtectedProcedureContext;
  input: TCancelInputSchema;
}

export const cancelHandler = async ({ ctx, input }: CancelOptions) => {
  if (input.exclusionDefinition === "single") {
    if (input.eventExceptionId) {
      await db.transaction(async (tx) => {
        const toDeleteException =
          await calendarRepository.findEventExceptionById(
            tx,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            input.eventExceptionId!,
          );
        if (!toDeleteException) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: ctx.t("api.Exception not found"),
          });
        }

        await calendarRepository.deleteEventExceptionById(
          tx,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          input.eventExceptionId!,
        );

        await calendarRepository.createEventCancellation(tx, {
          eventMasterId: toDeleteException.eventMasterId,
          originalDate: toDeleteException.originalDate,
        });
      });
      return;
    }

    await calendarRepository.createEventCancellation(db, {
      eventMasterId: input.eventMasterId,
      originalDate: input.date,
    });

    return;
  } else if (input.exclusionDefinition === "thisAndFuture") {
    await db.transaction(async (tx) => {
      if (input.eventExceptionId) {
        await calendarRepository.deleteEventExceptionsHigherThanDate(tx, {
          teamId: ctx.auth.user.activeTeamId,
          date: input.date,
          eventExceptionId: input.eventExceptionId,
        });
      }

      const eventMaster = await calendarRepository.findEventMasterById(tx, {
        id: input.eventMasterId,
        teamId: ctx.auth.user.activeTeamId,
      });
      if (!eventMaster)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: ctx.t("api.Event master not found"),
        });

      const rule = rrulestr(eventMaster.rule);
      const occurences = rule.between(eventMaster.dateStart, input.date, true);
      const penultimateOccurence = occurences[occurences.length - 2];
      if (!penultimateOccurence)
        await calendarRepository.deleteEventMasterById(tx, input.eventMasterId);

      const options = RRule.parseString(eventMaster.rule);
      options.until = penultimateOccurence;

      return await calendarRepository.updateEventMasterById(tx, {
        id: input.eventMasterId,
        teamId: ctx.auth.user.activeTeamId,
        input: {
          dateUntil: penultimateOccurence,
          rule: new RRule(options).toString(),
        },
      });
    });
    return;
  } else {
    await deleteEventMasterById(db, input.eventMasterId);

    return;
  }
};
