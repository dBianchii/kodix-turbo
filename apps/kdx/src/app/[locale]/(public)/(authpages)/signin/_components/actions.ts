"use server";

import { getLocale } from "next-intl/server";

import { action } from "~/helpers/safe-action/safe-action";
import { redirect } from "~/i18n/routing";
import { api } from "~/trpc/server";
import { ZSigninActionSchema } from "./schema";

export const signInAction = action
  .schema(ZSigninActionSchema)
  .action(async ({ parsedInput: { email, password, callbackUrl } }) => {
    await api.user.signInByPassword({
      email,
      password,
    });
    redirect({
      href: callbackUrl ?? "/team",
      locale: await getLocale(),
    });
  });
