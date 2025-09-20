import z from "zod";

import type { careTasks } from "@kdx/db/schema";
import type { IsomorficT } from "@kdx/locales";
import dayjs from "@kdx/dayjs";

import { adjustDateToMinute, ZNanoId } from "../../../..";

export const ZGetCareTasksInputSchema = z.object({
  dateStart: z.date().transform(adjustDateToMinute),
  dateEnd: z.date().transform(adjustDateToMinute),
});
export type TGetCareTasksInputSchema = z.infer<typeof ZGetCareTasksInputSchema>;

export const ZEditCareTaskInputSchema = (t: IsomorficT) =>
  z.object({
    id: ZNanoId,
    doneAt: z
      .date()
      .max(new Date(), {
        message: t("validators.Date cannot be in the future"),
      })
      .transform(adjustDateToMinute)
      .nullable()
      .optional(),
    details: z.string().nullable().optional(),
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
    title: z.string(),
    description: z.string().optional(),
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
