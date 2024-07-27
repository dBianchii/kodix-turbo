"use server";

import { redirect } from "@kdx/locales/navigation";

import { action } from "~/helpers/safe-action/safe-action";
import { api } from "~/trpc/server";
import { ZSigninActionSchema } from "./schema";

export const signInAction = action
  .schema(ZSigninActionSchema)
  .action(async ({ parsedInput: { email, password, callbackUrl } }) => {
    await api.user.signInByPassword({
      email,
      password,
    });
    redirect(callbackUrl ?? "/team");
  });
