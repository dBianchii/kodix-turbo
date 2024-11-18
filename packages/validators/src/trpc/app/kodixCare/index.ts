import { z } from "zod";

import type { IsomorficT } from "@kdx/locales";
import dayjs from "@kdx/dayjs";

import { adjustDateToMinute, ZNanoId } from "../../..";
import { ZSignInByPasswordInputSchema as default_ZSignInByPasswordInputSchema } from "../../user";

export const ZDoCheckoutForShiftInputSchema = (t: IsomorficT) =>
  z.object({
    notes: z.string().optional(),
    date: z
      .date()
      .max(new Date(), {
        message: t("validators.Checkout time cannot be in the future"),
      })
      .transform(adjustDateToMinute),
  });
export type TDoCheckoutForShiftInputSchema = z.infer<
  ReturnType<typeof ZDoCheckoutForShiftInputSchema>
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

export const ZCreateCareShiftInputSchema = (t: IsomorficT) =>
  z
    .object({
      careGiverId: ZNanoId,
      startAt: z.date(),
      endAt: z.date(),
    })
    .refine((data) => !dayjs(data.startAt).isAfter(data.endAt), {
      message: t("validators.Start time cannot be after end time"),
      path: ["startAt"],
    });
export type TCreateCareShiftInputSchema = z.infer<
  ReturnType<typeof ZCreateCareShiftInputSchema>
>;

export const ZFindOverlappingShiftsInputSchema = z.object({
  start: z.date(),
  end: z.date(),
});
export type TFindOverlappingShiftsInputSchema = z.infer<
  typeof ZFindOverlappingShiftsInputSchema
>;

export const ZEditCareShiftInputSchema = z.object({
  id: ZNanoId,
  startAt: z.date().optional(),
  endAt: z.date().optional(),
});
export type TEditCareShiftInputSchema = z.infer<
  typeof ZEditCareShiftInputSchema
>;
