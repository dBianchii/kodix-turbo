import { TRPCError } from "@trpc/server";
import { RRule, rrulestr } from "rrule";

import type { Session } from "@kdx/auth";
import type { PrismaClient } from "@kdx/db";
import type { TCancelInput } from "@kdx/validators/trpc/app/calendar";

interface CancelOptions {
  ctx: {
    session: Session;
    prisma: PrismaClient;
  };
  input: TCancelInput;
}

export const cancelHandler = async ({ ctx, input }: CancelOptions) => {
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
      const occurences = rule.between(eventMaster.DateStart, input.date, true);
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
};
