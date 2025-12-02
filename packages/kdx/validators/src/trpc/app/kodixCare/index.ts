import dayjs from "@kodix/dayjs";
import { ZNanoId } from "@kodix/shared/utils";
import z from "zod";

import type { IsomorficT } from "@kdx/locales";

import { adjustDateToMinute } from "../../..";
import { ZSignInByPasswordInputSchema as default_ZSignInByPasswordInputSchema } from "../../user";

export const ZDoCheckoutForShiftInputSchema = (t: IsomorficT) =>
  z.object({
    date: z
      .date()
      .max(new Date(), {
        message: t("validators.Checkout time cannot be in the future"),
      })
      .transform(adjustDateToMinute),
    notes: z.string().optional(),
  });
export type TDoCheckoutForShiftInputSchema = z.infer<
  ReturnType<typeof ZDoCheckoutForShiftInputSchema>
>;

export const ZCheckEmailForRegisterInputSchema = z.object({
  email: z.email(),
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
      endAt: z.date().transform(adjustDateToMinute),
      startAt: z.date().transform(adjustDateToMinute),
    })
    .refine((data) => !dayjs(data.startAt).isAfter(data.endAt), {
      message: t("validators.Start time cannot be after end time"),
      path: ["startAt"],
    });
export type TCreateCareShiftInputSchema = z.infer<
  ReturnType<typeof ZCreateCareShiftInputSchema>
>;

export const ZFindOverlappingShiftsInputSchema = z.object({
  end: z.date().transform(adjustDateToMinute),
  inclusive: z.boolean().default(false).optional(),
  start: z.date().transform(adjustDateToMinute),
});
export type TFindOverlappingShiftsInputSchema = z.infer<
  typeof ZFindOverlappingShiftsInputSchema
>;

export const ZEditCareShiftInputSchema = (t: IsomorficT) =>
  z
    .object({
      careGiverId: ZNanoId.optional(),
      checkIn: z.date().transform(adjustDateToMinute).nullable().optional(),
      checkOut: z.date().transform(adjustDateToMinute).nullable().optional(),
      endAt: z.date().transform(adjustDateToMinute).optional(),
      finishedByUserId: ZNanoId.nullable().optional(),
      id: ZNanoId,
      notes: z.string().optional(),
      startAt: z.date().transform(adjustDateToMinute).optional(),
    })
    .refine(
      (data) => {
        if (data.startAt && data.endAt)
          return !dayjs(data.startAt).isAfter(data.endAt);

        return true;
      },
      {
        message: t("validators.Start time cannot be after end time"),
        path: ["startAt"],
      },
    )
    .refine(
      (data) => {
        if (data.checkIn && data.checkOut)
          return !dayjs(data.checkIn).isAfter(data.checkOut);

        return true;
      },
      {
        message: t("validators.Start time cannot be after end time"),
        path: ["checkIn"],
      },
    );
export type TEditCareShiftInputSchema = z.infer<
  ReturnType<typeof ZEditCareShiftInputSchema>
>;

export const ZDeleteCareShiftInputSchema = z.object({ id: ZNanoId });
export type TDeleteCareShiftInputSchema = z.infer<
  typeof ZDeleteCareShiftInputSchema
>;
