import { resetPasswordTokenSchema } from "../../schema";

// * ----- Exports live below this line ----- *//
export const zResetPasswordTokenUpdate = resetPasswordTokenSchema
  .omit({ id: true })
  .partial();
export const zResetPasswordTokenCreate = resetPasswordTokenSchema;
