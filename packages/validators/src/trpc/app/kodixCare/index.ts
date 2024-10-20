import { z } from "zod";

import type { careTasks } from "@kdx/db/schema";
import type { IsomorficT } from "@kdx/locales";
import dayjs from "@kdx/dayjs";

import { ZNanoId } from "../../..";
import { ZSignInByPasswordInputSchema as default_ZSignInByPasswordInputSchema } from "../../user";

export const ZDoCheckoutForShiftInputSchema = (t: IsomorficT) =>
  z.object({
    date: z.date().max(new Date(), {
      message: t("validators.Checkout time cannot be in the future"),
    }),
  });
export type TDoCheckoutForShiftInputSchema = z.infer<
  ReturnType<typeof ZDoCheckoutForShiftInputSchema>
>;

export const ZGetCareTasksInputSchema = z.object({
  dateStart: z.date(),
  dateEnd: z.date(),
});
export type TGetCareTasksInputSchema = z.infer<typeof ZGetCareTasksInputSchema>;

export const ZSaveCareTaskInputSchema = (t: IsomorficT) =>
  z.object({
    id: ZNanoId,
    doneByUserId: ZNanoId.nullable().optional(),
    doneAt: z
      .date()
      .max(new Date(), {
        message: t("validators.Date cannot be in the future"),
      })
      .transform(
        (date) => dayjs(date).second(0).millisecond(0).toDate(), // Ensure seconds and milliseconds are 0
      )
      .nullable()
      .optional(),
    details: z.string().nullable().optional(),
  });
export type TSaveCareTaskInputSchema = z.infer<
  ReturnType<typeof ZSaveCareTaskInputSchema>
>;

export const ZUnlockMoreTasksInputSchema = z.object({
  selectedTimestamp: z.date(),
});
export type TUnlockMoreTasksInputSchema = z.infer<
  typeof ZUnlockMoreTasksInputSchema
>;

export const ZCheckEmailForRegisterInputSchema = z.object({
  email: z.string().email(),
});
export type TCheckEmailForRegisterInputSchema = z.infer<
  typeof ZCheckEmailForRegisterInputSchema
>;

export const ZSignInByPasswordInputSchema =
  default_ZSignInByPasswordInputSchema;
export type TSignInByPasswordInputSchema = z.infer<
  typeof ZSignInByPasswordInputSchema
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
