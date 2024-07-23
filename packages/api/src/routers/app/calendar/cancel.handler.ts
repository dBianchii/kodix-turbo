import { TRPCError } from "@trpc/server";
import { RRule, rrulestr } from "rrule";

import type { TCancelInputSchema } from "@kdx/validators/trpc/app/calendar";
import { and, eq, gte, inArray } from "@kdx/db";
import * as schema from "@kdx/db/schema";

import type { TProtectedProcedureContext } from "../../../procedures";

interface CancelOptions {
  ctx: TProtectedProcedureContext;
  input: TCancelInputSchema;
}

export const cancelHandler = async ({ ctx, input }: CancelOptions) => {
  if (input.exclusionDefinition === "single") {
    if (input.eventExceptionId) {
      await ctx.db.transaction(async (tx) => {
        const toDeleteException = await tx.query.eventExceptions.findFirst({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          where: (asd, { eq }) => eq(asd.id, input.eventExceptionId!),
          columns: {
            eventMasterId: true,
            originalDate: true,
          },
        });
        if (!toDeleteException) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Exception not found",
          });
        }
        await tx
          .delete(schema.eventExceptions)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .where(eq(schema.eventExceptions.id, input.eventExceptionId!));
        return await tx.insert(schema.eventCancellations).values({
          eventMasterId: toDeleteException.eventMasterId,
          originalDate: toDeleteException.originalDate,
        });
      });
      return;
    }

    await ctx.db.insert(schema.eventCancellations).values({
      eventMasterId: input.eventMasterId,
      originalDate: input.date,
    });
    return;
  } else if (input.exclusionDefinition === "thisAndFuture") {
    await ctx.db.transaction(async (tx) => {
      if (input.eventExceptionId) {
        const allEventMastersIdsForThisTeamQuery = ctx.db
          .select({ id: schema.eventMasters.id })
          .from(schema.eventMasters)
          .where(eq(schema.eventMasters.teamId, ctx.session.user.activeTeamId));

        await tx
          .delete(schema.eventExceptions)
          .where(
            and(
              inArray(
                schema.eventExceptions.eventMasterId,
                allEventMastersIdsForThisTeamQuery,
              ),
              eq(schema.eventExceptions.id, input.eventExceptionId),
              gte(schema.eventExceptions.newDate, input.date),
            ),
          );
      }
      const eventMaster = await tx.query.eventMasters.findFirst({
        where: eq(schema.eventMasters.id, input.eventMasterId),
        columns: {
          rule: true,
          dateStart: true,
        },
      });
      if (!eventMaster)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event master not found",
        });

      const rule = rrulestr(eventMaster.rule);
      const occurences = rule.between(eventMaster.dateStart, input.date, true);
      const penultimateOccurence = occurences[occurences.length - 2];
      if (!penultimateOccurence)
        await tx
          .delete(schema.eventMasters)
          .where(eq(schema.eventMasters.id, input.eventMasterId));

      const options = RRule.parseString(eventMaster.rule);
      options.until = penultimateOccurence;

      return await tx
        .update(schema.eventMasters)
        .set({
          dateUntil: penultimateOccurence,
          rule: new RRule(options).toString(),
        })
        .where(eq(schema.eventMasters.id, input.eventMasterId));
    });
    return;
  } else {
    await ctx.db
      .delete(schema.eventMasters)
      .where(eq(schema.eventMasters.id, input.eventMasterId));
    return;
  }
};
