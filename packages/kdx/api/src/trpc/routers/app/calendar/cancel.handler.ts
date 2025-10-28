import { TRPCError } from "@trpc/server";
import { RRule, rrulestr } from "rrule";

import type { TCancelInputSchema } from "@kdx/validators/trpc/app/calendar";
import { db } from "@kdx/db/client";
import { calendarRepository } from "@kdx/db/repositories";

import type { TProtectedProcedureContext } from "../../../procedures";

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
            // biome-ignore lint/style/noNonNullAssertion: <already checked>
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
          tx,
          // biome-ignore lint/style/noNonNullAssertion: <already checked>
          input.eventExceptionId!,
        );

        await calendarRepository.createEventCancellation(
          {
            eventMasterId: toDeleteException.eventMasterId,
            originalDate: toDeleteException.originalDate,
          },
          tx,
        );
      });
      return;
    }

    await calendarRepository.createEventCancellation(
      {
        eventMasterId: input.eventMasterId,
        originalDate: input.date,
      },
      db,
    );

    return;
  }
  if (input.exclusionDefinition === "thisAndFuture") {
    await db.transaction(async (tx) => {
      if (input.eventExceptionId) {
        await calendarRepository.deleteEventExceptionsHigherThanDate(tx, {
          date: input.date,
          eventExceptionId: input.eventExceptionId,
          teamId: ctx.auth.user.activeTeamId,
        });
      }

      const eventMaster = await calendarRepository.findEventMasterById(
        {
          id: input.eventMasterId,
          teamId: ctx.auth.user.activeTeamId,
        },
        tx,
      );
      if (!eventMaster)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: ctx.t("api.Event master not found"),
        });

      const rule = rrulestr(eventMaster.rule);
      const occurences = rule.between(eventMaster.dateStart, input.date, true);
      const penultimateOccurence = occurences.at(-2);
      if (!penultimateOccurence)
        await calendarRepository.deleteEventMasterById(tx, input.eventMasterId);

      const options = RRule.parseString(eventMaster.rule);
      options.until = penultimateOccurence;

      return await calendarRepository.updateEventMasterById(
        {
          id: input.eventMasterId,
          input: {
            dateUntil: penultimateOccurence,
            rule: new RRule(options).toString(),
          },
          teamId: ctx.auth.user.activeTeamId,
        },
        tx,
      );
    });
    return;
  }
  await calendarRepository.deleteEventMasterById(db, input.eventMasterId);

  return;
};
