import { Frequency } from "rrule";
import { z } from "zod/v4";

import type { eventMasters } from "@kdx/db/schema";
import dayjs from "@kdx/dayjs";

import { adjustDateToMinute } from "../../..";

export const ZCancelInputSchema = z
  .object({
    eventMasterId: z.string(),
    eventExceptionId: z.string().optional(),
  })
  .and(
    z.discriminatedUnion("exclusionDefinition", [
      z.object({
        exclusionDefinition: z.literal("all"),
      }),
      z.object({
        exclusionDefinition: z.union([
          z.literal("thisAndFuture"),
          z.literal("single"),
        ]),
        date: z.date().transform(adjustDateToMinute),
      }),
    ]),
  );
export type TCancelInputSchema = z.infer<typeof ZCancelInputSchema>;

export const ZCreateInputSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().optional(),
    from: z.date().transform(adjustDateToMinute),
    until: z
      .date()
      .transform((date) => dayjs(date).endOf("day").toDate())
      .optional(),
    interval: z.number().int().positive(),
    count: z.number().int().positive().optional(),
    frequency: z.enum(Frequency),
    weekdays: z.number().array().optional(),
    type: z.custom<typeof eventMasters.$inferSelect.type>().optional(),
  })
  .refine((data) => {
    if (data.weekdays && data.frequency !== Frequency.WEEKLY) return false;
    return true;
  });
export type TCreateInputSchema = z.infer<typeof ZCreateInputSchema>;

//* I cannot send count with single
//* I cannot send interval with single
//* I cannot send until with single
//* I cannot send frequency with single
//* I cannot send weekdays with single
//* I CAN send from with all, but from cannot be at a different date (day, year, or month) from the selected timestamp event's master/exception. Only hour.
export const ZEditInputSchema = z
  .object({
    eventMasterId: z.string(),
    eventExceptionId: z.string().optional(),
    selectedTimestamp: z.date(),
    title: z.string().optional(),
    description: z.string().optional(),
    type: z.custom<typeof eventMasters.$inferSelect.type>().optional(),
  })
  .and(
    z.discriminatedUnion("editDefinition", [
      z.object({
        editDefinition: z.enum(["thisAndFuture"]),

        frequency: z.enum(Frequency).optional(),
        until: z
          .date()
          .transform((date) => dayjs(date).endOf("day").toDate())
          .optional(),
        interval: z.number().optional(),
        count: z.number().nullish().optional(),
        from: z.date().transform(adjustDateToMinute).optional(),
        weekdays: z.number().array().optional(),
      }),
      z.object({
        editDefinition: z.literal("all"),

        frequency: z.enum(Frequency).optional(),
        until: z
          .date()
          .transform((date) => dayjs(date).endOf("day").toDate())
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
      }),
      z.object({
        editDefinition: z.literal("single"),

        from: z.date().transform(adjustDateToMinute).optional(),
      }),
    ]),
  );
export type TEditInputSchema = z.infer<typeof ZEditInputSchema>;

export const ZGetAllInputSchema = z.object({
  dateStart: z.date().transform(adjustDateToMinute),
  dateEnd: z.date().transform(adjustDateToMinute),
});
export type TGetAllInputSchema = z.infer<typeof ZGetAllInputSchema>;
