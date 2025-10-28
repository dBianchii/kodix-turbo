import dayjs from "@kodix/dayjs";
import z from "zod";

import type { careTasks } from "@kdx/db/schema";
import type { IsomorficT } from "@kdx/locales";

import { adjustDateToMinute, ZNanoId } from "../../../..";

export const ZGetCareTasksInputSchema = z.object({
  dateEnd: z.date().transform(adjustDateToMinute),
  dateStart: z.date().transform(adjustDateToMinute),
});
export type TGetCareTasksInputSchema = z.infer<typeof ZGetCareTasksInputSchema>;

export const ZEditCareTaskInputSchema = (t: IsomorficT) =>
  z.object({
    details: z.string().nullable().optional(),
    doneAt: z
      .date()
      .max(new Date(), {
        message: t("validators.Date cannot be in the future"),
      })
      .transform(adjustDateToMinute)
      .nullable()
      .optional(),
    id: ZNanoId,
  });
export type TEditCareTaskInputSchema = z.infer<
  ReturnType<typeof ZEditCareTaskInputSchema>
>;

export const ZUnlockMoreTasksInputSchema = z.object({
  selectedTimestamp: z.date().transform(adjustDateToMinute),
});
export type TUnlockMoreTasksInputSchema = z.infer<
  typeof ZUnlockMoreTasksInputSchema
>;

export const ZCreateCareTaskInputSchema = (t: IsomorficT) =>
  z.object({
    date: z
      .date()
      .min(new Date(), {
        message: t("validators.Date cannot be in the past"),
      })
      .transform(
        (date) => dayjs(date).second(0).millisecond(0).toDate(), // Ensure seconds and milliseconds are 0
      ),
    description: z.string().optional(),
    title: z.string(),
    type: z.custom<typeof careTasks.$inferInsert.type>(),
  });
export type TCreateCareTaskInputSchema = z.infer<
  ReturnType<typeof ZCreateCareTaskInputSchema>
>;

export const ZDeleteCareTaskInputSchema = z.object({ id: z.string() });
export type TDeleteCareTaskInputSchema = z.infer<
  typeof ZDeleteCareTaskInputSchema
>;

export const ZGetCareShiftsByCareTaskInputSchema = z.object({ id: z.string() });
export type TGetCareShiftsByCareTaskInputSchema = z.infer<
  typeof ZGetCareShiftsByCareTaskInputSchema
>;
