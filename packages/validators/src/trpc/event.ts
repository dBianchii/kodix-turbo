import { Frequency } from "rrule";
import { z } from "zod";

import dayjs from "@kdx/dayjs";

export const ZCancelInput = z
  .object({
    eventMasterId: z.string(),
    eventExceptionId: z.string().optional(),
  })
  .and(
    z.union([
      z.object({
        exclusionDefinition: z.literal("all"),
      }),
      z.object({
        date: z.date(),
        exclusionDefinition: z.union([
          z.literal("thisAndFuture"),
          z.literal("single"),
        ]),
      }),
    ]),
  );
export type TCancelInput = z.infer<typeof ZCancelInput>;

export const ZCreateInput = z
  .object({
    title: z.string(),
    description: z.string().optional(),
    from: z.date(),
    until: z
      .date()
      .transform((date) => dayjs(date).endOf("day").toDate())
      .optional(),
    interval: z.number().optional(),
    count: z.number().optional(),
    frequency: z.nativeEnum(Frequency),
    weekdays: z.number().array().optional(),
  })
  .refine((data) => {
    if (data.weekdays && data.frequency !== Frequency.WEEKLY) return false;
    return true;
  });
export type TCreateInput = z.infer<typeof ZCreateInput>;

//* I cannot send count with single
//* I cannot send interval with single
//* I cannot send until with single
//* I cannot send frequency with single
//* I cannot send weekdays with single
//* I CAN send from with all, but from cannot be at a different date (day, year, or month) from the selected timestamp event's master/exception. Only hour.
export const ZEditInput = z
  .object({
    eventMasterId: z.string(),
    eventExceptionId: z.string().optional(),
    selectedTimestamp: z.date(),
    title: z.string().optional(),
    description: z.string().optional(),
  })
  .and(
    z.union([
      z.object({
        frequency: z.nativeEnum(Frequency).optional(),
        until: z
          .date()
          .transform((date) => dayjs(date).endOf("day").toDate())
          .optional(),
        interval: z.number().optional(),
        count: z.number().nullish().optional(),
        from: z.date().optional(),
        weekdays: z.number().array().optional(),

        editDefinition: z.enum(["thisAndFuture"]),
      }),
      z.object({
        frequency: z.nativeEnum(Frequency).optional(),
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

        editDefinition: z.literal("all"),
      }),
      z.object({
        from: z.date().optional(),

        editDefinition: z.literal("single"),
      }),
    ]),
  );
export type TEditInput = z.infer<typeof ZEditInput>;

export const ZGetAllInput = z.object({
  dateStart: z.date(),
  dateEnd: z.date(),
});
export type TGetAllInput = z.infer<typeof ZGetAllInput>;
