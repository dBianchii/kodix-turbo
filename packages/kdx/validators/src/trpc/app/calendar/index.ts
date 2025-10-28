import dayjs from "@kodix/dayjs";
import { Frequency } from "rrule";
import z from "zod";

import type { eventMasters } from "@kdx/db/schema";

import { adjustDateToMinute } from "../../..";

export const ZCancelInputSchema = z
  .object({
    eventExceptionId: z.string().optional(),
    eventMasterId: z.string(),
  })
  .and(
    z.discriminatedUnion("exclusionDefinition", [
      z.object({
        exclusionDefinition: z.literal("all"),
      }),
      z.object({
        date: z.date().transform(adjustDateToMinute),
        exclusionDefinition: z.union([
          z.literal("thisAndFuture"),
          z.literal("single"),
        ]),
      }),
    ]),
  );
export type TCancelInputSchema = z.infer<typeof ZCancelInputSchema>;

export const ZCreateInputSchema = z
  .object({
    count: z.number().int().positive().optional(),
    description: z.string().optional(),
    frequency: z.enum(Frequency),
    from: z.date().transform(adjustDateToMinute),
    interval: z.number().int().positive(),
    title: z.string().min(1),
    type: z.custom<typeof eventMasters.$inferSelect.type>().optional(),
    until: z
      .date()
      .transform((date) => dayjs(date).endOf("day").toDate())
      .optional(),
    weekdays: z.number().array().optional(),
  })
  .refine((data) => {
    if (data.weekdays && data.frequency !== Frequency.WEEKLY) return false;
    return true;
  });
export type TCreateInputSchema = z.infer<typeof ZCreateInputSchema>;

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
//* I cannot send count with single
//* I cannot send interval with single
//* I cannot send until with single
//* I cannot send frequency with single
//* I cannot send weekdays with single
//* I CAN send from with all, but from cannot be at a different date (day, year, or month) from the selected timestamp event's master/exception. Only hour.
export const ZEditInputSchema = z
  .object({
    description: z.string().optional(),
    eventExceptionId: z.string().optional(),
    eventMasterId: z.string(),
    selectedTimestamp: z.date(),
    title: z.string().optional(),
    type: z.custom<typeof eventMasters.$inferSelect.type>().optional(),
  })
  .and(
    z.discriminatedUnion("editDefinition", [
      z.object({
        count: z.number().nullish().optional(),
        editDefinition: z.enum(["thisAndFuture"]),

        frequency: z.enum(Frequency).optional(),
        from: z.date().transform(adjustDateToMinute).optional(),
        interval: z.number().optional(),
        until: z
          .date()
          .transform((date) => dayjs(date).endOf("day").toDate())
          .optional(),
        weekdays: z.number().array().optional(),
      }),
      z.object({
        count: z.number().nullish().optional(),
        editDefinition: z.literal("all"),

        frequency: z.enum(Frequency).optional(),

        from: z
          .string()
          .refine(
            (value) => timeRegex.test(value),
            "Invalid time format. Should be HH:MM",
          )
          .optional(),
        interval: z.number().optional(),
        until: z
          .date()
          .transform((date) => dayjs(date).endOf("day").toDate())
          .optional(),
        weekdays: z.number().array().optional(),
      }),
      z.object({
        editDefinition: z.literal("single"),

        from: z.date().transform(adjustDateToMinute).optional(),
      }),
    ]),
  );
export type TEditInputSchema = z.infer<typeof ZEditInputSchema>;

export const ZGetAllInputSchema = z.object({
  dateEnd: z.date().transform(adjustDateToMinute),
  dateStart: z.date().transform(adjustDateToMinute),
});
export type TGetAllInputSchema = z.infer<typeof ZGetAllInputSchema>;
