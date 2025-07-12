import { resetPasswordTokenSchema } from "../../schema";

// * ----- Exports live below this line ----- *//
export const zResetPasswordTokenUpdate = resetPasswordTokenSchema
  .omit({ id: true })
  .deepPartial();
export const zResetPasswordTokenCreate = resetPasswordTokenSchema;
