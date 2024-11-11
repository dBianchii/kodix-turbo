import { z } from "zod";

import type { IsomorficT } from "@kdx/locales";

import { adjustDateToMinute } from "../../..";
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
