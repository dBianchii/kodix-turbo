"use server";

import { action } from "~/helpers/safe-action/safe-action";
import { ZForgotPasswordSchema } from "./schema";

export const resetPasswordAction = action(ZForgotPasswordSchema, () => {
  //TODO: implement
  throw new Error("Not implemented");
});
