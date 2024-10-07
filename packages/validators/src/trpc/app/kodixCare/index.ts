import { z } from "zod";

import type { IsomorficT } from "@kdx/locales";

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

export const ZSaveCareTaskInputSchema = z.object({
  id: ZNanoId,
  doneByUserId: ZNanoId.nullable().optional(),
  doneAt: z.date().nullable().optional(),
  details: z.string().nullable().optional(),
});
export type TSaveCareTaskInputSchema = z.infer<typeof ZSaveCareTaskInputSchema>;

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

export const ZCreateCareTaskInputSchema = z.object({
  date: z.date(),
  title: z.string(),
  description: z.string().optional(),
});
export type TCreateCareTaskInputSchema = z.infer<
  typeof ZCreateCareTaskInputSchema
>;
