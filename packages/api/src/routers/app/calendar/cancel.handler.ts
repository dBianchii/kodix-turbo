import { TRPCError } from "@trpc/server";
import { RRule, rrulestr } from "rrule";

import type { TCancelInput } from "@kdx/validators/trpc/app/calendar";
import { and, eq, gte, schema } from "@kdx/db";

import type { TProtectedProcedureContext } from "../../../trpc";

interface CancelOptions {
  ctx: TProtectedProcedureContext;
  input: TCancelInput;
}

export const cancelHandler = async ({ ctx, input }: CancelOptions) => {
  if (input.exclusionDefinition === "single") {
    if (input.eventExceptionId) {
      // return await ctx.prisma.$transaction(async (tx) => {
      //   const deletedException = await tx.eventException.delete({
      //     where: {
      //       id: input.eventExceptionId,
      //     },
      //   });
      //   return await tx.eventCancellation.create({
      //     data: {
      //       eventMasterId: deletedException.eventMasterId,
      //       originalDate: deletedException.originalDate,
      //     },
      //   });
      // });
      return await ctx.db.transaction(async (tx) => {
        const toDeleteException = await tx.query.eventExceptions.findFirst({
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
          .where(eq(schema.eventExceptions.id, input.eventExceptionId!));
        return await tx.insert(schema.eventCancellations).values({
          id: crypto.randomUUID(),
          eventMasterId: toDeleteException.eventMasterId,
          originalDate: toDeleteException.originalDate,
        });
      });
    }

    // return await ctx.prisma.eventCancellation.create({
    //   data: {
    //     EventMaster: {
    //       connect: {
    //         id: input.eventMasterId,
    //       },
    //     },
    //     originalDate: input.date,
    //   },
    // });
    return await ctx.db.insert(schema.eventCancellations).values({
      id: crypto.randomUUID(),
      eventMasterId: input.eventMasterId,
      originalDate: input.date,
    });
  } else if (input.exclusionDefinition === "thisAndFuture") {
    // return await ctx.prisma.$transaction(async (tx) => {
    //   if (input.eventExceptionId) {
    //     const result = await tx.eventException.deleteMany({
    //       where: {
    //         id: input.eventExceptionId,
    //         newDate: {
    //           gte: input.date,
    //         },
    //       },
    //     });
    //     if (!result.count)
    //       throw new TRPCError({
    //         code: "NOT_FOUND",
    //         message: "Exception not found",
    //       });
    //   }

    //   const eventMaster = await tx.eventMaster.findUniqueOrThrow({
    //     where: {
    //       id: input.eventMasterId,
    //     },
    //     select: {
    //       rule: true,
    //       DateStart: true,
    //     },
    //   });

    //   const rule = rrulestr(eventMaster.rule);
    //   const occurences = rule.between(eventMaster.DateStart, input.date, true);
    //   const penultimateOccurence = occurences[occurences.length - 2];

    //   //Here we should delete the eventMaster
    //   if (!penultimateOccurence)
    //     return await tx.eventMaster.delete({
    //       where: {
    //         id: input.eventMasterId,
    //       },
    //     });

    //   const options = RRule.parseString(eventMaster.rule);
    //   options.until = penultimateOccurence;

    //   return await tx.eventMaster.update({
    //     where: {
    //       id: input.eventMasterId,
    //     },
    //     data: {
    //       DateUntil: penultimateOccurence,
    //       rule: new RRule(options).toString(),
    //     },
    //   });
    // });

    return await ctx.db.transaction(async (tx) => {
      if (input.eventExceptionId) {
        await tx.delete(schema.eventExceptions).where(
          and(
            //TODO: add connection to team where teamId is the same as the user's teamId.
            eq(schema.eventExceptions.id, input.eventExceptionId),
            gte(schema.eventExceptions.newDate, input.date),
          ),
        );
        // if (!result.rowsAffected) {
        //   throw new TRPCError({
        //     code: "NOT_FOUND",
        //     message: "Exception not found",
        //   });
        // }
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
  } else if (input.exclusionDefinition === "all") {
    //We should delete the event master. It should automatically cascade down to all other tables
    // return await ctx.prisma.eventMaster.delete({
    //   where: {
    //     id: input.eventMasterId,
    //   },
    // });
    return await ctx.db
      .delete(schema.eventMasters)
      .where(eq(schema.eventMasters.id, input.eventMasterId));
  }
};
